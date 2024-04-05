import { PushDeltaState } from '../../../Types/index.js';
import { ServerError } from '../../api/errors.js';
import { WatcherStore, FileIgnorer } from '../../filesystem.js';
import {
	ResourceType,
	PushAction,
	ResourceThemeMapping,
	ResourceThemeMappingKeys,
} from '../Types.js';
import { ACTIONS, RESOURCES } from '../constants.js';
import { SDK, SDKUtilities } from '../index.js';
import { ResourceTask } from './Tasks/ResourceTask.js';
import {
	TaskManagerConfig,
	ResourceTaskSummary,
	TaskPayload,
	PullTaskPayload,
	PushTaskPayload,
	ResourcePullObjects,
} from './Types.js';
import { TASK_STATES } from './constants.js';
import {
	genPullTaskInstance,
	genPushTaskInstance,
	genResourcePullFilePath,
	isPullTask,
	isPushTask,
	isTaskPushPayload,
} from './utilities.js';

/**
 * Architecture:
 * - Resources represent either SitePage, GlobalElements, Settings & ThemeFiles which can both exist Serverside
 * and on the FileSystem.
 * - Actions sync FileSystem representation with Server Resprenstation by assigning either a PushAction or PullAction to a resource.
 * - ResourceTask represents a sync action on a Resource.
 * - The TaskManager class below is responsible for generating/validating and executing a ResourceTask.
 * - The TaskManager can add tasks through its public addTasks* method.
 * - The TaskManger expects all task execution to happen through public executeTasks generator function.
 *
 * Expected to be used as a singleton throughout the command lifecycle. with addTasks* and excetuteTasks
 *
 */
export class TaskManager {
	tasks: InstanceType<typeof ResourceTask>[] = [];
	sdk: InstanceType<typeof SDK>;
	siteId: string;
	siteThemeId: string;
	themeDir: string;
	healthy = true;
	constructor(
		taskManagerConfig: TaskManagerConfig,
	) {
		const { sdk,
			siteId,
			siteThemeId,
			themeDir } = taskManagerConfig;
		this.sdk = sdk;
		this.siteId = siteId;
		this.siteThemeId = siteThemeId;
		this.themeDir = themeDir;
	}

	/**
	 * Generates tasks from the deltaobject to bring remote state to be the same as local state.
	 * @param deltaObject Represents the CUD on each local filepath.
	 * @returns Promise<void>
	 */
	public addTasksFromDeltaPushState(deltaObject: PushDeltaState): void {
		const tasks = TaskManager.converDeltaStateToTasks(deltaObject);
		this.addNewTasks(tasks);
	}

	/**
	 * Generates tasks from watcher store, which represents FileChanges from the watcher.
	 * @param watcherStore Represents the CUD on each local filepath.
	 * @returns Promise<void>
	 */
	public addTasksFromThemeWatcherStore(watcherStore: WatcherStore): void {
		const tasks = TaskManager.convertWatcherStoreToTasks(watcherStore);
		this.addNewTasks(tasks);
	}

	/**
	 * Generates tasks from remote Theme Respresentation.
	 * @param resourceThemeMapping Represents remote theme state.
	 * @param fileIgnorer File ignorer to filter task list.
	 * @returns Promise<void>
	 */
	public addTasksFromPullThemeResources(resourceThemeMapping: ResourceThemeMapping, fileIgnorer: FileIgnorer): void {
		const tasks = TaskManager.convertPullResouceThemeMappingToTasks(resourceThemeMapping, fileIgnorer);
		this.addNewTasks(tasks);
	}

	public hasTasks(): boolean {
		return this.tasks.length > 0;
	}

	public isHealthy(): boolean {
		return this.healthy;
	}

	/**
	 * Implemented as a generator function, that when called will execute all tasks yielding to caller
	 * as tasks are exectuted chunks according to parallelCoutns argument. At every yield a summary of all tasks
	 * is returned so caller can display TaskManager status to interface.
	 * Implemmented as a generator so that caller is not responsible for execting cleanTasks lifecycle method.
	 * @param parallelCount Tells task manager to execture X number of tasks concurrently.
	 * @returns AsyncGenerator<ResourceTaskSummary[], void, void>
	 */
	public async * executeTasks(parallelCount: number): AsyncGenerator<ResourceTaskSummary[], void, void> {
		yield this.getTasksSummaries();
		let start = 0;
		while (start < this.tasks.length) {
			const end = Math.min(this.tasks.length, start + parallelCount);
			await this.executeTasksSlice(start, end);
			yield this.getTasksSummaries();
			start = end;
		}

		this.cleanTasks();
	}

