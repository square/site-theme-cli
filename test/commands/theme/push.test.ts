/* eslint-disable unicorn/no-useless-undefined */
import {
	afterAll, describe, expect, it, vi,
} from 'vitest';
import { SDK } from '../../../src/utilities/sdk/index.js';
import Push from '../../../src/commands/theme/push.js';
import {
	ONLINE_STORE_CUSTOM_THEME_READ, ONLINE_STORE_SITE_READ, ONLINE_STORE_CUSTOM_THEME_WRITE,
} from '../../../src/utilities/api/constants.js';
import * as Log from '../../../src/components/ui/display/Log.js';
import { strings } from '../../../src/translations/index.js';
import { checkConfig } from '../../../src/utilities/configuration.js';

describe('push', () => {
	vi.mock('../../../src/utilities/configuration.js');
	vi.mock('../../../src/utilities/permissions.js', () => ({
		getAccessToken: vi.fn().mockResolvedValue('FAKE_TOKEN'),
		checkHasAccessTokenPermission: vi.fn().mockResolvedValue(true),
	}));

	vi.mock('../../../src/components/prompts.js', () => ({
		siteSelectorPrompt: vi.fn().mockResolvedValue({
			id: '12312332',
			siteTitle: 'Square Online Site 1',
			siteThemeId: 'asdas',
		}),
		textInputPrompt: vi.fn().mockResolvedValue('./brisk'),
		confirmPrompt: vi.fn().mockResolvedValue(true),
	}));

	vi.spyOn(SDK.prototype, 'getTokenPermissions').mockResolvedValue([
		ONLINE_STORE_CUSTOM_THEME_READ,
		ONLINE_STORE_SITE_READ,
		ONLINE_STORE_CUSTOM_THEME_WRITE,
	]);

	vi.mock('../../../src/utilities/filesystem.js', async () => {
		const actual = await vi.importActual('../../../src/utilities/filesystem.js');
		return {
			...actual as Record<string, any>,
			isValidThemeDir: vi.fn().mockResolvedValue(true),
			getLocalThemeState: vi.fn().mockResolvedValue({
				files: [
					{
						path: '/site/pages/about.json',
						hash: 'ascasdad',
					},
					{
						path: '/site/global/sections/fake.json',
						hash: 'acasdefere',
					},
					{
						path: '/theme/partials/header.html.twig',
						hash: 'acaererwqdwd',
					},
				],
			}),
			getFileSize: vi.fn().mockResolvedValue(100),
			getFileStream: vi.fn().mockReturnValue('Dummy file stream'),
			getFileContent: vi.fn().mockResolvedValue(JSON.stringify({ foo: 'bar' })),
		};
	});

	vi.spyOn(SDK.prototype, 'getRemoteThemeState').mockResolvedValue({
		files: [
			{
				path: '/site/global/sections/fake.json',
				hash: 'acasdefere',
			},
			{
				path: '/theme/partials/header.html.twig',
				hash: 'acaererwqdwsdsd',
			},
			{
				path: '/theme/partials/footer.html.twig',
				hash: 'acaererwqdwd',
			},
		],
	});
	const createSitePageSpy = vi.spyOn(SDK.prototype, 'createSitePage').mockResolvedValue({
		id: 'asdsada',
		siteId: 'asddsd',
		name: 'about',
		route: '/about',
		properties: JSON.stringify({ foo: 'bar' }),
		updatedAt: '112323',
		createdAt: 'asdasd',
	});
	const updateThemeFileSpy = vi.spyOn(SDK.prototype, 'updateThemeFile').mockResolvedValue({
		path: '/theme/partials/header.html.twig',
		siteThemeId: '111',
		checksum: 'sdas',
		contentType: 'text/plain',
		size: 3,
		updatedAt: '112323',
	});
	const deleteThemeFileSpy = vi.spyOn(SDK.prototype, 'deleteThemeFile').mockResolvedValue();
	it('Run Push With no siteId flag', async () => {
		vi.mocked(checkConfig).mockResolvedValue(undefined);
		vi.spyOn(SDK.prototype, 'getSites').mockResolvedValue([
			{
				id: '12312332',
				siteTitle: 'Square Online Site 1',
				siteThemeId: 'asdas',
			},
			{
				id: '3e3432',
				siteTitle: 'Square Online Site 2',
				siteThemeId: null,
			},
		]);
		await Push.run([]);
		expect(deleteThemeFileSpy).toHaveBeenCalled();
		expect(updateThemeFileSpy).toHaveBeenCalled();
		expect(createSitePageSpy).toHaveBeenCalledOnce();
	});
	it('Swallows errors thrown by config check', async () => {
		const errorMsg = 'Kaboom';
		vi.mocked(checkConfig).mockImplementation(() => {
			throw new Error(errorMsg);
		});
		const logSpy = vi.spyOn(Log, 'default');
		await Push.run([]);
		expect(logSpy).toHaveBeenCalledWith(errorMsg, 'error');
	});
	it('Exits if passed site flag has no theme', async () => {
		vi.mocked(checkConfig).mockResolvedValue(undefined);
		vi.spyOn(SDK.prototype, 'getSites').mockResolvedValue([
			{
				id: '3e3432',
				siteTitle: 'Square Online Site 2',
				siteThemeId: null,
			},
		]);
		const logSpy = vi.spyOn(Log, 'default');
		await Push.run(['--siteId=3e3432']);
		expect(logSpy).toHaveBeenCalledWith(strings.commands.theme.push.body.siteNoThemeInstalled, 'error');
	});
	it('Exits if no sites have themes', async () => {
		vi.mocked(checkConfig).mockResolvedValue(undefined);
		vi.spyOn(SDK.prototype, 'getSites').mockResolvedValue([
			{
				id: '3e3432',
				siteTitle: 'Square Online Site 2',
				siteThemeId: null,
			},
		]);
		const logSpy = vi.spyOn(Log, 'default');
		await Push.run([]);
		expect(logSpy).toHaveBeenCalledWith(strings.commands.theme.push.body.noSitesWithThemesInstalled);
	});

	afterAll(() => {
		vi.resetAllMocks();
	});
});
