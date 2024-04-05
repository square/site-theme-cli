import { ux } from '@oclif/core';
import { getAccessToken as getAccessTokenFromStore } from './configuration.js';
import { strings } from '../translations/index.js';

const translations = strings.utilities.permissions;

export const getAccessToken = async (configDir: string): Promise<string | undefined> => {
	const accessToken = await getAccessTokenFromStore(configDir);
	if (!accessToken) {
		ux.log(translations.noAccessToken);
	}

	return accessToken;
};

export const checkHasAccessTokenPermission = (tokenPermissions: string[], permissions: string[]): boolean => {
	ux.action.start(`${translations.verifyingPermissions}...`);
	const missingPermissions = permissions.filter(permission => {
		return !tokenPermissions.includes(permission);
	});
	if (missingPermissions.length > 0) {
		let message = translations.missing;
		message += `\n${missingPermissions.join('\n')}`;
		ux.action.stop(message);
		return false;
	}

	ux.action.stop();
	return true;
};
