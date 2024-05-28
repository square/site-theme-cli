/* eslint-disable new-cap */
import mime from 'mime-types';
import path from 'node:path';
import { ReadStream } from 'node:fs';
import { RetrieveTokenStatusResponse } from 'square';
import {
	GLOBAL_ELEMENTS_ENDPOINT,
	PAGE_ENDPOINT,
	PAGES_ENDPOINT,
	SETTINGS_ENDPOINT,
	SITES_ENDPOINT,
	THEME_FILES_ENDPOINT,
	THEMES_ENDPOINT,
	TOKEN_STATUS_ENDPOINT,
} from './endpoints.js';
import SquareOnlineRequest from './request.js';
import {
	ApiResponse,
	CreateSitePagePayload,
	GlobalElementFilterQuery,
	GlobalElementsResponse,
	MarketTheme,
	PageResponse,
	PagesResponse,
	RawSite,
	RawThemeFile,
	RawThemeFileMeta,
	Resource,
	SettingFilterQuery,
	SettingResponse,
	SettingsResponse,
	Site,
	SiteGlobalElement,
	SiteGlobalElementType,
	SitePage,
	SitesAPIResponse,
	SiteSetting,
	SiteTheme,
	SiteThemesResponse,
	ThemeFile,
	ThemeFileFilterQuery,
	ThemeFileMeta,
	ThemeFileResponse,
	ThemeFilesMetaResponse,
	ThemeFilesResponse,
	ThemeFileUpsertParts,
	ThemeResponse,
	UpdateSitePagePayload,
	UpsertGlobalElementPayload,
	UpsertSettingPayload,
} from './Types.js';
import { convertApiResource } from './util.js';
import { ALLOWED_CONTENT_TYPES } from './constants.js';

class SquareOnlineApi extends SquareOnlineRequest {
	constructor(accessToken: string, showApiResponses = false) {
		// TODO: replace version after release
		super(accessToken, '2021-05-13', showApiResponses);
	}

	async getTokenPermissions(): Promise<string[]> {
		const response = await this.post(TOKEN_STATUS_ENDPOINT);
		response.data as RetrieveTokenStatusResponse;
		const { scopes } = response.data;
		return scopes || [];
	}

	async getSites(): Promise<Site[]> {
		const response = await this.get(SITES_ENDPOINT);
		response.data as SitesAPIResponse;
		return response.data.sites ? response.data.sites.map((site: RawSite) => convertApiResource(site) as Site) : [];
	}

	async getMarketThemes(): Promise<MarketTheme[]> {
		return [];
	}

	async getCustomThemes(siteId: string): Promise<SiteTheme[]> {
		const response = await this.get(THEMES_ENDPOINT(siteId));
		response.data as SiteThemesResponse;
		return convertApiResource(response.data.site_themes) as SiteTheme[];
	}

	async createTheme(siteId: string, baseThemeId?: string, name?: string): Promise<SiteTheme> {
		const body: any = {
			idempotency_key: Date.now().toString(),
		};
		if (baseThemeId && name) {
			body.site_theme_id = baseThemeId;
			body.name = name;
		}

		const response = await this.post(THEMES_ENDPOINT(siteId), body);
		response.data as ThemeResponse;
		return convertApiResource(response.data.site_theme) as SiteTheme;
	}

	async listThemeFiles(siteId: string, siteThemeId: string): Promise<ThemeFileMeta[]> {
		const themeFiles: ThemeFileMeta[] = [];
		// Todo: move limit to a constant after pagination is valdiated
		const limit = 15;
		let cursor: string | undefined;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const response = await this.get(THEME_FILES_ENDPOINT(siteId, siteThemeId), { limit, cursor });
			response.data as ThemeFilesMetaResponse;
			if (response.data.files) {
				for (const themeFile of response.data.files) {
					themeFile as RawThemeFileMeta;
					themeFiles.push(
						convertApiResource(themeFile) as ThemeFileMeta,
					);
				}
			} else {
				break;
			}

			if (response.data.cursor) {
				cursor = response.data.cursor;
			} else {
				break;
			}
		}

