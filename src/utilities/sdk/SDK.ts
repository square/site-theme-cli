/* eslint-disable max-len */
import path from 'node:path';
import { ReadStream } from 'node:fs';
import { ThemeState } from '../../Types/index.js';
import SquareOnlineApi from '../api/index.js';
import {
	Site,
	SiteGlobalElement,
	SiteGlobalElementType,
	SitePage,
	SiteSetting,
	ThemeFileMeta,
} from '../api/Types.js';
import { ResourceThemeMapping } from './Types.js';
import { ResourceStore } from './ResourceStore.js';
import Utilities from './Utilities.js';
import { ProcessFileLogger } from '../filesystem.js';

export default class SDK extends Utilities {
	apiClient: SquareOnlineApi;
	accessToken: string;
	resourceStore: ResourceStore | undefined;
	fileLogger: ProcessFileLogger;
	constructor(
		accessToken: string,
		fileLogger: ProcessFileLogger,
		verbose = false,
	) {
		super();
		this.accessToken = accessToken;
		this.fileLogger = fileLogger;
		this.apiClient = new SquareOnlineApi(accessToken, verbose);
	}

	async getTokenPermissions(): Promise<string[]> {
		return this.apiClient.getTokenPermissions();
	}

	async getSites(): Promise<Site[]> {
		return this.apiClient.getSites();
	}

	async getSitesWithoutTheme(): Promise<Site[]> {
		const sites = await this.getSites();
		return SDK.filterSitesWithoutThemes(sites);
	}

	async getSitesWithTheme(): Promise<Site[]> {
		const sites = await this.getSites();
		return SDK.filterSitesWithThemes(sites);
	}

	async installTheme(siteId: string): Promise<void> {
		await this.apiClient.createTheme(siteId);
	}

	async getSiteThemeResources(siteId: string, siteThemeId: string): Promise<ResourceThemeMapping> {
		const [
			themeFilesMeta,
			siteGlobalElements,
			sitePages,
			settings,
		] = await Promise.all([
			this.apiClient.listThemeFiles(siteId, siteThemeId),
			this.apiClient.listGlobalElements(siteId),
			this.apiClient.listPages(siteId),
			this.apiClient.listSettings(siteId),
		]);
		const siteThemeResources =  {
			themeFiles: themeFilesMeta,
			globalElements: siteGlobalElements,
			sitePages,
			settings,
		};
		this.resourceStore = new ResourceStore(siteThemeResources);
		return siteThemeResources;
	}

	async downloadThemeFile(siteId: string, siteThemeId: string, filePath: string): Promise<string | Buffer | undefined> {
		// Revist This
		const themeFile = await this.apiClient.getThemeFile(siteId, siteThemeId, filePath);
		if (!themeFile) {
			return;
		}

		if (themeFile.binaryEncodingType === 'base64') {
			return Buffer.from(themeFile.content, 'base64');
		}

		return themeFile.content;
	}

	async getSite(siteId: string): Promise<Site | undefined> {
		const sites = await this.getSites();
		const site = sites.find(site => site.id === siteId);
		return site;
	}

	async getSiteRoutes(siteId: string): Promise<string[]> {
		const sitePages = await this.apiClient.listPages(siteId);
		return sitePages.map(({ route }) => route);
	}

	async getRemoteThemeState(
		siteId: string,
		siteThemeId: string,
	): Promise<ThemeState> {
		// go through themeFiles,
		// get all pages,
		// get global elements,
		// get settings,
		const themeState: ThemeState = {
			files: [],
		};
		const { themeFiles,
			sitePages,
			settings,
			globalElements } = await this.getSiteThemeResources(siteId, siteThemeId);

		for (const { path, checksum } of themeFiles) {
			themeState.files.push({
				path: SDK.appendSlashToPath(path),
				hash: checksum,
			});
		}

		for (const sitePage of sitePages) {
			const JSONContent = SDK.genPageJSONfromSitePage(sitePage);
			const hash = SDK.genJSONHash(JSONContent);
			themeState.files.push({
				path: SDK.genSitePagePath(sitePage),
				hash,
			});
		}

		for (const setting of settings) {
			const path = SDK.genSettingPath(setting);
			const hash = SDK.genJSONHash(JSON.parse(setting.properties));
			themeState.files.push({
				path,
				hash,
			});
		}

		for (const globalElement of globalElements) {
			const path = SDK.genGlobalElementPath(globalElement);
			const hash = SDK.genJSONHash(JSON.parse(globalElement.properties));
			themeState.files.push({
				path,
				hash,
			});
		}

		return themeState;
	}
	// ThemeFile CUD

