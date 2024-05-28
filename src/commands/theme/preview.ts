import { Flags } from '@oclif/core';
import { strings } from '../../translations/index.js';
import log from '../../components/ui/display/Log.js';
import { getAccessToken } from '../../utilities/permissions.js';
import { BaseCommand } from '../../baseCommand.js';
import { SDK } from '../../utilities/sdk/index.js';
import { checkConfig } from '../../utilities/configuration.js';
import { Site, SiteTheme } from '../../utilities/api/Types.js';
import { siteSelectorPrompt, themeSelectorPrompt } from '../../components/prompts.js';
import { getPreviewUrl } from '../../utilities/preview.js';
import { showLink } from '../../components/ui/display/Link.js';
import { ONLINE_STORE_CUSTOM_THEME_READ, ONLINE_STORE_SITE_READ } from '../../utilities/api/constants.js';
import { ProcessFileLogger } from '../../utilities/filesystem.js';

const commandStrings = strings.commands.theme.preview;
const { flags: flagsStrings,
	body: bodyStrings,
	description } = commandStrings;

export default class Preview extends BaseCommand<typeof Preview> {
	static description = description

	static examples = [
		'<%= config.bin %> <%= command.id %>',
	]

	static flags = {
		siteId: Flags.string({
			description: flagsStrings.siteId.description,
		}),
	}

	static args = {};

	static permissionScopes = [
		ONLINE_STORE_SITE_READ,
		ONLINE_STORE_CUSTOM_THEME_READ,
	];

	public async run(): Promise<void> {
		const { flags } = await this.parse(Preview);
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

		let selectedSite: undefined | Site;
		if (flags.siteId) {
			selectedSite = await sdk.getSite(flags.siteId);
			if (!selectedSite) {
				log(bodyStrings.siteNotFound, 'error');
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

			selectedSite = await siteSelectorPrompt(
				allSites,
				bodyStrings.selectSite,
			);
		}

		const customThemes = await sdk.getCustomThemes(selectedSite.id as string);
		if (customThemes.length === 0) {
			log(bodyStrings.noCustomThemesFound, 'warn');
			return;
		}

		const selectedTheme = (await themeSelectorPrompt(customThemes)) as SiteTheme;

		// generate the preview routes
		const previewRoutes = await sdk.getSiteRoutes(selectedSite.id as string, selectedTheme.id as string);
		log(bodyStrings.previewChangesPrompt);
		for (const previewRoute of previewRoutes) {
			const previewRouteUrl = getPreviewUrl(
				selectedSite.id as string,
				selectedTheme.id as string,
				previewRoute,
			);
			showLink(previewRouteUrl);
		}
	}
}
