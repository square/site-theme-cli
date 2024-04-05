import {
	assert,
	describe,
	it,
	vi,
} from 'vitest';
import { AxiosResponse } from 'axios';
import { createReadStream } from 'node:fs';
import SquareOnlineRequest from '../../../src/utilities/api/request';
import { ThemeFileUpsertParts } from '../../../src/utilities/api/Types';

describe('Requests Test', () => {
	it('makes a get request', async () => {
		const mockResponse = 'test';
		const request = new SquareOnlineRequest('FAKE_TOKEN', '1.0', true);
		const response = { data: mockResponse } as AxiosResponse;
		vi.spyOn(request, 'axiosRequest').mockResolvedValue(response);
		const result = await request.get('/foo');
		assert(result.data === mockResponse);
	});

	it('makes a post request', async () => {
		const mockResponse = 'test';
		const request = new SquareOnlineRequest('FAKE_TOKEN', '1.0', true);
		const response = { data: mockResponse } as AxiosResponse;
		vi.spyOn(request, 'axiosRequest').mockResolvedValue(response);
		const result = await request.post('/foo');
		assert(result.data === mockResponse);
	});

	it('makes a put request', async () => {
		const mockResponse = 'test';
		const request = new SquareOnlineRequest('FAKE_TOKEN', '1.0', true);
		const response = { data: mockResponse } as AxiosResponse;
		vi.spyOn(request, 'axiosRequest').mockResolvedValue(response);
		const result = await request.put('/foo');
		assert(result.data === mockResponse);
	});

	it('makes a delete request', async () => {
		const mockResponse = 'test';
		const request = new SquareOnlineRequest('FAKE_TOKEN', '1.0', true);
		const response = { data: mockResponse } as AxiosResponse;
		vi.spyOn(request, 'axiosRequest').mockResolvedValue(response);
		const result = await request.delete('/foo');
		assert(result.data === mockResponse);
	});

	it('posts form data', async () => {
		const mockResponse = 'test';
		const request = new SquareOnlineRequest('FAKE_TOKEN', '1.0', true);
		const response = { data: mockResponse } as AxiosResponse;
		vi.spyOn(request, 'axiosRequest').mockResolvedValue(response);
		const payloadParts: ThemeFileUpsertParts = [
			{
				path: '/foo',
			},
			{
				content: createReadStream('bar'),
				contentType: 'text/plain',
			},
		];
		const result = await request.postFormData('/foo', payloadParts);
		assert(result.data === mockResponse);
	});
});
