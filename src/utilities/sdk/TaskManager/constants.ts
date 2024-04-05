import { TaskStatesTypes } from './Types.js';

export const TASK_STATES = {
	pending: 'pending',
	complete: 'complete',
	error: 'error',
} as {
	[key in TaskStatesTypes]: TaskStatesTypes
};
