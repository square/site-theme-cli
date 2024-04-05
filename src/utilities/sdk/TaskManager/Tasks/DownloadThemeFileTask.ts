import { ThemeFileMeta } from '../../../api/Types.js';
import { prepareFileDir, saveFile } from '../../../filesystem.js';
import { TASK_STATES } from '../constants.js';
import { DownloadResourceTask } from './DownloadResourceTask.js';

export class DownloadThemeFileTask extends DownloadResourceTask {
	async exec(): Promise<void> {
		const { path } = this.resourceObject as ThemeFileMeta;
		const content = await this.sdk.downloadThemeFile(this.siteId, this.siteThemeId, path);
		if (content) {
			await prepareFileDir(this.fullFilePath);
			await saveFile(this.fullFilePath, content);
		}

		this.state = TASK_STATES.complete;
	}

	async isValid(): Promise<boolean> {
		return true;
	}
}
