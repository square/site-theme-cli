import { Args, Flags } from '@oclif/core';
import { strings } from '../translations/index.js';
import log from '../components/ui/display/Log.js';
import {
	getAccessToken,
	saveConfig,
} from '../utilities/configuration.js';
import { BaseCommand } from '../baseCommand.js';
import ThemeInstall from './theme/install.js';
import ThemePull from './theme/pull.js';
import ThemePush from './theme/push.js';
import ThemeWatch from './theme/watch.js';
import ThemePreview from './theme/preview.js';
import { SDK } from '../utilities/sdk/index.js';
import { checkHasAccessTokenPermission } from '../utilities/permissions.js';
import { ProcessFileLogger } from '../utilities/filesystem.js';

const commandStrings = strings.commands.auth;
const { args: argsStrings,
	flags: flagsStrings,
	body: bodyStrings,
	description } = commandStrings;

export default class Auth extends BaseCommand<typeof Auth> {
	static description = description

	static examples = [
		'<%= config.bin %> <%= command.id %> SQUARE_CONNECT_ACCESS_TOKEN',
	]

	static flags = {
		force: Flags.boolean({
			char: 'f',
			description: flagsStrings.force.description,
		}),
		skipPermissionsCheck: Flags.boolean({
			description: argsStrings.skipPermissionsCheck.description,
		}),
	}

	static args = {
		accessToken: Args.string({
			name: 'token',
			description: argsStrings.accessToken.description,
			required: true,
		}),
	}

	static permissionScopes = [];

	/**
	 * Returns a list of all the permissions used by the other commands.
	 * @returns string[]
	 */
	private getAllCommandPermissions(): string[] {
		const allPermissions: string[] = [];
		for (const command of [
			ThemeInstall,
			ThemePull,
			ThemePush,
			ThemeWatch,
			ThemePreview,
			Auth,
		]) {
			for (const scope of command.permissionScopes) {
				if (!allPermissions.includes(scope)) {
					allPermissions.push(scope);
				}
			}
		}

		return allPermissions;
	}

	public async run(): Promise<void> {
		const { args: { accessToken }, flags: { force, skipPermissionsCheck } } = await this.parse(Auth);
		const currentAccessToken = await getAccessToken(this.config.configDir);
		if (currentAccessToken && !force) {
			log(bodyStrings.warnAlreadyHasAccessToken);
			return;
		}

		// Temporarily bypass all permission checks until permission scopes can be properly made public
		const permissionsCheckDisabled = true;

		if (!permissionsCheckDisabled && !skipPermissionsCheck) {
			const allPermissions = this.getAllCommandPermissions();
			const sdk = new SDK(accessToken, this.fileLogger as ProcessFileLogger, this.verbose);
			const accessTokenPermissions = await sdk.getTokenPermissions();
			const hasPermissions = checkHasAccessTokenPermission(accessTokenPermissions, allPermissions);
			if (!hasPermissions) {
				return;
			}
		}

		log(bodyStrings.saving);
		await saveConfig({
			accessToken,
		}, this.config.configDir);
		log(bodyStrings.saved);
	}
}
