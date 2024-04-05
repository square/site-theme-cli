import {
	SiteGlobalElement,
	SitePage,
	SiteSetting,
	ThemeFileMeta,
} from '../api/Types.js';

export type ResourceThemeMappingKeys = 'themeFiles' | 'globalElements' | 'sitePages' | 'settings';
export interface ResourceThemeMapping {
	themeFiles: ThemeFileMeta[];
	globalElements: SiteGlobalElement[];
	sitePages: SitePage[];
	settings: SiteSetting[];
}

export interface PagesNameIdMapping {
	[key: string]: string;
}

export type PushAction = 'create' | 'update' | 'delete';

export type PullAction = 'download'

export type Action = PushAction | PullAction;

export type FileType =
	'theme' |
	'global-element' |
	'setting' |
	'page';

export type ResourceType = FileType;
