import { join } from 'node:path';
import { strings } from '../../../../translations/index.js';
import { ResourceType, Action } from '../../Types.js';
import { ACTIONS } from '../../constants.js';
import { SDK } from '../../index.js';
import {
	TaskStatesTypes, ResourceTaskConfig, ResourceTaskSummary,
} from '../Types.js';
import { TASK_STATES } from '../constants.js';
import { TaskError } from '../Errors/TaskError.js';
import { GENERIC_ERROR_CODE } from '../Errors/constants.js';
import { ServerError } from '../../../api/errors.js';

export abstract class ResourceTask {
	resource: ResourceType;
	action: Action;
	sdk: InstanceType<typeof SDK>;
	siteId: string;
	siteThemeId: string;
	filePath: string;
	themeDir: string;
	fullFilePath: string;
	state: TaskStatesTypes = TASK_STATES.pending;
	error?: InstanceType<typeof TaskError | typeof ServerError>;
	cancelledReason?: string;
	constructor(
		{ resource,
			action,
			sdk,
			siteId,
			siteThemeId,
			filePath,
			themeDir }: ResourceTaskConfig,
	) {
		this.resource = resource;
		this.action = action;
		this.sdk = sdk;
		this.siteId = siteId;
		this.siteThemeId = siteThemeId;
		this.filePath = filePath;
		this.themeDir = themeDir;
		this.fullFilePath = join(this.themeDir, this.filePath);
	}

	abstract exec(): Promise<any>;

	abstract isValid(): Promise<boolean>;

	public async run(): Promise<any> {
		return this.exec().catch(async (error: Error) => this.handleRunError(error));
	}

	public async handleRunError(error: Error): Promise<void> {
		this.state = TASK_STATES.error;
		await this.sdk.fileLogger.logError(error);
		this.error = error instanceof ServerError ? error : new TaskError(GENERIC_ERROR_CODE, error);
	}

	public getSummary(): ResourceTaskSummary {
		return {
			title: this.getTitle(),
			state: this.state,
			error: this.error,
			cancelledReason: this.cancelledReason,
		};
	}

	public getTitle(): string {
		const actionStringMap = {
			[ACTIONS.create]: {
				[TASK_STATES.pending]: strings.components.task.actions.creating,
				[TASK_STATES.complete]: strings.components.task.actions.completed,
				[TASK_STATES.error]: strings.components.task.actions.error,
			},
			[ACTIONS.update]: {
				[TASK_STATES.pending]: strings.components.task.actions.updating,
				[TASK_STATES.complete]: strings.components.task.actions.completed,
				[TASK_STATES.error]: strings.components.task.actions.error,
			},
			[ACTIONS.delete]: {
				[TASK_STATES.pending]: strings.components.task.actions.deleting,
				[TASK_STATES.complete]: strings.components.task.actions.completed,
				[TASK_STATES.error]: strings.components.task.actions.error,
			},
			[ACTIONS.download]: {
				[TASK_STATES.pending]: strings.components.task.actions.downloading,
				[TASK_STATES.complete]: strings.components.task.actions.completed,
				[TASK_STATES.error]: strings.components.task.actions.downloadError,
			},
		};
		return `${actionStringMap[this.action][this.state]} ... ${this.filePath}`;
	}
}
