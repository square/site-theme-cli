import {
	assert,
	describe,
	it,
	vi,
} from 'vitest';
import SquareOnlineApi from '../../../src/utilities/api/index';
import { ThemeFile } from '../../../src/utilities/api/Types';
import { SDK } from '../../../src/utilities/sdk';
import { ProcessFileLogger } from '../../../src/utilities/filesystem';

describe('SDK Test', () => {
	vi.mock('../../../src/utilities/api/index');

	it('downloads a theme file', async () => {
		const fileLogger = new ProcessFileLogger('dir/logs/');
		const sdk = new SDK('FAKE_TOKEN', fileLogger);
		const content = 'hello world';
		const themeFile = {
			path: 'foo',
			siteThemeId: '111',
			checksum: 'a1b2c3',
			contentType: 'XML',
			size: 1000,
			binaryEncodingType: 'none',
			content,
		} as ThemeFile;
		vi.spyOn(SquareOnlineApi.prototype, 'getThemeFile').mockResolvedValue(themeFile);
		const download = await sdk.downloadThemeFile('123', '111', 'foo');
		assert(download === content);
	});
});
