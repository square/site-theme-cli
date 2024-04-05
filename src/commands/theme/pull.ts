import { Flags } from '@oclif/core';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { getAccessToken } from '../../utilities/permissions.js';
import { SDK } from '../../utilities/sdk/index.js';
import {
	ONLINE_STORE_CUSTOM_THEME_READ,
	ONLINE_STORE_SITE_READ,
} from '../../utilities/api/constants.js';
import {
	ProcessFileLogger,
	isDirValidForPull,
	isFilePathAbsolute,
	prepareDirForPull,
	FileIgnorer,
} from '../../utilities/filesystem.js';
import log from '../../components/ui/display/Log.js';
import { strings, substituteValues } from '../../translations/index.js';
import {
	confirmPrompt, siteSelectorPrompt, textInputPrompt,
} from '../../components/prompts.js';
import { runTasksFromManager } from '../../components/tasks.js';
import { TaskManager } from '../../utilities/sdk/TaskManager/index.js';
import { checkConfig } from '../../utilities/configuration.js';
import { Site } from '../../utilities/api/Types.js';
import { printSimpleList } from '../../components/table.js';
import { BaseCommand } from '../../baseCommand.js';

const commandStrings = strings.commands.theme.pull;
const { flags: flagsStrings,
	body: bodyStrings,
	description } = commandStrings;

export default class Pull extends BaseCommand<typeof Pull> {
	static description = description;

	static examples = [
		'<%= config.bin %> <%= command.id %>',
	]

	static flags = {
		siteId: Flags.string({
			description: flagsStrings.siteId.description,
		}),
		accessToken: Flags.string({
			description: flagsStrings.accessToken.description,
		}),
		yes: Flags.boolean({
			description: flagsStrings.yes.description,
		}),
		themeDir: Flags.string({
			description: flagsStrings.themeDir.description,
		}),
	}

	static args = {};

	static permissionScopes = [ONLINE_STORE_SITE_READ, ONLINE_STORE_CUSTOM_THEME_READ];

	public async run(): Promise<void> {
		const { flags } = await this.parse(Pull);
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

		if (!selectedSite) {
			// 2. List Sites and Choose Site
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
				bodyStrings.selectSite,
			);
		}

		// 3. Where  would you like to save files.
		let fullDestinationDir = flags.themeDir;
		if (!fullDestinationDir) {
			fullDestinationDir = await textInputPrompt(bodyStrings.promptThemeDir, 'brisk');
		}

		// 4. Validate the directory. If directory exists would they like to continue?
		if (!isFilePathAbsolute(fullDestinationDir)) {
			fullDestinationDir = join('/', cwd(), fullDestinationDir);
		}

		const isValid = await isDirValidForPull(fullDestinationDir);

		if (!isValid && !flags.yes) {
			const confirmPromptMessage = substituteValues(bodyStrings.overwriteWarning, {
				destinationDir: fullDestinationDir,
			});
			const shouldContinue = await confirmPrompt(confirmPromptMessage);
			if (!shouldContinue) {
				return;
			}
		}

		log(bodyStrings.preparingDir);
		await prepareDirForPull(fullDestinationDir);
		// 5. Download the files.
		// a. Get the list of files.
		const resources = await sdk.getSiteThemeResources(selectedSite.id as string, selectedSite.siteThemeId as string);
		const fileIgnorer = await FileIgnorer.fromIgnoreFile(fullDestinationDir);
		// b. Download them in batches.
		const taskManager = new TaskManager({
			sdk,
			siteId: selectedSite.id as string,
			siteThemeId: selectedSite.siteThemeId as string,
			themeDir: fullDestinationDir,
		});

		taskManager.addTasksFromPullThemeResources(resources, fileIgnorer);
		await runTasksFromManager(bodyStrings.downloadListTitle, taskManager, 8);
	}
}
