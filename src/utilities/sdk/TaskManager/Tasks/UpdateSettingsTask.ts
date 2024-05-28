import { TASK_STATES } from '../constants.js';
import { CreateSettingsTask } from './CreateSettingsTask.js';

export class UpdateSettingsTask extends CreateSettingsTask {
	async exec(): Promise<void> {
		if (!this.properties) {
			await this.loadProperties();
		}

		await this.sdk.updateSettings(
			this.siteId,
			this.siteThemeId,
			this.filePath,
			this.properties as Record<string, any>);
		this.state = TASK_STATES.complete;
	}
}
