import { TaskManager } from '../utilities/sdk/TaskManager/index.js';
import { TasksConfiguration, runTaskListFromManager } from './ui/display/TaskManagerList.js';

export const runTasksFromManager = (
	title: string,
	taskManager: InstanceType<typeof TaskManager>,
	parallelCount: number,
): Promise<void> => {
	const taskConfiguration: TasksConfiguration = {
		title,
		taskManager,
		parallelCount,
		width: 100,
	};
	return runTaskListFromManager(taskConfiguration);
};
