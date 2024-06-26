import {
	afterAll, describe, expect, it, vi,
} from 'vitest';
import * as configurations from '../../src/utilities/configuration.js';
import Auth from '../../src/commands/auth.js';

describe('Auth Command Token Exists', () => {
	it('auth no override test', async () => {
		const getAccessTokenSpy = vi.spyOn(configurations, 'getAccessToken' as never).mockResolvedValue('CURRENT_ACCESS_TOKEN');

		await Auth.run(['INPUT_ACCESS_TOKEN']);
		expect(getAccessTokenSpy).toHaveBeenCalledOnce();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
});

describe('Auth Command Failed Permission Test', () => {
	it('auth missing access token test', async () => {
		const getAccessTokenSpy = vi.spyOn(configurations, 'getAccessToken' as never).mockResolvedValue(null);
		await Auth.run(['INPUT_ACCESS_TOKEN']);
		expect(getAccessTokenSpy).toHaveBeenCalledOnce();
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
});

describe('Auth Command Successful Permission Test', () => {
	it('auth successfully retrieved token test', async () => {
		const saveConfigSpy = vi.spyOn(configurations, 'saveConfig' as never);
		await Auth.run(['INPUT_ACCESS_TOKEN']);
		expect(saveConfigSpy).toBeCalledTimes(1);
	});
	afterAll(() => {
		vi.resetAllMocks();
	});
});
