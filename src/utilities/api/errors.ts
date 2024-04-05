import { AxiosError } from 'axios';
import { ApiResponse } from './Types.js';

export class ServerError extends Error {
	status: number;
	url: string;
	errorJSON: Record<string, any>;
	constructor(error: AxiosError) {
		const apiResponse = error?.response?.data as ApiResponse;
		const errors = apiResponse.errors || [];
		const message = errors.map(squareError => {
			let message = `Category: ${squareError.category}\nCode: ${squareError.code}`;
			if (squareError.field) {
				message += ` Field: ${squareError.field}`;
			}

			message += '\n';
			if (squareError.detail) {
				message += `Detail: ${squareError.detail}`;
			}

			return message;
		}).join('\n');
		super(message);
		this.errorJSON = error.toJSON();
		this.status = error?.response?.status as number;
		this.url = error?.response?.config.url as string;
	}

	isPermissionsError(): boolean {
		const permissionStatusCodes = [401, 403];
		return permissionStatusCodes.includes(this.status);
	}
}
