import { ReadStream } from 'node:fs';
import { getFileSize, getFileStream } from '../../../filesystem.js';
import { ParseError } from '../Errors/ParseError.js';
import { THEME_READ_PARSING_ERROR_CODE, THEME_READ_SIZE_ERROR_CODE } from '../Errors/constants.js';
import { TASK_STATES } from '../constants.js';
import { ResourceTask } from './ResourceTask.js';
import { MAX_THEME_FILE_BYTE_SIZE } from '../../../api/constants.js';
import { SizeError } from '../Errors/SizeError.js';

export class CreateThemeFileTask extends ResourceTask {
	fileStream: ReadStream | undefined;
	async exec(): Promise<void> {
		if (!this.fileStream) {
			await this.loadFileStream();
		}

		await this.sdk.createThemeFile(this.siteId, this.siteThemeId, this.filePath, this.fileStream as ReadStream);
		this.state = TASK_STATES.complete;
	}

	async isValid(): Promise<boolean> {
		try {
			const fileSize = await getFileSize(this.fullFilePath);
			if (!fileSize || fileSize >= MAX_THEME_FILE_BYTE_SIZE) {
				this.state = TASK_STATES.error;
				this.error = new SizeError(THEME_READ_SIZE_ERROR_CODE);
				return false;
			}

			await this.loadFileStream();
			return true;
		} catch {
			this.state = TASK_STATES.error;
			this.error = new ParseError(THEME_READ_PARSING_ERROR_CODE);
			return false;
		}
	}

	async loadFileStream(): Promise<void> {
		this.fileStream = await getFileStream(this.fullFilePath);
	}
}
