import { ErrorCode, ErrorMessage } from './Types.js';
import { ERROR_CODE_MESSAGE_MAP } from './constants.js';

export class TaskError extends Error {
	code: ErrorCode;
	message: ErrorMessage;
	context?: Error;

	constructor(code: ErrorCode, context?: Error) {
		super();
		this.code = code;
		this.message = ERROR_CODE_MESSAGE_MAP[code];
		this.context = context;
	}
}
