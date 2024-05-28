import { TASK_STATES } from '../constants.js';
import { ResourceTask } from './ResourceTask.js';

export class DeleteSitePageTask extends ResourceTask {
	async exec(): Promise<void> {
		await this.sdk.deleteSitePage(
			this.siteId,
			this.siteThemeId,
			this.filePath);
		this.state = TASK_STATES.complete;
	}

	async isValid(): Promise<boolean> {
		return true;
	}
}
