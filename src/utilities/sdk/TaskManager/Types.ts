import {
	ThemeFileMeta, SitePage, SiteSetting, SiteGlobalElement,
} from '../../api/Types.js';
import { ServerError } from '../../api/errors.js';
import {
	ResourceType, PushAction, PullAction, Action,
} from '../Types.js';
import { SDK } from '../index.js';
import { TaskError } from './Errors/TaskError.js';

export interface ResourceTaskSummary {
	title: string;
	state: TaskStatesTypes;
	error?: TaskError | ServerError;
	cancelledReason?: string;
}

export interface ResourceTaskConfig {
	action: PullAction | PushAction;
	resource: ResourceType,
	sdk: InstanceType<typeof SDK>,
	siteId: string,
	siteThemeId: string,
	filePath: string,
	themeDir: string,
}

export interface PushResourceTaskConfig extends ResourceTaskConfig{
	action: PushAction,
}
export interface PullResourceTaskConfig extends ResourceTaskConfig{
	action: PullAction,
}

export type ResourcePullObjects = ThemeFileMeta | SitePage | SiteSetting | SiteGlobalElement;

export type TaskStatesTypes = 'pending' | 'complete' | 'error' | 'cancelled';

export interface TaskManagerConfig {
	sdk: InstanceType<typeof SDK>,
	siteId: string,
	siteThemeId: string,
	themeDir: string,
}

export interface BaseTaskPayload {
	action: Action;
	resource: ResourceType;
	filePath: string;
}
export interface PushTaskPayload extends BaseTaskPayload {
	action: PushAction;
}

export interface PullTaskPayload extends BaseTaskPayload {
	action: PullAction
	resourceObject: ResourcePullObjects;
}

export type TaskPayload = PushTaskPayload | PullTaskPayload;
