import { TaskError } from './TaskError.js';
import { ParseErrorCode } from './Types.js';

export class ParseError extends TaskError {
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	constructor(code: ParseErrorCode, context?: any) {
		super(code, context);
	}
}
