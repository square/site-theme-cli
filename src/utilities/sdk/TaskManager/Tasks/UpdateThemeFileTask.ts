import { ReadStream } from 'node:fs';
import { TASK_STATES } from '../constants.js';
import { CreateThemeFileTask } from './CreateThemeFileTask.js';

export class UpdateThemeFileTask extends CreateThemeFileTask {
	async exec(): Promise<void> {
		if (!this.fileStream) {
			await this.loadFileStream();
		}

		await this.sdk.updateThemeFile(this.siteId, this.siteThemeId, this.filePath, this.fileStream as ReadStream);
		this.state = TASK_STATES.complete;
	}
}
