import {
	afterAll, describe, it, vi,
} from 'vitest';
import { assert } from 'node:console';
import * as FileSystem from '../../src/utilities/filesystem';
import * as Configuration from '../../src/utilities/configuration';

describe('Configuration Test', () => {
	vi.mock('../../src/utilities/filesystem.js');

	it('gets access token', async () => {
		const buff = Buffer.from('accessToken: 1234');
		vi.spyOn(FileSystem, 'getFileContent').mockResolvedValue(buff);
		const accessToken = await Configuration.getAccessToken('/foo');
		assert(accessToken === '1234');
	});

	it('saves config file', async () => {
		const config = { accessToken: '1234' };
		await Configuration.saveConfig(config, '/foo');
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});
});
