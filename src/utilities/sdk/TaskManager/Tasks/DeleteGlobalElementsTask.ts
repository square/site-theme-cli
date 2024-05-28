import { SiteGlobalElementType } from '../../../api/Types.js';
import { globalElementTypes } from '../../../api/constants.js';
import { SDK } from '../../index.js';
import { TASK_STATES } from '../constants.js';
import { ResourceTask } from './ResourceTask.js';

export class DeleteGlobalElementsTask extends ResourceTask {
	type: SiteGlobalElementType | undefined;
	async exec(): Promise<void> {
		if (!this.type) {
			this.loadGlobalElementType();
		}

		await this.sdk.deleteGlobalElement(
			this.siteId,
			this.siteThemeId,
			this.filePath,
			this.type as SiteGlobalElementType);
		this.state = TASK_STATES.complete;
	}

	async isValid(): Promise<boolean> {
		try {
			this.loadGlobalElementType();
			return true;
		} catch {
			this.state = TASK_STATES.error;
			return false;
		}
	}

	async loadGlobalElementType(): Promise<void> {
		let type;
		if (SDK.isGlobalElementSection(this.filePath)) {
			type = globalElementTypes.section;
		}

		if (SDK.isGlobalElementContainer(this.filePath)) {
			type = globalElementTypes.container;
		}

		if (!type) {
			throw new Error('Cannot map filepath to Site Global Element Type');
		}

		this.type = type;
	}
}
