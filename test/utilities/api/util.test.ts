import {
	assert,
	describe,
	it,
} from 'vitest';
import * as Util from '../../../src/utilities/api/util';
import { RawSitePage, SitePage } from '../../../src/utilities/api/Types.js';

describe('Util Test', () => {
	it('converts site page properties', async () => {
		const rawSitePage: RawSitePage = {
			id: '1234',
			route: '/foo',
			name: 'Page 1',
			site_id: '999',
			properties: '{}',
			created_at: '111',
			updated_at: '222',
		};
		const sitePage: SitePage = Util.convertApiResource(rawSitePage) as SitePage;
		assert(sitePage.siteId === '999');
	});
});