		return themeFiles;
	}

	async getThemeFile(siteId: string, siteThemeId: string, path: string): Promise<ThemeFile | void> {
		const query: ThemeFileFilterQuery = {
			path,
		};
		const respsonse = await this.get(THEME_FILES_ENDPOINT(siteId, siteThemeId), query);
		respsonse.data as ThemeFilesResponse;
		const themeFile = respsonse.data.files.find((themeFile: RawThemeFile) => themeFile.path === path);
		if (themeFile) {
			return convertApiResource(themeFile) as ThemeFile;
		}
	}

	async upsertThemeFile(siteId: string, siteThemeId: string, filePath: string, content: ReadStream): Promise<ThemeFile> {
		let contentType = mime.contentType(path.extname(filePath));
		if (!contentType || !ALLOWED_CONTENT_TYPES.includes(contentType)) {
			contentType = 'application/octet-stream';
		}

		// Need to override this since API cannot accept application/json for contentType
		// in content section of multi-part request.

		if (contentType.includes('application/json')) {
			contentType = 'text/plain';
		}

		const payloadParts: ThemeFileUpsertParts = [
			{
				path: filePath,
			},
			{
				content,
				contentType,
			},
		];
		const response = await this.postFormData(THEME_FILES_ENDPOINT(siteId, siteThemeId), payloadParts);
		response.data as ThemeFileResponse;
		return convertApiResource(response.data.file) as ThemeFile;
	}

	async deleteThemeFile(siteId: string, siteThemeId: string, path: string): Promise<void> {
		const query: ThemeFileFilterQuery = {
			path,
		};
		const respsonse = await this.delete(THEME_FILES_ENDPOINT(siteId, siteThemeId), query);
		respsonse.data as ApiResponse;
		// no-op maybe look into errors after
	}

	async listPages(siteId: string, siteThemeId: string): Promise<SitePage[]> {
		const sitePages: SitePage[] = [];
		// Todo: move limit to constand after pagination is validated.
		const limit = 15;
		let cursor: string | undefined;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const response = await this.get(PAGES_ENDPOINT(siteId, siteThemeId), { limit, cursor });
			response.data as PagesResponse;
			if (!response.data.pages) {
				break;
			}

			const pages = response.data.pages.map((page: SitePage) => convertApiResource(page) as SitePage);
			sitePages.push(...pages);
			if (response.data.cursor) {
				cursor = response.data.cursor;
			} else {
				break;
			}
		}

		return sitePages;
	}

	async getPage(siteId: string, siteThemeId: string, pageId: string): Promise<SitePage> {
		const response = await this.get(PAGE_ENDPOINT(siteId, siteThemeId, pageId));
		response.data as PageResponse;
		return convertApiResource(response.data.page) as SitePage;
	}

	async createPage(siteId: string, siteThemeId: string, page: Omit<Omit<SitePage, keyof Resource>, 'id' | 'siteId'>): Promise<SitePage> {
		const body: CreateSitePagePayload = {
			page,
			idempotency_key: Date.now().toString(),
		};
		const response = await this.post(PAGES_ENDPOINT(siteId, siteThemeId), body);
		response.data as PageResponse;
		return convertApiResource(response.data.page) as SitePage;
	}

	async updatePage(siteId: string, siteThemeId: string, pageId: string, page:Omit<Omit<SitePage, keyof Resource>, 'id' | 'siteId'>): Promise<SitePage> {
		const body: UpdateSitePagePayload = {
			page,
			idempotency_key: Date.now().toString(),
		};
		const response = await this.put(PAGE_ENDPOINT(siteId, siteThemeId, pageId), body);
		response.data as PageResponse;
		return convertApiResource(response.data.page) as SitePage;
	}

	async deletePage(siteId: string, siteThemeId: string, pageId: string): Promise<void> {
		this.delete(PAGE_ENDPOINT(siteId, siteThemeId, pageId));
	}

	async listSettings(siteId: string, siteThemeId: string): Promise<SiteSetting[]> {
		const response = await this.get(SETTINGS_ENDPOINT(siteId, siteThemeId));
		response.data as SettingsResponse;
		if (!response.data.settings) {
			return [];
		}

		return response.data.settings.map((setting: SiteSetting) => convertApiResource(setting) as SiteSetting);
	}

	async getSettings(siteId: string, siteThemeId: string, name: string): Promise<SiteSetting | void> {
		const query: SettingFilterQuery = {
			name,
		};
		const response = await this.get(SETTINGS_ENDPOINT(siteId, siteThemeId), query);
		response.data as SettingsResponse;
		if (response.data.settings) {
			const siteSetting = response.data.settings.find((siteSetting: SiteSetting) => siteSetting.name === name);
			if (siteSetting) {
				return convertApiResource(siteSetting) as SiteSetting;
			}
		}
	}

	async upsertSettings(
		siteId: string,
		siteThemeId: string,
		name: string,
		properties: Record<string, any>,
	): Promise<SiteSetting> {
		const payload: UpsertSettingPayload = {
			name,
			properties: JSON.stringify(properties),
		};
		const response = await this.post(SETTINGS_ENDPOINT(siteId, siteThemeId), payload);
		response.data as SettingResponse;
		return response.data;
	}

	async deleteSettings(siteId: string, siteThemeId: string, name: string): Promise<void> {
		const query: SettingFilterQuery = {
			name,
		};
		await this.delete(SETTINGS_ENDPOINT(siteId, siteThemeId), query);
	}

	async listGlobalElements(siteId: string, siteThemeId:string): Promise<SiteGlobalElement[]> {
		const response = await this.get(GLOBAL_ELEMENTS_ENDPOINT(siteId, siteThemeId));
		response.data as GlobalElementsResponse;
		if (!response.data.global_elements) {
			return [];
		}

		return response.data.global_elements.map(
			(globalElement: SiteGlobalElement) => convertApiResource(globalElement) as SiteGlobalElement,
		);
	}

	async getGlobalElement(
		siteId: string,
		siteThemeId: string,
		type: SiteGlobalElementType,
		name: string,
	): Promise<SiteGlobalElement | void> {
		const query = {
			[type]: name,
		} as GlobalElementFilterQuery;
		const response = await this.get(GLOBAL_ELEMENTS_ENDPOINT(siteId, siteThemeId), query);
		response.data as GlobalElementsResponse;
		if (response.data.global_elements) {
			const globalElement = response.data.global_elements.find((element: SiteGlobalElement) => element.name === name);
			if (globalElement) {
				return convertApiResource(globalElement) as SiteGlobalElement;
			}
		}
	}

	async upsertGlobalElement(
		siteId: string,
		siteThemeId: string,
		name: string,
		type: SiteGlobalElementType,
		properties: Record<any, any>): Promise<SiteGlobalElement> {
		const payload: UpsertGlobalElementPayload = {
			name,
			type: type.toUpperCase() as any,
			properties: JSON.stringify(properties),
		};
		const response = await this.post(GLOBAL_ELEMENTS_ENDPOINT(siteId, siteThemeId), payload);
		response.data as GlobalElementsResponse;
		return response.data;
	}

	async deleteGlobalElement(siteId: string, siteThemeId: string, name: string, type: SiteGlobalElementType): Promise<void> {
		const query = {
			[type]: name,
		} as GlobalElementFilterQuery;
		await this.delete(GLOBAL_ELEMENTS_ENDPOINT(siteId, siteThemeId), query);
	}
}

export default SquareOnlineApi;
