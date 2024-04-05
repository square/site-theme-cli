import {
	PagesNameIdMapping,
	ResourceThemeMapping,
} from './Types.js';

/**
 * Used to maintain internal state of filePath to ID,
 * for the case where a user removes the ID field from
 * SitePage file on disk, the instance mainstains a mapping to
 * an id for consumption by API.
 */
export class ResourceStore {
	private pagesNameMapping: PagesNameIdMapping = {};

	constructor(initialResourceMap: ResourceThemeMapping) {
		const { sitePages } = initialResourceMap;
		for (const sitePage of sitePages) {
			this.pagesNameMapping[sitePage.name] = sitePage.id;
		}
	}

	getPageId(name: string): string | undefined {
		return this.pagesNameMapping[name];
	}

	updatePageId(name: string, id: string): void {
		this.pagesNameMapping[name] = id;
	}

	deletePageIdMap(name: string): void {
		delete this.pagesNameMapping[name];
	}
}
