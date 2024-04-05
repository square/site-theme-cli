import { strings } from '../translations/index.js';
import { PushDeltaState } from '../Types/index.js';
import { printSimpleList } from './table.js';
import log from './ui/display/Log.js';

const customStrings = strings.components.custom;
export const printDeltaObjectSummary = (deltaObject: PushDeltaState): void => {
	const functionStrings = customStrings.printDeltaObjectSummary;
	log(`${functionStrings.title}\n`);
	if (deltaObject.create.length > 0) {
		printSimpleList(functionStrings.create, deltaObject.create.map(file => file.path));
	}

	if (deltaObject.update.length > 0) {
		printSimpleList(functionStrings.update, deltaObject.update.map(file => file.path));
	}

	if (deltaObject.delete.length > 0) {
		printSimpleList(functionStrings.delete, deltaObject.delete.map(file => file.path));
	}
};
