import axios, {
	AxiosError,
	AxiosRequestConfig,
	AxiosResponse,
} from 'axios';
import FormData from 'form-data';
import {
	BodyPayloads,
	DeleteQueryParams,
	QueryParams,
	ThemeFileUpsertParts,
} from './Types.js';
import { API_HOST } from './constants.js';
import { ServerError } from './errors.js';

class SquareOnlineRequest {
	base: string;
	headers: any;
	shouldLogResponse: boolean;
	constructor(
		accessToken: string,
		squareVersion: string,
		shouldLogResponse: boolean,
	) {
		this.base = API_HOST;
		this.headers = {
			'Square-Version': squareVersion,
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		};
		this.shouldLogResponse = shouldLogResponse;
	}

	logResponse(response: AxiosResponse): void {
		if (this.shouldLogResponse) {
			const logObject = {
				requestConfig: response.config,
				responseBody: response.data,
				status: response.status,
				repsonseHeaders: response.headers,
			};
			console.log(JSON.stringify(logObject, null, 4));
		}
	}

	handleError(error: Error | AxiosError): never {
		if (axios.isAxiosError(error)) {
			if (error.response) {
				this.logResponse(error.response);
			}

			throw new ServerError(error);
		} else {
			throw error;
		}
	}

	async axiosRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
		const response = await axios(config).catch((error: AxiosError) => this.handleError(error));
		this.logResponse(response);
		return response;
	}

	async get(url: string, queryParams?: QueryParams): Promise<AxiosResponse> {
		return this.axiosRequest({
			method: 'get',
			url,
			headers: this.headers,
			params: queryParams,
			baseURL: this.base,
		});
	}

	async post(url: string, data?: BodyPayloads): Promise<AxiosResponse>  {
		return this.axiosRequest({
			method: 'post',
			url,
			headers: this.headers,
			data,
			baseURL: this.base,
		});
	}

	async postFormData(url: string, parts: ThemeFileUpsertParts): Promise<any> {
		const form = new FormData();
		form.append('request', JSON.stringify(parts[0]));
		form.append('file', parts[1].content, {
			contentType: parts[1].contentType,
		});
		return this.axiosRequest({
			method: 'post',
			url,
			headers: {
				...this.headers,
				...form.getHeaders(),
			},
			data: form,
			baseURL: this.base,
		});
	}

	async put(url: string, data?: BodyPayloads): Promise<AxiosResponse>  {
		return this.axiosRequest({
			method: 'put',
			url,
			headers: this.headers,
			data,
			baseURL: this.base,
		});
	}

	async delete(url: string, queryParams?: DeleteQueryParams): Promise<AxiosResponse> {
		return this.axiosRequest({
			method: 'delete',
			url,
			params: queryParams,
			headers: this.headers,
			baseURL: this.base,
		});
	}
}

export default SquareOnlineRequest;
