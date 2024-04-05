import { Flags } from '@oclif/core';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { getAccessToken } from '../../utilities/permissions.js';
import { SDK } from '../../utilities/sdk/index.js';
import {
	ONLINE_STORE_CUSTOM_THEME_READ,
	ONLINE_STORE_CUSTOM_THEME_WRITE,
	ONLINE_STORE_SITE_READ,
} from '../../utilities/api/constants.js';
import {
	FileIgnorer,
	ProcessFileLogger,
	ThemeWatcher, getLocalThemeState, isFilePathAbsolute, isValidThemeDir,
} from '../../utilities/filesystem.js';
import { strings, substituteValues } from '../../translations/index.js';
import {
	confirmPrompt, siteSelectorPrompt, textInputPrompt,
} from '../../components/prompts.js';
import { runTasksFromManager } from '../../components/tasks.js';
import log from '../../components/ui/display/Log.js';
import { Site } from '../../utilities/api/Types.js';
import { TaskManager } from '../../utilities/sdk/TaskManager/index.js';
import { checkConfig } from '../../utilities/configuration.js';
import { LocalServer } from '../../utilities/server.js';
import { printSimpleList } from '../../components/table.js';
import { getPreviewUrl } from '../../utilities/preview.js';
import { showLink } from '../../components/ui/display/Link.js';
import { BaseCommand } from '../../baseCommand.js';
import { printDeltaObjectSummary } from '../../components/custom.js';

const commandStrings = strings.commands.theme.watch;
const { flags: flagsStrings,
	body: bodyStrings,
	description } = commandStrings;

export default class Watch extends BaseCommand<typeof Watch> {
	static description = substituteValues(description,
		{ ignoreList: FileIgnorer.basePatternsToString() }) ;

	static examples = [
		'<%= config.bin %> <%= command.id %>',
	]

	static flags = {
		themeDir: Flags.string({
			description: flagsStrings.themeDir.description,
		}),
		siteId: Flags.string({
			description: flagsStrings.siteId.description,
		}),
		hotReload: Flags.boolean({
			description: flagsStrings.hotReload.description,
		}),
		omitDelete: Flags.boolean({
			description: flagsStrings.omitDelete.description,
		}),
	}

	static permissionScopes = [
		ONLINE_STORE_CUSTOM_THEME_READ,
		ONLINE_STORE_SITE_READ,
		ONLINE_STORE_CUSTOM_THEME_WRITE,
	];

	static args = {};

