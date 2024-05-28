/* eslint-disable new-cap */
import urlJoin from 'url-join';

// Token Status Endpoint
export const TOKEN_STATUS_ENDPOINT = '/oauth2/token/status';
// Sites Endpoints
export const SITES_ENDPOINT = '/v2/sites';
export const SITE_ENDPOINT = (siteId: string): string => urlJoin(SITES_ENDPOINT, `/${siteId}`);
export const SITE_THEME_ENDPOINT = (siteId: string, themeId: string): string => urlJoin(SITE_ENDPOINT(siteId), `/site-themes/${themeId}`);

// Page Endpoints
export const PAGES_ENDPOINT = (siteId: string, themeId: string): string => urlJoin(SITE_THEME_ENDPOINT(siteId, themeId), '/pages');
export const PAGE_ENDPOINT = (siteId: string, themeId: string, pageId: string): string => urlJoin(PAGES_ENDPOINT(siteId, themeId), `/${pageId}`);

// Theme Endpoints
export const THEMES_ENDPOINT = (siteId: string): string => urlJoin(SITE_ENDPOINT(siteId), '/themes');
export const THEME_ENDPOINT = (siteId: string, siteThemeId: string): string => urlJoin(THEMES_ENDPOINT(siteId), `/${siteThemeId}`);
export const THEME_FILES_ENDPOINT = (siteId: string, siteThemeId: string): string => urlJoin(THEME_ENDPOINT(siteId, siteThemeId), '/files');

// Settings Endpoints
export const SETTINGS_ENDPOINT = (siteId: string, themeId: string): string => urlJoin(SITE_THEME_ENDPOINT(siteId, themeId), '/settings');

// Global Elements Endpoints
export const GLOBAL_ELEMENTS_ENDPOINT = (siteId: string, themeId: string): string => urlJoin(SITE_THEME_ENDPOINT(siteId, themeId), '/global-elements');
