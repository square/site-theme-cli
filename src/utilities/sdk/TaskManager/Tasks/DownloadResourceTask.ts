import { ResourcePullObjects, ResourceTaskConfig } from '../Types.js';
import { ResourceTask } from './ResourceTask.js';

export abstract class DownloadResourceTask extends ResourceTask {
	resourceObject: ResourcePullObjects
	constructor(taskConfig: ResourceTaskConfig, resourceObject: ResourcePullObjects) {
		super(taskConfig);
		this.resourceObject = resourceObject;
	}
}
