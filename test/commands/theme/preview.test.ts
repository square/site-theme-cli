/* eslint-disable unicorn/no-useless-undefined */
import {
	afterAll, describe, expect, it, vi,
} from 'vitest';
import { SDK } from '../../../src/utilities/sdk/index.js';
import Preview from '../../../src/commands/theme/preview.js';
import { checkConfig } from '../../../src/utilities/configuration.js';
import { getAccessToken, checkHasAccessTokenPermission } from '../../../src/utilities/permissions.js';
import * as Log from '../../../src/components/ui/display/Log.js';

describe('install', () => {
	vi.mock('../../../src/utilities/permissions.js');
	vi.mock('../../../src/utilities/configuration.js');

	const getSitesRouteSpy = vi.spyOn(SDK.prototype, 'getSiteRoutes' as never).mockResolvedValue([
		'/home',
	]);

	vi.mock('../../../src/components/prompts.js', () => ({
		siteSelectorPrompt: vi.fn().mockResolvedValue({
			id: '12312332',
			siteTitle: 'Square Online Site 1',
			siteThemeId: '12345',
		}),
		confirmPrompt: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
	}));

	it('Run theme preview', async () => {
		vi.mocked(checkConfig).mockResolvedValue(undefined);
		vi.mocked(getAccessToken).mockResolvedValue('FAKE_TOKEN');
		vi.mocked(checkHasAccessTokenPermission).mockResolvedValue(true);
		const getSitesSpy = vi.spyOn(SDK.prototype, 'getSites' as never).mockResolvedValue([
			{
				id: '12312332',
				siteTitle: 'Square Online Site 1',
				siteThemeId: '12345',
			},
			{
				id: '3e3432',
				siteTitle: 'Square Online Site 2',
				siteThemeId: '6789',
			},
		]);
		await Preview.run([]);
		expect(getSitesRouteSpy).toHaveBeenCalledOnce();
		expect(getSitesSpy).toHaveBeenCalledOnce();
	});

	it('Swallows errors thrown by config check', async () => {
		const errorMsg = 'Kaboom';
		vi.mocked(checkConfig).mockImplementation(() => {
			throw new Error(errorMsg);
		});
		const logSpy = vi.spyOn(Log, 'default');
		await Preview.run([]);
		expect(logSpy).toHaveBeenCalledWith(errorMsg, 'error');
	});

	it('returns when site flag not found', async () => {
		vi.mocked(checkConfig).mockResolvedValue(undefined);
		vi.mocked(getAccessToken).mockResolvedValue('FAKE_TOKEN');
		vi.mocked(checkHasAccessTokenPermission).mockResolvedValue(true);
		const logSpy = vi.spyOn(Log, 'default');
		await Preview.run(['--siteId=1']);
		expect(logSpy).toHaveBeenCalledWith('Unable to find Square Online site.', 'error');
	});

	it('returns when access token not found', async () => {
		const getSitesSpy = vi.spyOn(SDK.prototype, 'getSites' as never);
		vi.mocked(checkConfig).mockResolvedValue(undefined);
		vi.mocked(getAccessToken).mockResolvedValue(undefined);
		vi.mocked(checkHasAccessTokenPermission).mockResolvedValue(true);
		await Preview.run(['--siteId=1']);
		expect(getSitesSpy).toHaveBeenCalledTimes(0);
	});

	it('returns when selected site has no theme', async () => {
		const getSitesSpy = vi.spyOn(SDK.prototype, 'getSites' as never).mockResolvedValue([
			{
				id: '12312332',
				siteTitle: 'Square Online Site 1',
				siteThemeId: null,
			},
		]);
		vi.mocked(checkConfig).mockResolvedValue(undefined);
		vi.mocked(getAccessToken).mockResolvedValue('FAKE_TOKEN');
		vi.mocked(checkHasAccessTokenPermission).mockResolvedValue(true);
		const logSpy = vi.spyOn(Log, 'default');
		await Preview.run(['--siteId=12312332']);
		expect(logSpy).toHaveBeenCalledWith('The Square Online site you have installed does not have a theme installed.', 'error');
		expect(getSitesSpy).toHaveBeenCalledOnce();
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});
});
