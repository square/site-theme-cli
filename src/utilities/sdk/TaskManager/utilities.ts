import {
	SiteGlobalElement, SitePage, SiteSetting, ThemeFileMeta,
} from '../../api/Types.js';
import {
	ResourceType, PushAction, PullAction,
} from '../Types.js';
import {
	RESOURCES, ACTIONS, PULL_ACTIONS, PUSH_ACTIONS,
} from '../constants.js';
import { SDK } from '../index.js';
import { CreateGlobalElementsTask } from './Tasks/CreateGlobalElementsTask.js';
import { CreateSettingsTask } from './Tasks/CreateSettingsTask.js';
import { CreateSitePageTask } from './Tasks/CreateSitePageTask.js';
import { CreateThemeFileTask } from './Tasks/CreateThemeFileTask.js';
import { DeleteGlobalElementsTask } from './Tasks/DeleteGlobalElementsTask.js';
import { DeleteSettingsTask } from './Tasks/DeleteSettingsTask.js';
import { DeleteSitePageTask } from './Tasks/DeleteSitePageTask.js';
import { DeleteThemeFileTask } from './Tasks/DeleteThemeFileTask.js';
import { DownloadGlobalElementsTask } from './Tasks/DownloadGlobalElementsTask.js';
import { DownloadResourceTask } from './Tasks/DownloadResourceTask.js';
import { DownloadSettingsTask } from './Tasks/DownloadSettingsTask.js';
import { DownloadSitePageTask } from './Tasks/DownloadSitePageTask.js';
import { DownloadThemeFileTask } from './Tasks/DownloadThemeFileTask.js';
import { ResourceTask } from './Tasks/ResourceTask.js';
import { UpdateGlobalElementsTask } from './Tasks/UpdateGlobalElementTask.js';
import { UpdateSettingsTask } from './Tasks/UpdateSettingsTask.js';
import { UpdateSitePageTask } from './Tasks/UpdateSitePageTask.js';
import { UpdateThemeFileTask } from './Tasks/UpdateThemeFileTask.js';
import {
	PullResourceTaskConfig, PushResourceTaskConfig, ResourcePullObjects, TaskPayload,
} from './Types.js';

const PushTaskMap = {
	[RESOURCES.theme]: {
		[ACTIONS.create]: CreateThemeFileTask,
		[ACTIONS.update]: UpdateThemeFileTask,
		[ACTIONS.delete]: DeleteThemeFileTask,
	},
	[RESOURCES.globalElement]: {
		[ACTIONS.create]: CreateGlobalElementsTask,
		[ACTIONS.update]: UpdateGlobalElementsTask,
		[ACTIONS.delete]: DeleteGlobalElementsTask,
	},
	[RESOURCES.setting]: {
		[ACTIONS.create]: CreateSettingsTask,
		[ACTIONS.update]: UpdateSettingsTask,
		[ACTIONS.delete]: DeleteSettingsTask,
	},
	[RESOURCES.page]: {
		[ACTIONS.create]: CreateSitePageTask,
		[ACTIONS.update]: UpdateSitePageTask,
		[ACTIONS.delete]: DeleteSitePageTask,
	},
} satisfies {
	[key in ResourceType]: {
		[key in PushAction]: typeof ResourceTask
	}
};

const PullTaskMap = {
	[RESOURCES.theme]: {
		[ACTIONS.download]: DownloadThemeFileTask,
	},
	[RESOURCES.globalElement]: {
		[ACTIONS.download]: DownloadGlobalElementsTask,
	},
	[RESOURCES.setting]: {
		[ACTIONS.download]: DownloadSettingsTask,
	},
	[RESOURCES.page]: {
		[ACTIONS.download]: DownloadSitePageTask,
	},
} satisfies {
	[key in ResourceType]: {
		[key in PullAction]: typeof DownloadResourceTask
	}
};

export const genPushTaskInstance = (
	resourceTaskConfig: PushResourceTaskConfig,
): ResourceTask => {
	const { resource, action } = resourceTaskConfig;
	return new PushTaskMap[resource][action](resourceTaskConfig);
};

export const genPullTaskInstance = (
	resourceTaskConfig: PullResourceTaskConfig,
	resouceObject: ResourcePullObjects,
): ResourceTask => {
	const { resource, action } = resourceTaskConfig;
	return new PullTaskMap[resource][action](resourceTaskConfig, resouceObject);
};

export const isTaskPushPayload = (taskPayload: TaskPayload): boolean => taskPayload.action !== ACTIONS.download;

export const genResourcePullFilePath = (resource: ResourceType, resouceObject: ResourcePullObjects): string => {
	if (resource === RESOURCES.theme) {
		const { path } = resouceObject as ThemeFileMeta;
		return path;
	}

	if (resource === RESOURCES.globalElement) {
		return SDK.genGlobalElementPath(resouceObject as SiteGlobalElement);
	}

	if (resource === RESOURCES.setting) {
		return SDK.genSettingPath(resouceObject as SiteSetting);
	}

	if (resource === RESOURCES.page) {
		return SDK.genSitePagePath(resouceObject as SitePage);
	}

	throw new Error('unsupported resource');
};

export const isPullTask = (task: ResourceTask): boolean => {
	return PULL_ACTIONS.includes(task.action as any);
};

export const isPushTask = (task: ResourceTask): boolean => {
	return PUSH_ACTIONS.includes(task.action as any);
};
