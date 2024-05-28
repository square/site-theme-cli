import React, { useEffect, useState } from 'react';
import {
	render,
	Box,
	Text,
} from 'ink';
import { colors } from '../styles.js';
import { ResourceTaskSummary } from '../../../utilities/sdk/TaskManager/Types.js';
import { TASK_STATES } from '../../../utilities/sdk/TaskManager/constants.js';
import { TaskManager } from '../../../utilities/sdk/TaskManager/index.js';

export interface TasksConfiguration {
	title: string;
	taskManager: InstanceType<typeof TaskManager>;
	parallelCount: number; // Number of tasks to execute in parallel
	width: number
}
export interface TaskListComponentProps {
	taskConfig: TasksConfiguration;
	onComplete: () => void
}

const TaskSummaryLine = ({ taskSummary }: {taskSummary: ResourceTaskSummary}): React.JSX.Element => {
	return (
		<Box>
			<Box marginRight={1}>
				{
					taskSummary.state === TASK_STATES.pending ?
						<Text color={colors.info}>.</Text> : null
				}
				{
					taskSummary.state === TASK_STATES.complete ?
						<Text color={colors.success}>✓</Text> : null
				}
				{
					taskSummary.state === TASK_STATES.error ||
					taskSummary.state === TASK_STATES.cancelled ?
						<Text color={colors.danger}>❌</Text> : null
				}
			</Box>
			<Box>
				<Text>
					{
						taskSummary.title
					}
				</Text>
			</Box>
		</Box>
	);
};

const TaskSummaryErrorLine = ({ taskSummary }: {taskSummary: ResourceTaskSummary}): React.JSX.Element => {
	const message = taskSummary.error?.message || taskSummary.cancelledReason || '';
	return (
		<Box>
			<Text color={colors.warning}>
				{
					message
				}
			</Text>
		</Box>
	);
};

const TaskTitle = ({ title }: {title: string}): React.JSX.Element => {
	return (
		<Box borderStyle={'doubleSingle'}>
			<Text>
				{
					title
				}
			</Text>
		</Box>
	);
};

const TaskListComponent = ({ taskConfig, onComplete }: TaskListComponentProps): React.JSX.Element => {
	const { parallelCount, title, width, taskManager } = taskConfig;
	const [tasksSummary, setTasksSummary] = useState<ResourceTaskSummary[]>([]);

	const executeTasks = async () => {
		for await (const taskSummaries of taskManager.executeTasks(parallelCount)) {
			setTasksSummary([...taskSummaries]);
		}

		onComplete();
	};

	useEffect(() => {
		executeTasks();
	}, []);

	return (
		<Box flexDirection={'column'} width={width}>
			<TaskTitle title={title} />
			{
				tasksSummary.map((taskSummary: ResourceTaskSummary, index: number) => {
					return (
						<React.Fragment key={index}>
							<TaskSummaryLine taskSummary={taskSummary} />
							<TaskSummaryErrorLine taskSummary={taskSummary} />
						</React.Fragment>

					);
				})
			}
		</Box>
	);
};

export const runTaskListFromManager = async (taskConfig: TasksConfiguration): Promise<void> => {
	if (taskConfig.taskManager.hasTasks()) {
		return new Promise(resolve => {
			// eslint-disable-next-line prefer-const
			let unmount: any;
			const onComplete = (): void => {
				resolve();
				unmount();
			};

			const { unmount: unmountInk } = render(<TaskListComponent taskConfig={taskConfig}  onComplete={onComplete} />);
			unmount = unmountInk;
		});
	}
};
