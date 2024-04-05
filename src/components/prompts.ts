import { strings } from '../translations/index.js';
import { getConfirmInput } from './ui/input/Confirm.js';
import { getTextInput } from './ui/input/TextInput.js';
import { SelectionItem, getSelect } from './ui/input/Select.js';
import { Site } from '../utilities/api/Types.js';

const translations = strings.components.prompt;

export interface ConfirmResponse {
    confirm: boolean;
}

export interface TextInputResponse {
    input: string;
}

export const confirmPrompt = async (promptMessage: string): Promise<boolean> => {
	return getConfirmInput(promptMessage);
};

export const textInputPrompt = async (promptMessage: string, defaultInput?: string): Promise<string> => {
	return getTextInput(promptMessage, defaultInput);
};

export const siteSelectorPrompt = async (
	sites: Site[],
	prompt: string = translations.defaultSiteSelectorPrompt,
): Promise<Site> => {
	const siteItems = sites.map((site: Site) => ({
		...site, label: site.siteTitle, value: site.id,
	} as SelectionItem));
	const selected = await getSelect(siteItems, prompt) as Site&{label?: string, value?: string};
	delete selected.label;
	delete selected.value;
	return selected;
};
