import { getFileContent } from '../../../filesystem.js';
import { ParseError } from '../Errors/ParseError.js';
import { SETTINGS_READ_PARSING_ERROR_CODE } from '../Errors/constants.js';
import { TASK_STATES } from '../constants.js';
import { ResourceTask } from './ResourceTask.js';

export class CreateSettingsTask extends ResourceTask {
	properties: Record<string, any> | undefined;

	async exec(): Promise<void> {
		if (!this.properties) {
			await this.loadProperties();
		}

		await this.sdk.createSettings(
			this.siteId,
			this.filePath,
			this.properties as Record<string, any>);
		this.state = TASK_STATES.complete;
	}

	async isValid(): Promise<boolean> {
		try {
			await this.loadProperties();
			return true;
		} catch {
			this.state = TASK_STATES.error;
			this.error = new ParseError(SETTINGS_READ_PARSING_ERROR_CODE);
			return false;
		}
	}

	async loadProperties(): Promise<void> {
		const contentBuffer = await getFileContent(this.fullFilePath);
		this.properties = JSON.parse(contentBuffer.toString());
	}
}
