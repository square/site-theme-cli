import {
	Action, PullAction, PushAction, ResourceType,
} from './Types.js';

export const ACTIONS = {
	update: 'update',
	delete: 'delete',
	create: 'create',
	download: 'download',
} satisfies {
    [key in Action]: Action
};

export const RESOURCES = {
	theme: 'theme',
	globalElement: 'global-element',
	setting: 'setting',
	page: 'page',
} satisfies {
	[key in string]: ResourceType;
};

export const PUSH_ACTIONS: PushAction[] = ['create', 'update', 'delete'];
export const PULL_ACTIONS: PullAction[] = ['download'];
