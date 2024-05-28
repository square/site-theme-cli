/* eslint-disable unicorn/no-useless-undefined */
import {
	afterAll, describe, expect, it, vi,
} from 'vitest';
import * as filesystem from '../../../src/utilities/filesystem.js';
import { SDK } from '../../../src/utilities/sdk/index.js';
import Pull from '../../../src/commands/theme/pull.js';
import { checkConfig } from '../../../src/utilities/configuration.js';
import { ONLINE_STORE_SITE_READ, ONLINE_STORE_CUSTOM_THEME_WRITE } from '../../../src/utilities/api/constants.js';
import * as Log from '../../../src/components/ui/display/Log.js';

describe('pull', () => {
	vi.mock('../../../src/utilities/permissions.js', () => ({
		getAccessToken: vi.fn().mockResolvedValue('FAKE_TOKEN'),
		checkHasAccessTokenPermission: vi.fn().mockResolvedValue(true),
	}));
	vi.mock('../../../src/utilities/configuration.js', () => ({
		checkConfig: vi.fn().mockResolvedValue(undefined),
	}));

	const mockedSites = [
		{
			id: '12312332',
			siteTitle: 'Square Online Site 1',
			siteThemeId: '111',
		},
		{
			id: '3e3432',
			siteTitle: 'Square Online Site 2',
			siteThemeId: null,
		},
	];

	const mockedCustomThemes = [
		{
			id: '111',
			name: 'Custom Theme 1',
			siteId: '12312332',
			updatedAt: '112323',
			createdAt: 'asdasd',
		},
	];

	vi.spyOn(SDK.prototype, 'getTokenPermissions').mockResolvedValue([ONLINE_STORE_SITE_READ, ONLINE_STORE_CUSTOM_THEME_WRITE]);

	vi.mock('../../../src/components/prompts.js', () => ({
		siteSelectorPrompt: vi.fn().mockResolvedValue({
			id: '12312332',
			siteTitle: 'Square Online Site 1',
			siteThemeId: '111',
		}),
		themeSelectorPrompt: vi.fn().mockResolvedValue({
			id: '111',
			name: 'Custom Theme 1',
			siteId: '12312332',
			updatedAt: '112323',
			createdAt: 'asdasd',
		}),
		textInputPrompt: vi.fn().mockResolvedValue('./brisk'),
		confirmPrompt: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
	}));

	const mockSiteThemeResources = {
		themeFiles: [
			{
				path: '/theme/test.txt',
				siteThemeId: '111',
				checksum: 'sdas',
				contentType: 'text/plain',
				size: 3,
			},
		],
		globalElements: [
			{
				name: 'test',
				type: 'container',
				properties: JSON.stringify({ foo: 'bar' }),
			},
		],
		sitePages: [
			{
				id: 'asdasdasd',
				name: 'about',
				route: '/about',
				siteId: '12312332',
				properties: JSON.stringify({ foo: 'bar' }),
			},
		],
		settings: [
			{
				name: 'test',
				properties: JSON.stringify({ foo: 'bar' }),
			},
		],
	};

	const downloadThemeFileSpy = vi.spyOn(SDK.prototype, 'downloadThemeFile').mockResolvedValue('FAKE CONTENT');

	vi.spyOn(filesystem, 'isDirValidForPull').mockResolvedValue(true);
	const prepareDirForPullSpy = vi.spyOn(filesystem, 'prepareDirForPull').mockResolvedValue();
	vi.spyOn(filesystem, 'prepareFileDir').mockResolvedValue();
	const saveFileSpy = vi.spyOn(filesystem, 'saveFile').mockResolvedValue();

	// test thar prepareDirForPull is called
	// test that getSiteThemeFiles is called
	// test that dowloadthemeFile is called
	// test that prepareFileDir is called
	// test that saveFile is called

	it('Run Pull with no siteId flag', async () => {
		const getSitesSpy = vi.spyOn(SDK.prototype, 'getSites').mockResolvedValue(mockedSites);
		const getSiteThemesSpy = vi.spyOn(SDK.prototype, 'getCustomThemes').mockResolvedValue(mockedCustomThemes);
		const getSiteThemeResourcesSpy = vi.spyOn(SDK.prototype, 'getSiteThemeResources' as never).mockResolvedValue(mockSiteThemeResources);

		await Pull.run([]);
		expect(getSitesSpy).toHaveBeenCalledOnce();
		expect(getSiteThemeResourcesSpy).toHaveBeenCalledOnce();
		expect(downloadThemeFileSpy).toHaveBeenCalled();
		expect(getSiteThemesSpy).toHaveBeenCalled();
		expect(prepareDirForPullSpy).toHaveBeenCalled();
		expect(saveFileSpy).toHaveBeenCalled();
	});

	afterAll(() => {
		vi.resetAllMocks();
	});
});

describe('errors', () => {
	it('Swallows errors thrown by config check', async () => {
		const errorMsg = 'Kaboom';
		vi.mocked(checkConfig).mockImplementation(() => {
			throw new Error(errorMsg);
		});
		const logSpy = vi.spyOn(Log, 'default');
		await Pull.run([]);
		expect(logSpy).toHaveBeenCalledWith(errorMsg, 'error');
	});
});
