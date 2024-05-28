/* eslint-disable unicorn/no-useless-undefined */
import {
	afterEach, describe, expect, it, vi,
} from 'vitest';
import { SDK } from '../../../src/utilities/sdk/index.js';
import Install from '../../../src/commands/theme/install.js';
import { ONLINE_STORE_CUSTOM_THEME_WRITE, ONLINE_STORE_SITE_READ } from '../../../src/utilities/api/constants.js';
import { checkHasAccessTokenPermission, getAccessToken } from '../../../src/utilities/permissions.js';
import { checkConfig } from '../../../src/utilities/configuration.js';
import {
	siteSelectorPrompt,
	confirmPrompt,
	themeSelectorPrompt,
} from '../../../src/components/prompts.js';
import * as Log from '../../../src/components/ui/display/Log.js';

vi.mock('../../../src/utilities/permissions.js');
vi.mock('../../../src/utilities/configuration.js');
vi.mock('../../../src/components/prompts.js');

const mockedCustomTheme = {
	id: '111',
	name: 'Custom Theme 1',
	siteId: '12312332',
	updatedAt: '112323',
	createdAt: 'asdasd',
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe('install', () => {
	it('Run theme install', async () => {
		vi.mocked(checkHasAccessTokenPermission).mockResolvedValue(true);
		vi.mocked(getAccessToken).mockResolvedValue('FAKE_TOKEN');
		vi.mocked(checkConfig).mockResolvedValue(undefined);
		vi.spyOn(SDK.prototype, 'getCustomThemes').mockResolvedValue([mockedCustomTheme]);

		vi.spyOn(SDK.prototype, 'getTokenPermissions').mockResolvedValue([ONLINE_STORE_SITE_READ, ONLINE_STORE_CUSTOM_THEME_WRITE]);

		vi.mocked(siteSelectorPrompt).mockResolvedValue({
			id: '12312332',
			siteTitle: 'Square Online Site 1',
		});
		vi.mocked(themeSelectorPrompt).mockResolvedValue(mockedCustomTheme);
		vi.mocked(confirmPrompt).mockResolvedValueOnce(true).mockResolvedValueOnce(false);

		const getSitesSpy = vi.spyOn(SDK.prototype, 'getSites' as never).mockResolvedValue([
			{
				id: '12312332',
				siteTitle: 'Square Online Site 1',
				siteThemeId: null,
			},
			{
				id: '3e3432',
				siteTitle: 'Square Online Site 2',
				siteThemeId: null,
			},
		]);
		const installThemeSpy = vi.spyOn(SDK.prototype, 'installTheme').mockResolvedValue(mockedCustomTheme);

		await Install.run([]);
		expect(getSitesSpy).toHaveBeenCalledOnce();
		expect(installThemeSpy).toHaveBeenCalledOnce();
	});

	it('Swallows errors thrown by config check', async () => {
		const errorMsg = 'Kaboom';
		vi.mocked(checkConfig).mockImplementation(() => {
			throw new Error(errorMsg);
		});
		const logSpy = vi.spyOn(Log, 'default');
		await Install.run([]);
		expect(logSpy).toHaveBeenCalledWith(errorMsg, 'error');
	});
});

describe('when there is a missing access token', () => {
	it('returns', async () => {
		vi.mocked(checkHasAccessTokenPermission).mockResolvedValue(true);
		vi.mocked(getAccessToken).mockResolvedValue(undefined);
		vi.mocked(checkConfig).mockResolvedValue(undefined);
		const getSitesSpy = vi.spyOn(SDK.prototype, 'getSites' as never).mockResolvedValue([]);
		await Install.run([]);
		expect(getSitesSpy).toHaveBeenCalledTimes(0);
	});
});

describe('when there are no sites', () => {
	it('returns', async () => {
		vi.mocked(checkHasAccessTokenPermission).mockResolvedValue(true);
		vi.mocked(getAccessToken).mockResolvedValue('FAKE_TOKEN');
		vi.mocked(checkConfig).mockResolvedValue(undefined);
		const getSitesSpy = vi.spyOn(SDK.prototype, 'getSites' as never).mockResolvedValue([]);
		await Install.run([]);
		expect(getSitesSpy).toHaveBeenCalledOnce();
	});
});