	async createThemeFile(siteId: string, siteThemeId: string, filePath: string, content: ReadStream): Promise<ThemeFileMeta> {
		return this.apiClient.upsertThemeFile(siteId, siteThemeId, SDK.removeSlashFromPath(filePath), content);
	}

	async updateThemeFile(siteId: string, siteThemeId: string, filePath: string, content: ReadStream): Promise<ThemeFileMeta> {
		return this.apiClient.upsertThemeFile(siteId, siteThemeId, SDK.removeSlashFromPath(filePath), content);
	}

	async deleteThemeFile(siteId: string, siteThemeId: string, filePath: string): Promise<void> {
		await this.apiClient.deleteThemeFile(siteId, siteThemeId, SDK.removeSlashFromPath(filePath));
	}

	// Global Element CUD

	async createGlobalElement(siteId: string, filePath: string, type: SiteGlobalElementType, properties: Record<string, any>): Promise<SiteGlobalElement> {
		return this.apiClient.upsertGlobalElement(siteId, path.parse(filePath).name, type, properties);
	}

	async updateGlobalElement(siteId: string, filePath: string, type: SiteGlobalElementType, properties: Record<string, any>): Promise<SiteGlobalElement> {
		return this.apiClient.upsertGlobalElement(siteId, path.parse(filePath).name, type, properties);
	}

	async deleteGlobalElement(siteId: string, filePath: string, type: SiteGlobalElementType): Promise<void> {
		const name = path.parse(filePath).name;
		this.apiClient.deleteGlobalElement(siteId, name, type);
	}

	// Settings CUD

	async createSettings(siteId: string, filePath: string, properties: Record<string, any>): Promise<SiteSetting> {
		const name = path.parse(filePath).name;
		return this.apiClient.upsertSettings(siteId, name, properties);
	}

	async updateSettings(siteId: string, filePath: string, properties: Record<string, any>): Promise<SiteSetting> {
		const name = path.parse(filePath).name;
		return this.apiClient.upsertSettings(siteId, name, properties);
	}

	async deleteSettings(siteId: string, filePath: string): Promise<void> {
		const name = path.parse(filePath).name;
		await this.apiClient.deleteSettings(siteId, name);
	}

	// Site Page CUD

	async createSitePage(siteId: string, filePath: string, content: Buffer): Promise<SitePage> {
		const pagePayload = SDK.genPageUpsertPayloadFromFileContent(filePath, content);
		const pageId = this.getPageIdFromStore(filePath);
		const sitePage = await (pageId ? this.apiClient.updatePage(siteId, pageId, pagePayload) :
			this.apiClient.createPage(siteId, pagePayload));
		if (this.resourceStore) {
			this.resourceStore.updatePageId(sitePage.name as string, sitePage.id);
		}

		return sitePage;
	}

	async updateSitePage(siteId: string, filePath: string, content: Buffer): Promise<SitePage> {
		const page = SDK.genPageUpsertPayloadFromFileContent(filePath, content);
		const pageId = this.getPageIdFromStore(filePath);
		if (!pageId) {
			throw new Error('Could not find a site page id');
		}

		const sitePage = await this.apiClient.updatePage(siteId, pageId, page);

		if (this.resourceStore) {
			this.resourceStore.updatePageId(page.name, pageId);
		}

		return sitePage;
	}

	async deleteSitePage(siteId: string, filePath: string): Promise<void> {
		const pageId = this.getPageIdFromStore(filePath);
		if (pageId) {
			await this.apiClient.deletePage(siteId, pageId);
			const pageName = SDK.getPageNameFromPath(filePath);
			if (this.resourceStore) {
				this.resourceStore.deletePageIdMap(pageName);
			}
		}
	}

	getPageIdFromStore(filePath: string): string | undefined {
		if (this.resourceStore) {
			const name = SDK.getPageNameFromPath(filePath);
			return this.resourceStore.getPageId(name);
		}
	}
}
