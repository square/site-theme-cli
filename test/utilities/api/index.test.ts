import {
	assert,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { AxiosResponse } from 'axios';
import SquareOnlineApi from '../../../src/utilities/api/index';
import { SiteGlobalElement, ThemeFile } from '../../../src/utilities/api/Types';
import { SDK } from '../../../src/utilities/sdk';

describe('API Test', () => {
	it('lists theme files', async () => {
		const checksum = 'a1b2c3d4';
		const response = { data: { files: [{
			path: 'foo',
			site_theme_id: '111',
			checksum: checksum,
			content_type: 'xml',
			size: '1000000',
		}] } } as AxiosResponse;
		const api = new SquareOnlineApi('FAKE_TOKEN', true);
		vi.spyOn(api, 'axiosRequest').mockResolvedValue(response);
		const getSpy = vi.spyOn(SquareOnlineApi.prototype, 'listThemeFiles');
		const themeFiles = await api.listThemeFiles('1234', '1234');
		assert(themeFiles[0].checksum === checksum);
		expect(getSpy).toHaveBeenCalledOnce();
	});

	it('gets a theme file', async () => {
		const filePath = 'foo';
		const response = { data: { files: [{
			path: filePath,
			site_theme_id: '111',
			checksum: 'a1b2c3d4',
			content_type: 'xml',
			size: '1000000',
			content: 'lorem ipsum',
		}] } } as AxiosResponse;
		const api = new SquareOnlineApi('FAKE_TOKEN', true);
		vi.spyOn(api, 'axiosRequest').mockResolvedValue(response);
		const getSpy = vi.spyOn(SquareOnlineApi.prototype, 'getThemeFile');
		const themeFile = await api.getThemeFile('1234', '1234', filePath) as ThemeFile;
		assert(themeFile.content === 'lorem ipsum');
		expect(getSpy).toHaveBeenCalledOnce();
	});

	it('deletes a theme file', async () => {
		const mockResponse = 'test';
		const response = { data: mockResponse } as AxiosResponse;
		const api = new SquareOnlineApi('FAKE_TOKEN', true);
		vi.spyOn(api, 'axiosRequest').mockResolvedValue(response);
		const deleteSpy = vi.spyOn(SquareOnlineApi.prototype, 'deleteThemeFile');
		await api.deleteThemeFile('1234', '1234', 'foo');
		expect(deleteSpy).toHaveBeenCalledOnce();
	});

	it('lists pages', async () => {
		const response = { data: { pages: [{
			id: '567',
			route: 'foo',
			name: 'My Page',
			siteId: '222',
			properties: '{}',
		}] } } as AxiosResponse;
		const api = new SquareOnlineApi('FAKE_TOKEN', true);
		vi.spyOn(api, 'axiosRequest').mockResolvedValue(response);
		const getSpy = vi.spyOn(SquareOnlineApi.prototype, 'listPages');
		const pages = await api.listPages('1234');
		assert(pages[0].name === 'My Page');
		expect(getSpy).toHaveBeenCalledOnce();
	});

	it('gets a page', async () => {
		const pageName = 'My Page';
		const response = { data: { page: {
			id: '567',
			route: 'foo',
			name: pageName,
			siteId: '222',
			properties: '{}',
		} } } as AxiosResponse;
		const api = new SquareOnlineApi('FAKE_TOKEN', true);
		vi.spyOn(api, 'axiosRequest').mockResolvedValue(response);
		const getSpy = vi.spyOn(SquareOnlineApi.prototype, 'getPage');
		const page = await api.getPage('1234', '567');
		assert(page.name === pageName);
		expect(getSpy).toHaveBeenCalledOnce();
	});

	it('creates a page', async () => {
		const pageName = 'My Page';
		const response = { data: { page: {
			id: '567',
			route: 'foo',
			name: pageName,
			siteId: '222',
			properties: '{}',
		} } } as AxiosResponse;
		const api = new SquareOnlineApi('FAKE_TOKEN', true);
		vi.spyOn(api, 'axiosRequest').mockResolvedValue(response);
		const createSpy = vi.spyOn(SquareOnlineApi.prototype, 'createPage');
		const pagePayload = SDK.genPageUpsertPayloadFromFileContent('foo', '{ "body": "lorum ipsum" }');
		const page = await api.createPage('1234', pagePayload);
		assert(page.name === pageName);
		expect(createSpy).toHaveBeenCalledOnce();
	});

	it('gets a global element', async () => {
		const properties = '{"property":"value"}';
		const response = { data: { global_elements: [{
			name: 'My Element',
			type: 'section',
			properties: properties,
		}] } } as AxiosResponse;
		const api = new SquareOnlineApi('FAKE_TOKEN', true);
		vi.spyOn(api, 'axiosRequest').mockResolvedValue(response);
		const getSpy = vi.spyOn(SquareOnlineApi.prototype, 'getGlobalElement');
		const element = await api.getGlobalElement('1234', 'section', 'My Element') as SiteGlobalElement;
		assert(element.properties === properties);
		expect(getSpy).toHaveBeenCalledOnce();
	});

	it('lists global elements', async () => {
		const properties = '{"property":"value"}';
		const response = { data: { global_elements: [{
			name: 'My Element',
			type: 'section',
			properties: properties,
		}] } } as AxiosResponse;
		const api = new SquareOnlineApi('FAKE_TOKEN', true);
		vi.spyOn(api, 'axiosRequest').mockResolvedValue(response);
		const getSpy = vi.spyOn(SquareOnlineApi.prototype, 'listGlobalElements');
		const elements = await api.listGlobalElements('1234');
		assert(elements[0].properties === properties);
		expect(getSpy).toHaveBeenCalledOnce();
	});
});
