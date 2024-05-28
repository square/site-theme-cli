import { SiteGlobalElementType } from '../../../api/Types.js';
import { TASK_STATES } from '../constants.js';
import { CreateGlobalElementsTask } from './CreateGlobalElementsTask.js';

export class UpdateGlobalElementsTask extends CreateGlobalElementsTask {
	async exec(): Promise<void> {
		if (!this.type) {
			this.loadGlobalElementType();
		}

		if (!this.properties) {
			await this.loadProperties();
		}

		await this.sdk.updateGlobalElement(
			this.siteId,
			this.siteThemeId,
			this.filePath,
			this.type as SiteGlobalElementType,
			this.properties as Record<string, any>);
		this.state = TASK_STATES.complete;
	}
}
