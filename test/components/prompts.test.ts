import { Site } from 'square';
import {
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import * as Prompts from '../../src/components/prompts';
import * as Select from '../../src/components/ui/input/Select';
import * as TextInput from '../../src/components/ui/input/TextInput';
import * as ConfirmInput from '../../src/components/ui/input/Confirm';

describe('Prompts Test', () => {
	it('prompts to select a site', async () => {
		const site =
		{
			id: '12312332',
			siteTitle: 'Square Online Site 1',
			siteThemeId: 'asdas',
		} as Site;
		const sites = [site];
		const siteItems = sites.map((site: Site) => ({
			...site, label: site.siteTitle, value: site.id,
		} as Select.SelectionItem));
		const selectSpy = vi.spyOn(Select, 'getSelect').mockResolvedValue(siteItems[0]);
		await Prompts.siteSelectorPrompt(sites);
		expect(selectSpy).toHaveBeenCalledOnce();
	});

	it('prompts to input text', async () => {
		const inputSpy = vi.spyOn(TextInput, 'getTextInput').mockResolvedValue('input');
		await Prompts.textInputPrompt('prompt message');
		expect(inputSpy).toHaveBeenCalledOnce();
	});

	it('prompts to input confirmation', async () => {
		const inputSpy = vi.spyOn(ConfirmInput, 'getConfirmInput').mockResolvedValue(true);
		await Prompts.confirmPrompt('prompt message');
		expect(inputSpy).toHaveBeenCalledOnce();
	});
});
