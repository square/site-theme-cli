import React from 'react';
import { render, Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

type AnyItem = Record<string, any>;
export interface SelectionItem extends AnyItem{
	label: string;
	value: string;
}
interface SelectComponentProps {
	items: SelectionItem[];
	onSelect: (item: SelectionItem) => void;
	prompt: string;
}
const SelectComponent = ({ items, onSelect, prompt }: SelectComponentProps) => {
	const handleSelect = (item: SelectionItem) => {
		onSelect(item);
	};

	return <Box flexDirection={'column'}>
		<Text>
			{
				prompt
			}
		</Text>
		<SelectInput items={items} onSelect={handleSelect} />
	</Box>;
};

export const getSelect = (items: SelectionItem[], prompt: string): Promise<SelectionItem> => {
	return new Promise(resolve => {
		// eslint-disable-next-line prefer-const
		let unmount: any;
		const onSelect = (item: SelectionItem): void => {
			resolve(item);
			unmount();
		};

		const { unmount: unmountInk } = render(<SelectComponent items={items} prompt={prompt} onSelect={onSelect} />);
		unmount = unmountInk;
	});
};
