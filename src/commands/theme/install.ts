import { Flags } from '@oclif/core';
import { ux } from '@oclif/core';
import { getAccessToken } from '../../utilities/permissions.js';
import { SDK } from '../../utilities/sdk/index.js';
import { ONLINE_STORE_CUSTOM_THEME_WRITE, ONLINE_STORE_SITE_READ } from '../../utilities/api/constants.js';
import { strings, substituteValues } from '../../translations/index.js';
import { confirmPrompt, siteSelectorPrompt } from '../../components/prompts.js';
import log from '../../components/ui/display/Log.js';
import { checkConfig } from '../../utilities/configuration.js';
import { printSimpleList } from '../../components/table.js';
import { BaseCommand } from '../../baseCommand.js';
import { ProcessFileLogger } from '../../utilities/filesystem.js';
import { Site } from '../../utilities/api/Types.js';

const commandStrings = strings.commands.theme.install;
const { flags: flagsStrings,
	body: bodyStrings,
	description } = commandStrings;

export default class Install extends BaseCommand<typeof Install> {
	static description = description;

	static examples = [
		'<%= config.bin %> <%= command.id %>',
	]

	static flags = {
		siteId: Flags.string({
			description: flagsStrings.siteId.description,
		}),
	}

	static args = {}
	static permissionScopes = [ONLINE_STORE_SITE_READ, ONLINE_STORE_CUSTOM_THEME_WRITE];

	public async run(): Promise<void> {
		const { flags } = await this.parse(Install);
		try {
			await checkConfig(this.config.configDir);
		} catch (error: any) {
			error as Error;
			log(error.message, 'error');
			return;
		}

		const accessToken = await getAccessToken(this.config.configDir);
		if (!accessToken) {
			return;
		}

		const sdk = new SDK(accessToken, this.fileLogger as ProcessFileLogger, this.verbose);

		// If siteId is passed. Check Site has no theme installed.
		let selectedSite: undefined | Site;
		if (flags.siteId) {
			selectedSite = await sdk.getSite(flags.siteId);
			if (!selectedSite) {
				log(bodyStrings.siteNotFound, 'error');
				return;
			}

			if (selectedSite.siteThemeId) {
				log(bodyStrings.siteThemeInstalled, 'error');
				return;
			}
		}

		// If siteId is not passed, then get site selector.
		if (!selectedSite) {
			const allSites = await sdk.getSites();
			if (allSites.length === 0) {
				log(bodyStrings.noSitesToInstall);
				return;
			}

			const sitesWithoutThemes = SDK.filterSitesWithoutThemes(allSites);
			if (sitesWithoutThemes.length === 0) {
				log(bodyStrings.allSitesHaveThemesInstalled);
				const sitesWithThemes = await SDK.filterSitesWithThemes(allSites);
				const siteTitles = sitesWithThemes.map(site => site.siteTitle || '');
				printSimpleList(bodyStrings.siteTitleList, siteTitles);
				log(bodyStrings.usePullCommandToClone);
				return;
			}

			selectedSite = await siteSelectorPrompt(sitesWithoutThemes);
		}

		const confirmInstallPromptMessage = substituteValues(
			bodyStrings.confirmInstallBriskOnSite,
			{
				siteTitle: selectedSite.siteTitle,
			},
		);

		const shouldContinue = await confirmPrompt(confirmInstallPromptMessage);
		if (!shouldContinue) {
			return;
		}

		ux.action.start(bodyStrings.startInstalling);
		await sdk.installTheme(selectedSite.id as string);
		ux.action.stop(bodyStrings.doneInstalling);

		const shouldPull = await confirmPrompt(bodyStrings.confirmLocalPull);
		if (!shouldPull) {
			return;
		}

		await this.config.runCommand('theme:pull', [`--siteId=${selectedSite.id}`]);
	}
}
