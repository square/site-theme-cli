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
	getLocalThemeState,
	isFilePathAbsolute,
	isValidThemeDir,
} from '../../utilities/filesystem.js';
import { strings, substituteValues } from '../../translations/index.js';
import {
	confirmPrompt, siteSelectorPrompt, textInputPrompt,
} from '../../components/prompts.js';
import { printSimpleList } from '../../components/table.js';
import { runTasksFromManager } from '../../components/tasks.js';
import log from '../../components/ui/display/Log.js';
import { Site } from '../../utilities/api/Types.js';
import { TaskManager } from '../../utilities/sdk/TaskManager/index.js';
import { checkConfig } from '../../utilities/configuration.js';
import { BaseCommand } from '../../baseCommand.js';
import { printDeltaObjectSummary } from '../../components/custom.js';

const commandStrings = strings.commands.theme.push;
const { flags: flagsStrings,
	body: bodyStrings,
	description } = commandStrings;

export default class Push extends BaseCommand<typeof Push> {
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
		omitDelete: Flags.boolean({
			description: flagsStrings.omitDelete.description,
		}),
		accessToken: Flags.string({
			description: flagsStrings.accessToken.description,
		}),
		yes: Flags.boolean({
			description: flagsStrings.yes.description,
		}),
	}

	static permissionScopes = [
		ONLINE_STORE_CUSTOM_THEME_READ,
		ONLINE_STORE_SITE_READ,
		ONLINE_STORE_CUSTOM_THEME_WRITE,
	];

	static args = {};

	public async run(): Promise<void> {
		const { flags } = await this.parse(Push);
		let accessToken = flags.accessToken;

		// 1. Check Config and Get Access Token if not supplied as flag.
		if (!accessToken) {
			try {
				await checkConfig(this.config.configDir);
			} catch (error: any) {
				error as Error;
				log(error.message, 'error');
				return;
			}

			accessToken = await getAccessToken(this.config.configDir);
		}

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
				bodyStrings.siteSelectorPrompt,
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
			const input = await textInputPrompt(bodyStrings.themeDirPushPrompt);
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
		const remoteThemeState = await sdk.getRemoteThemeState(
			selectedSite.id as string,
			selectedSite.siteThemeId as string);
		const deltaObject = SDK.genRemoteDeltaObject(localThemeState, remoteThemeState, flags.omitDelete);
		if (
			!SDK.hasChangesToPush(deltaObject)
		) {
			log(bodyStrings.noChangesToPush);
			return;
		}

		// 7. Confirm if the user should continue.
		printDeltaObjectSummary(deltaObject);

		if (!flags.yes) {
			const confirm = await confirmPrompt(bodyStrings.confirmPushPrompt);
			if (!confirm) {
				return;
			}
		}

		const taskManager = new TaskManager({
			sdk,
			siteId: selectedSite.id as string,
			siteThemeId: selectedSite.siteThemeId as string,
			themeDir,
		});

		taskManager.addTasksFromDeltaPushState(deltaObject);

		// 8. Start the push.
		await runTasksFromManager(bodyStrings.pushFilesTitle, taskManager, 4);
	}
}
