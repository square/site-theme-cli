import { SiteGlobalElementType } from './Types.js';

export const ONLINE_STORE_SITE_READ = 'ONLINE_STORE_SITE_READ';
export const ONLINE_STORE_CUSTOM_THEME_WRITE = 'ONLINE_STORE_CUSTOM_THEME_WRITE';
export const ONLINE_STORE_CUSTOM_THEME_READ = 'ONLINE_STORE_CUSTOM_THEME_READ';

export const globalElementTypes = {
	section: 'section',
	container: 'container',
} as {
	[key in SiteGlobalElementType]: SiteGlobalElementType
};

export const ALLOWED_CONTENT_TYPES = [
	'application/octet-stream',
	'text/plain',
	'text/css',
	'text/javascript',
	'text/json',
	'text/html',
	'text/markdown',
	'image/jpeg',
	'image/bmp',
	'image/gif',
	'image/png',
	'image/svg+xml',
	'image/webp',
	'font/woff',
	'font/woff2',
];

// Todo: Remove ENV override closer to GA.
export const API_HOST = process.env.API_HOST || 'https://connect.squareup.com/';

export const MAX_THEME_FILE_BYTE_SIZE = 15 * 1024 * 1024;

