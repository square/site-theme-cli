import { SitePage } from '../../../api/Types.js';
import { TASK_STATES } from '../constants.js';
import { CreateSitePageTask } from './CreateSitePageTask.js';

export class UpdateSitePageTask extends CreateSitePageTask {
	async exec(): Promise<SitePage | undefined> {
		if (!this.content) {
			await this.loadContent();
		}

		const sitePage = await this.sdk.updateSitePage(
			this.siteId,
			this.siteThemeId,
			this.filePath,
			this.content as Buffer);

		// write the taskPage back to disk.
		this.state = TASK_STATES.complete;
		return sitePage;
	}
}
