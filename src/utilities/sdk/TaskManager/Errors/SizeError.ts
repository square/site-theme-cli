import { TaskError } from './TaskError.js';
import { SizeErrorCode } from './Types.js';

export class SizeError extends TaskError {
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	constructor(code: SizeErrorCode, context?: any) {
		super(code, context);
	}
}
