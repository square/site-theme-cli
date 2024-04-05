import { TASK_STATES } from '../constants.js';
import { ResourceTask } from './ResourceTask.js';

export class DeleteSettingsTask extends ResourceTask {
	async exec(): Promise<void> {
		await this.sdk.deleteSettings(
			this.siteId,
			this.filePath);
		this.state = TASK_STATES.complete;
	}

	async isValid(): Promise<boolean> {
		return true;
	}
}
