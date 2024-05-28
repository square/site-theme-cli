import { SitePage } from '../../../api/Types.js';
import { getFileContent } from '../../../filesystem.js';
import { SDK } from '../../index.js';
import { ParseError } from '../Errors/ParseError.js';
import { SITE_PAGE_READ_PARSING_ERROR_CODE } from '../Errors/constants.js';
import { TASK_STATES } from '../constants.js';
import { ResourceTask } from './ResourceTask.js';

export class CreateSitePageTask extends ResourceTask {
	content: Buffer | undefined;

	async exec(): Promise<SitePage | undefined> {
		if (!this.content) {
			await this.loadContent();
		}

		const sitePage = await this.sdk.createSitePage(
			this.siteId,
			this.siteThemeId,
			this.filePath,
			this.content as Buffer);
		this.state = TASK_STATES.complete;
		return sitePage;
	}

	async isValid(): Promise<boolean> {
		try {
			await this.loadContent();
			this.validateContentIsJson();
			return true;
		} catch {
			this.state = TASK_STATES.error;
			this.error = new ParseError(SITE_PAGE_READ_PARSING_ERROR_CODE);
			return false;
		}
	}

	async loadContent(): Promise<void> {
		this.content = await getFileContent(this.fullFilePath);
	}

	validateContentIsJson(): void {
		const content = this.content as Buffer;
		JSON.parse(content.toString());
	}

	async getHash(): Promise<string | undefined> {
		try {
			await this.loadContent();
			if (this.content) {
				const pageJSON = JSON.parse(this.content?.toString());
				return SDK.genJSONHash(pageJSON);
			}
		} catch {
			// no op
		}
	}
}
