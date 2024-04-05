/* eslint-disable unicorn/no-static-only-class */
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
	PushDeltaState,
	ThemeState,
} from '../../Types/index.js';
import {
	Resource,
	Site,
	SiteGlobalElement,
	SitePage,
	SiteSetting,
} from '../api/Types.js';
import { FileType } from './Types.js';

export default class Utilities {
	static globalElementDirMap = {
		section: 'sections',
		container: 'containers',
		SECTION: 'sections',
		CONTAINER: 'containers',
	}

	static deltaObjectHasChanges(deltaObject: PushDeltaState): boolean {
		return (
			deltaObject.create.length > 0 ||
			deltaObject.update.length > 0 ||
			deltaObject.delete.length > 0
		);
	}

	static isConfigGlobalConfigFile(filePath: string): boolean {
		return Utilities.removeSlashFromPath(filePath) === 'theme/config/global.json';
	}

	static isThemeConfigFile(filePath: string): boolean {
		return Utilities.removeSlashFromPath(filePath) === 'theme/config/config.json';
	}

	static genGlobalElementPath(globalElement: SiteGlobalElement): string {
		const { name, type } = globalElement;
		return `/site/global/${Utilities.globalElementDirMap[type]}/${name}.json`;
	}

	static genSettingPath(setting: SiteSetting): string {
		return `/site/settings/${setting.name}.json`;
	}

	static genSitePagePath(sitePage: SitePage): string {
		return `/site/pages/${sitePage.name}.json`;
	}

	static genJSONHash(json: Record<string, any>): string {
		const serialized = JSON.stringify(json);
		return Utilities.getContentHash(serialized);
	}

	static getContentHash(content: string | Buffer): string {
		const hash = createHash('sha256');
		hash.update(content);
		return hash.digest('hex');
	}

	static appendSlashToPath(filePath: string): string {
		// Check if the path starts with a '/'
		if (!filePath.startsWith('/')) {
			return `/${filePath}`;
		}

		// If the path already starts with a '/', return it as is
		return filePath;
	}

	static filterSitesWithThemes(sites: Site[]): Site[] {
		return sites.filter(site => site.siteThemeId);
	}

	static filterSitesWithoutThemes(sites: Site[]): Site[] {
		return sites.filter(site => !site.siteThemeId);
	}

	static removeSlashFromPath(path: string): string {
		if (path.startsWith('/')) {
			return path.slice(1);
		}

		return path;
	}

	static isFilepathJson(filePath: string): boolean {
		return path.extname(filePath) === '.json';
	}

	static isThemeFile(filePath: string): boolean {
		filePath = Utilities.appendSlashToPath(filePath);
		return filePath.split(path.sep)[1] === 'theme';
	}

	static isGlobalElementSection(filePath: string): boolean {
		filePath = Utilities.appendSlashToPath(filePath);
		const fileParts = filePath.split(path.sep);
		return Utilities.isFilepathJson(filePath) && fileParts[1] === 'site' && fileParts[2] === 'global' && fileParts[3] === 'sections' && fileParts.length === 5;
	}

	static isGlobalElementContainer(filePath: string): boolean {
		filePath = Utilities.appendSlashToPath(filePath);
		const fileParts = filePath.split(path.sep);
		return Utilities.isFilepathJson(filePath) && fileParts[1] === 'site' && fileParts[2] === 'global' && fileParts[3] === 'containers' && fileParts.length === 5;
	}

	static isSettings(filePath: string): boolean {
		filePath = Utilities.appendSlashToPath(filePath);
		const fileParts = filePath.split(path.sep);
		return Utilities.isFilepathJson(filePath) && fileParts[1] === 'site' && fileParts[2] === 'settings' && fileParts.length === 4;
	}

	static isPagesFile(filePath: string): boolean {
		filePath = Utilities.appendSlashToPath(filePath);
		const fileParts = filePath.split(path.sep);
		return Utilities.isFilepathJson(filePath) && fileParts[1] === 'site' && fileParts[2] === 'pages' && fileParts.length === 4;
	}

	static genPageFileContent(sitePage: SitePage): string {
		const jsonObject = Utilities.genPageJSONfromSitePage(sitePage);
		const fileContent = JSON.stringify(jsonObject, null, 4);
		return fileContent;
	}

	static genSettingsFileContent(setting: SiteSetting): string {
		return JSON.stringify(JSON.parse(setting.properties), null, 4);
	}

	static genGlobalElementsFileContent(globalElement: SiteGlobalElement): string {
		return JSON.stringify(JSON.parse(globalElement.properties), null, 4);
	}

	static genPageJSONfromSitePage(sitePage: SitePage): any {
		return {
			...JSON.parse(sitePage.properties),
			route: sitePage.route,
		};
	}

	static getFileType(path: string): FileType | undefined {
		if (Utilities.isThemeFile(path)) {
			return 'theme';
		}

		if (Utilities.isGlobalElementContainer(path) || Utilities.isGlobalElementSection(path)) {
			return 'global-element';
		}

		if (Utilities.isPagesFile(path)) {
			return 'page';
		}

		if (Utilities.isSettings(path)) {
			return 'setting';
		}
	}

	static getThemeFileDirs(): string[] {
		return [
			'/theme/**/*',
			'/site/settings/*.json',
			'/site/global/sections/*.json',
			'/site/global/containers/*.json',
			'/site/pages/*.json',
		];
	}

	static genRemoteDeltaObject(
		localThemeState: ThemeState,
		remoteThemeState: ThemeState,
		ingoreDelete = false,
	): PushDeltaState {
		const deltaState: PushDeltaState = {
			create: [],
			update: [],
			delete: [],
		};

		for (const localFile of localThemeState.files) {
			const remoteFile = remoteThemeState.files.find((remoteFile: any) => remoteFile.path === localFile.path);
			if (remoteFile) {
				if (remoteFile.hash !== localFile.hash) {
					deltaState.update.push(localFile);
				}
			} else {
				deltaState.create.push(localFile);
			}
		}

		if (!ingoreDelete) {
			for (const remoteFile of remoteThemeState.files) {
				const localFile: any = localThemeState.files.find((localFile: any) => remoteFile.path === localFile.path);
				if (!localFile) {
					deltaState.delete.push(remoteFile);
				}
			}
		}

		return deltaState;
	}

	static hasChangesToPush(deltaState: PushDeltaState): boolean {
		return (
			deltaState.create.length > 0 ||
			deltaState.update.length > 0 ||
			deltaState.delete.length > 0
		);
	}

	static genPageUpsertPayloadFromFileContent(filePath: string, content: Buffer | string): Omit<Omit<SitePage, keyof Resource>, 'id' | 'siteId'> {
		const json = JSON.parse(content.toString());
		const route = json.route;
		delete json.route;
		return {
			name: Utilities.getPageNameFromPath(filePath),
			route,
			properties: JSON.stringify(json),
		};
	}

	static getPageNameFromPath(filePath: string): string {
		return path.parse(path.basename(filePath)).name;
	}
}