	/**
	 * This function looks at the error that the task encountered.
	 * If it its a 403 server error likely related to token permissions,
	 * The the task manager will cancel all other tasks for exection
	 * and mark itself as not healthy so no callers can add tasks.
	 * @param taskWithErrors []
	 * @return void
	 */
	private handleTaskErrors(taskWithErrors: ResourceTask[]): void {
		// check tasks for permissions errors.
		let hasPullPermissionError = false;
		let hasPushPermissionError = false;
		for (const task of taskWithErrors) {
			if (hasPullPermissionError && hasPushPermissionError) {
				// no need to keep doing, cancel everything.
				break;
			}

			if (
				task.error &&
				task.error instanceof ServerError &&
				task.error.isPermissionsError()
			) {
				if (isPushTask(task)) {
					hasPushPermissionError = true;
				}

				if (isPullTask(task)) {
					hasPullPermissionError = true;
				}
			}
		}

		this.healthy = !hasPullPermissionError && !hasPushPermissionError;

		// Cancel tasks that will run into the same problem
		for (const task of this.tasks) {
			if (task.state === TASK_STATES.pending &&
				(
					(hasPullPermissionError && isPullTask(task)) ||
					(hasPushPermissionError && isPushTask(task))
				)
			) {
				task.state = TASK_STATES.cancelled;
				task.cancelledReason = 'Cancelled because of missing permissions';
			}
		}
	}

	private getTasksSummaries(): ResourceTaskSummary [] {
		return this.tasks.map(task => task.getSummary());
	}

	private async executeTasksSlice(start: number, end: number): Promise<ResourceTaskSummary[]> {
		const tasks = this.getTasksSlice(start, end);
		const taskWithErrors: ResourceTask[] = [];
		const results = await Promise.all(tasks.map(async (task: ResourceTask) => {
			if (task.state === TASK_STATES.pending && await task.isValid()) {
				await task.run();
				if (task.error) {
					taskWithErrors.push(task);
				}
			}

			return task.getSummary();
		}));
		this.handleTaskErrors(taskWithErrors);
		return results;
	}

	/**
	 * Lifecycle method to remove tasks from state.
	 * Also a central place to re-schedule tasks if needed.
	 * @returns void
	 */
	private cleanTasks():void {
		this.tasks = [];
	}

	private getTasksSlice(start: number, end: number): ResourceTask[] {
		return this.tasks.slice(start, end);
	}

	/**
	 * To prevent collisions from server side resources,
	 * The task manager will order tasks by deletion, updates and creations
	 * with respect to each resource.
	 * @returns void
	 */
	private orderTasks(): void {
		const actionOrder = {
			download: 3,
			delete: 2,
			update: 1,
			create: 0,
		};
		const sortComparator = (taskA: ResourceTask, taskB: ResourceTask): number => {
			return actionOrder[taskB.action] - actionOrder[taskA.action];
		};

		// prioritize themeFiles.
		const themeFileTasks = this.tasks
			.filter((task: ResourceTask) => task.resource === RESOURCES.theme)
			.sort(sortComparator);

		// global elements.
		const globalElementFiles = this.tasks
			.filter(task => task.resource === RESOURCES.globalElement)
			.sort(sortComparator);

		// sitePages.
		const sitePages = this.tasks
			.filter(task => task.resource === RESOURCES.page)
			.sort(sortComparator);

		// settings
		const settings = this.tasks
			.filter(task => task.resource === RESOURCES.setting)
			.sort(sortComparator);

		this.tasks = [
			...themeFileTasks,
			...globalElementFiles,
			...sitePages,
			...settings,
		];
	}

