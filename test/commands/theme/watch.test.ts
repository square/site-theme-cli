/* eslint-disable unicorn/no-useless-undefined */
import {
	afterAll, describe, expect, it, vi,
} from 'vitest';
import { SDK } from '../../../src/utilities/sdk/index.js';
import Watch from '../../../src/commands/theme/watch.js';
import {
	ONLINE_STORE_CUSTOM_THEME_READ, ONLINE_STORE_SITE_READ, ONLINE_STORE_CUSTOM_THEME_WRITE,
} from '../../../src/utilities/api/constants.js';
import * as Log from '../../../src/components/ui/display/Log.js';
import * as Link from '../../../src/components/ui/display/Link.js';
import { strings } from '../../../src/translations/index.js';
import { checkConfig } from '../../../src/utilities/configuration.js';

describe('watch', async () => {
	vi.mock('../../../src/utilities/configuration.js', () => ({
		checkConfig: vi.fn().mockResolvedValue(undefined),
	}));
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
						path: '/site/global/sections/fake.html.twig',
						hash: 'acasdefere',
					},
					{
						path: '/theme/partials/header.html.twig',
						hash: 'acaererwqdwd',
					},
				],
			}),
			getFileContent: vi.fn().mockResolvedValue(JSON.stringify({ foo: 'bar' })),
			getFileStream: vi.fn().mockReturnValue('Dummy file stream'),
			getFileSize: vi.fn().mockResolvedValue(100),
			ThemeWatcher: class ThemeWatcherMock {
				public hasFilesForSync = () => true

				public getFileWatcherstore = () => ({
					create: {
						'/site/pages/home.json': Date.now(),
					},
					update: {
						'/theme/parital/update.json': Date.now(),
					},
					delete: {
						'/site/global/sections/banner.json': Date.now(),
					},
				})

				// eslint-disable-next-line @typescript-eslint/no-empty-function
				public close = () => {}
			},
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
	vi.spyOn(SDK.prototype, 'getSiteRoutes').mockResolvedValue(['/foo/bar']);
	const deleteThemeFileSpy = vi.spyOn(SDK.prototype, 'deleteThemeFile').mockResolvedValue();
	const deleteGlobalElementSpy = vi.spyOn(SDK.prototype, 'deleteGlobalElement').mockResolvedValue();

	it('Run watch with exit signal', async () => {
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
		await Watch.run([]);
		expect(deleteThemeFileSpy).toHaveBeenCalled();
		expect(updateThemeFileSpy).toHaveBeenCalled();
		expect(createSitePageSpy).toHaveBeenCalledOnce();
		expect(deleteGlobalElementSpy).toHaveBeenCalledOnce();
	});

	it('Exits if passed site id flag not found', async () => {
		const logSpy = vi.spyOn(Log, 'default');
		await Watch.run(['--siteId=999']);
		expect(logSpy).toHaveBeenCalledWith('Unable to find Square Online site.', 'error');
	});

	it('Exits if passed site id flag not found', async () => {
		const logSpy = vi.spyOn(Log, 'default');
		await Watch.run(['--siteId=999']);
		expect(logSpy).toHaveBeenCalledWith('Unable to find Square Online site.', 'error');
	});

	it('Exits if there are no sites with themes', async () => {
		vi.spyOn(SDK.prototype, 'getSites').mockResolvedValue([
			{
				id: '3e3432',
				siteTitle: 'Square Online Site 2',
				siteThemeId: null,
			},
		]);
		const logSpy = vi.spyOn(Log, 'default');
		await Watch.run([]);
		expect(logSpy).toHaveBeenCalledWith(strings.commands.theme.push.body.useInstallCommand);
	});

	it('Hot reloads', async () => {
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
		const showLinkSpy = vi.spyOn(Link, 'showLink');
		await Watch.run(['--hotReload']);
		expect(showLinkSpy).toHaveBeenCalledOnce();
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});
});

describe('errors', () => {
	it('Swallows errors thrown by config check', async () => {
		const errorMsg = 'Kaboom';
		vi.mocked(checkConfig).mockImplementation(() => {
			throw new Error(errorMsg);
		});
		const logSpy = vi.spyOn(Log, 'default');
		await Watch.run([]);
		expect(logSpy).toHaveBeenCalledWith(errorMsg, 'error');
	});
});
