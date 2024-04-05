import { assert } from 'node:console';
import { describe, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { ServerError } from '../../../src/utilities/api/errors';

describe('ServerError Test', () => {
	it('constructs a message', async () => {
		const request = { path: '/path' };
		const headers = new AxiosHeaders();
		const config = {
			url: 'http://localhost',
			headers,
		};
		const error = new AxiosError('Kaboom', 'CODE', config, request, {
			status: 500,
			data: {
				errors: [
					{
						category: 'Foo',
						code: '123',
						field: 'Bar',
						detail: 'Yada yada',
					},
				],
			},
			statusText: 'Server Error',
			config,
			headers,
		});
		const serverError = new ServerError(error);
		assert(serverError.message === 'Category: Foo\nCode: 123 Field: Bar\nDetail: Yada yada');
		assert(serverError.isPermissionsError() === false);
	});

	it('constructs an empty message', async () => {
		const request = { path: '/path' };
		const headers = new AxiosHeaders();
		const config = {
			url: 'http://localhost',
			headers,
		};
		const error = new AxiosError('Kaboom', 'CODE', config, request, {
			status: 401,
			data: {},
			statusText: 'Server Error',
			config,
			headers,
		});
		const serverError = new ServerError(error);
		assert(serverError.message === '');
		assert(serverError.isPermissionsError() === true);
	});
});