	private findResourceTaskIndex(resource: ResourceType, filePath: string): number {
		for (let i = 0; i < this.tasks.length; i++) {
			if (
				this.tasks[i].resource === resource &&
				this.tasks[i].filePath === filePath
			) {
				return i;
			}
		}

		return -1;
	}

	private loadTasks(tasks: TaskPayload[]): void {
		for (const newTaskPayload of tasks) {
			const { resource, filePath } = newTaskPayload;
			const taskIndex = this.findResourceTaskIndex(resource, filePath);
			let newTask;
			if (isTaskPushPayload(newTaskPayload)) {
				const { action } = newTaskPayload as PushTaskPayload;
				newTask = genPushTaskInstance({
					resource,
					action,
					sdk: this.sdk,
					siteId: this.siteId,
					siteThemeId: this.siteThemeId,
					filePath,
					themeDir: this.themeDir,
				});
			} else {
				const { resourceObject, action } = newTaskPayload as PullTaskPayload;
				newTask = genPullTaskInstance({
					resource,
					action,
					sdk: this.sdk,
					siteId: this.siteId,
					siteThemeId: this.siteThemeId,
					filePath,
					themeDir: this.themeDir,
				}, resourceObject);
			}

			if (taskIndex > 0) {
				// Task manager can only have one action for a resource at a time.
				// Override the current task with new one.
				this.tasks[taskIndex] = newTask;
			} else {
				this.tasks.push(newTask);
			}
		}
	}

	private addNewTasks(tasks: TaskPayload[]): void {
		if (!this.healthy) {
			throw new Error('TaskManager Not Healthy');
		}

		const validatedTaskPayloads = tasks.map(task => this.cleanTaskPayload(task));
		this.loadTasks(validatedTaskPayloads);
		this.orderTasks();
	}

	static convertPullResouceThemeMappingToTasks(
		resourceThemeMapping: ResourceThemeMapping,
		fileIgnorer: FileIgnorer,
	): PullTaskPayload[] {
		const tasks = [];
		const resourceThemeMapper = {
			themeFiles: RESOURCES.theme,
			globalElements: RESOURCES.globalElement,
			sitePages: RESOURCES.page,
			settings: RESOURCES.setting,
		};
		const action = ACTIONS.download;
		for (const entry of Object.keys(resourceThemeMapper) as ResourceThemeMappingKeys[]) {
			const resource = resourceThemeMapper[entry];
			for (const resourceObject of resourceThemeMapping[entry]) {
				const filePath = genResourcePullFilePath(resource, resourceObject as ResourcePullObjects);
				if (fileIgnorer.accepts(filePath)) {
					tasks.push({
						action,
						resource,
						resourceObject,
						filePath,
					});
				}
			}
		}

		return tasks;
	}

	static converDeltaStateToTasks(deltaObject: PushDeltaState): PushTaskPayload[] {
		const tasks = [];
		for (const action of Object.keys(deltaObject) as PushAction []) {
			for (const fileState of deltaObject[action]) {
				const resource = SDKUtilities.getFileType(fileState.path);
				if (resource) {
					const task: TaskPayload = {
						action,
						resource,
						filePath: fileState.path,
					};
					tasks.push(task);
				}
			}
		}

		return tasks;
	}

	static convertWatcherStoreToTasks(watcherStore: WatcherStore): PushTaskPayload [] {
		const tasks = [];
		for (const action of Object.keys(watcherStore) as PushAction []) {
			for (const filePath of Object.keys(watcherStore[action])) {
				const resource = SDKUtilities.getFileType(filePath);
				if (resource) {
					const task: TaskPayload = {
						action,
						resource,
						filePath,
					};
					tasks.push(task);
				}
			}
		}

		return tasks;
	}

	/**
	 * Used to overwrite update if SitePages to CreateSitePage if no Id exists.
	 * @param task Task Payload to be cleaned.
	 * @returns TaskPayload
	 */
	private cleanTaskPayload(task: TaskPayload): TaskPayload {
		if (task.resource === RESOURCES.page && task.action === ACTIONS.update) {
			const { filePath } = task;
			const sitePageId = this.sdk.getPageIdFromStore(filePath);
			if (!sitePageId) {
				return {
					...task,
					action: ACTIONS.create,
				};
			}
		}

		return task;
	}
}
