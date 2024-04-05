import { SiteGlobalElement } from '../../../api/Types.js';
import { prepareFileDir, saveFile } from '../../../filesystem.js';
import { SDK } from '../../index.js';
import { TASK_STATES } from '../constants.js';
import { DownloadResourceTask } from './DownloadResourceTask.js';

export class DownloadGlobalElementsTask extends DownloadResourceTask {
	async exec(): Promise<void> {
		const fileContent = SDK.genGlobalElementsFileContent(this.resourceObject as SiteGlobalElement);
		await prepareFileDir(this.fullFilePath);
		await saveFile(this.fullFilePath, fileContent);
		this.state = TASK_STATES.complete;
	}

	async isValid(): Promise<boolean> {
		return true;
	}
}