	public async run(): Promise<void> {
		const LOCAL_SERVER_PORT = 8035;
		const CHANGE_LOOP_INTERVAL = 1500;
		const { flags } = await this.parse(Watch);
		try {
			await checkConfig(this.config.configDir);
		} catch (error: any) {
			error as Error;
			log(error.message, 'error');
			return;
		}
		// 1. Check Access Token

		const accessToken = await getAccessToken(this.config.configDir);
		if (!accessToken) {
			return;
		}

		const sdk = new SDK(accessToken, this.fileLogger as ProcessFileLogger, this.verbose);

		// 2. If siteId is passed. Check Site has a theme installed. If not exit with an error message
		let selectedSite: undefined | Site;
		if (flags.siteId) {
			selectedSite = await sdk.getSite(flags.siteId);
			if (!selectedSite) {
				log(bodyStrings.siteNotFound, 'error');
				return;
			}

			if (!selectedSite.siteThemeId) {
				log(bodyStrings.siteNoThemeInstalled, 'error');
				return;
			}
		}

		// 3. If not siteId is not passed, then get site selector.
		if (!selectedSite) {
			const allSites = await sdk.getSites();
			if (allSites.length === 0) {
				log(bodyStrings.noSquareOnlineSitesFound);
				return;
			}

			const sitesWithThemes = SDK.filterSitesWithThemes(allSites);
			if (sitesWithThemes.length === 0) {
				log(bodyStrings.noSitesWithThemesInstalled);
				const sitesWithoutThemes = SDK.filterSitesWithoutThemes(allSites);
				const siteTitles = sitesWithoutThemes.map(site => site.siteTitle || '');
				printSimpleList(bodyStrings.siteTitleList, siteTitles);
				log(bodyStrings.useInstallCommand);
				return;
			}

			selectedSite = await siteSelectorPrompt(
				sitesWithThemes,
				bodyStrings.selectSitePrompt,
			);
		}

		// 4. Check if a themeDir is present and valid.
		let themeDir: string | undefined;
		if (flags.themeDir) {
			const valid = await isValidThemeDir(flags.themeDir);
			if (valid) {
				themeDir = flags.themeDir;
			} else {
				log(bodyStrings.invalidThemeDir, 'warn');
			}
		}

		// 5. If not, prompt user to enter a theme dir. Analyze and re-prompt if necessary.
		while (!themeDir) {
			const input = await textInputPrompt(bodyStrings.themeDirPrompt);
			const valid = await isValidThemeDir(input);
			if (valid) {
				themeDir = input;
				break;
			} else {
				log(bodyStrings.invalidThemeDir, 'warn');
			}
		}

		if (!isFilePathAbsolute(themeDir)) {
			themeDir = join('/', cwd(), themeDir);
		}

		const fileIgnorer = await FileIgnorer.fromIgnoreFile(themeDir);

		// 6. Analyze theme changes and generate a delta list.
		const localThemeState = await getLocalThemeState(themeDir, fileIgnorer);
		const remoteThemeState = await sdk.getRemoteThemeState(selectedSite.id as string, selectedSite.siteThemeId as string);
		const deltaObject = SDK.genRemoteDeltaObject(localThemeState, remoteThemeState, flags.omitDelete);

		const isThemeDirOutOfSync = SDK.deltaObjectHasChanges(deltaObject);
		const taskManager = new TaskManager({
			sdk,
			siteId: selectedSite.id as string,
			siteThemeId: selectedSite.siteThemeId as string,
			themeDir,
		});
		if (isThemeDirOutOfSync) {
			printDeltaObjectSummary(deltaObject);
			const shouldPush = await confirmPrompt(bodyStrings.confirmPushForOutOfSync);
			if (shouldPush) {
				taskManager.addTasksFromDeltaPushState(deltaObject);
				await runTasksFromManager(bodyStrings.pushTaskFileTitle, taskManager, 4);
			}
		}

		// Start watcher
		const themeWatcher = new ThemeWatcher(themeDir, fileIgnorer);
		// Sync Queue
		let server: undefined | InstanceType<typeof LocalServer>;
		if (flags.hotReload) {
			server = new LocalServer(LOCAL_SERVER_PORT);
			await server.start();
			const previewRoutes = await sdk.getSiteRoutes(selectedSite.id as string);
			log(bodyStrings.previewChangesPrompt);
			for (const previewRoute of previewRoutes) {
				const previewRouteUrl = getPreviewUrl(
					selectedSite.id as string,
					previewRoute,
					LOCAL_SERVER_PORT,
				);
				showLink(previewRouteUrl);
			}
		}

		let breakWatcher = false;
		const loopHandler = async () => {
			if (themeWatcher.hasFilesForSync()) {
				const themeWatcherStore = themeWatcher.getFileWatcherStore();
				taskManager.addTasksFromThemeWatcherStore(themeWatcherStore);
				await runTasksFromManager(bodyStrings.syncThemeFilesTitle, taskManager, 4);
				if (server) {
					server.notifyWebSocketsOfSourceChange();
				}
			}

			if (breakWatcher || !taskManager.isHealthy()) {
				log('Exiting watcher');
				themeWatcher.close();
			} else {
				setTimeout(loopHandler, CHANGE_LOOP_INTERVAL);
			}
		};

		setTimeout(loopHandler, CHANGE_LOOP_INTERVAL);
		log(substituteValues(
			bodyStrings.startingWatcher,
			{
				themeDir,
			},
		));
		await textInputPrompt(bodyStrings.exiting);
		breakWatcher = true;
	}
}
