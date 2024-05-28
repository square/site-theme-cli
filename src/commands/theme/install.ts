import { Flags } from '@oclif/core';
import { getAccessToken } from '../../utilities/permissions.js';
import { SDK } from '../../utilities/sdk/index.js';
import { ONLINE_STORE_CUSTOM_THEME_WRITE, ONLINE_STORE_SITE_READ } from '../../utilities/api/constants.js';
import { strings } from '../../translations/index.js';
import {
	siteSelectorPrompt, textInputPrompt, themeSelectorPrompt,
} from '../../components/prompts.js';
import log from '../../components/ui/display/Log.js';
import { checkConfig } from '../../utilities/configuration.js';
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
	];

	static flags = {
		siteId: Flags.string({
			description: flagsStrings.siteId.description,
		}),
	};

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
		const allSites = await sdk.getSites();

		// Check if siteId is passed
		let selectedSite: undefined | Site;
		if (flags.siteId) {
			selectedSite = await sdk.getSite(flags.siteId);
			if (!selectedSite) {
				log(bodyStrings.siteNotFound, 'error');
				return;
			}
		}

		if (allSites.length === 0) {
			log(bodyStrings.noSitesToInstall);
			return;
		}

		// If siteId is not passed, then get site selector.
		if (!selectedSite) {
			selectedSite = await siteSelectorPrompt(allSites);
		}

		const siteId = selectedSite.id;
		const [
			marketThemes,
			customThemes,
		] = await Promise.all([
			sdk.getMarketThemes(),
			sdk.getCustomThemes(siteId as string),
		]);
		const allThemes = [
			...marketThemes,
			...customThemes,
		];
		const baseTheme = await themeSelectorPrompt(allThemes);

		let newThemeName: string | undefined;
		let baseThemeId: string | undefined;

		const customThemeIds = customThemes.map(t => t.id);

		if (customThemeIds.includes(baseTheme.id)) {
			newThemeName = await textInputPrompt('Enter a name for the new theme');
			baseThemeId = baseTheme.id;
		}

		const newTheme = await sdk.installTheme(siteId as string, baseThemeId, newThemeName);

		log(`Theme created with id ${newTheme.id} on site ${selectedSite.siteTitle}`);
	}
}
