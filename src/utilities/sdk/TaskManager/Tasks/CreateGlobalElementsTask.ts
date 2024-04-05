import { SiteGlobalElementType } from '../../../api/Types.js';
import { globalElementTypes } from '../../../api/constants.js';
import { getFileContent } from '../../../filesystem.js';
import { SDK } from '../../index.js';
import { ParseError } from '../Errors/ParseError.js';
import { GLOBAL_ELEMENT_PARSING_ERROR_CODE } from '../Errors/constants.js';
import { TASK_STATES } from '../constants.js';
import { ResourceTask } from './ResourceTask.js';

export class CreateGlobalElementsTask extends ResourceTask {
	properties: Record<string, any> | undefined;
	type: SiteGlobalElementType | undefined;
	async exec(): Promise<void> {
		if (!this.type) {
			this.loadGlobalElementType();
		}

		if (!this.properties) {
			await this.loadProperties();
		}

		await this.sdk.createGlobalElement(
			this.siteId,
			this.filePath,
			this.type as SiteGlobalElementType,
			this.properties as Record<string, any>);
		this.state = TASK_STATES.complete;
	}

	async isValid(): Promise<boolean> {
		try {
			this.loadGlobalElementType();
			await this.loadProperties();
			return true;
		} catch {
			this.state = TASK_STATES.error;
			this.error = new ParseError(GLOBAL_ELEMENT_PARSING_ERROR_CODE);
			return false;
		}
	}

	async loadProperties(): Promise<void> {
		const contentBuffer = await getFileContent(this.fullFilePath);
		this.properties = JSON.parse(contentBuffer.toString());
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
