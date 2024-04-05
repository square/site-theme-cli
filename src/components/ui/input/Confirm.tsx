import React, { useState } from 'react';
import { render, Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { colors } from '../styles.js';

interface Props {
	prompt: string;
	onSubmit: (confirm: boolean) => void;
	defaultConfirm: boolean;
}

const yesStrings = ['Y', 'y'];
const noStrings = ['N', 'n'];

const ConfirmInputComponent = ({ prompt, onSubmit, defaultConfirm }: Props): React.JSX.Element => {
	const [value, setValue] = useState('');
	const onSubmitLocal = (text: string) => {
		if (text === '') {
			onSubmit(defaultConfirm);
		} else if (yesStrings.includes(text)) {
			onSubmit(true);
		} else if (noStrings.includes(text)) {
			onSubmit(false);
		}
	};

	const onTextChange = (text: string) => {
		if (
			yesStrings.includes(text) ||
			noStrings.includes(text) ||
			text === ''
		) {
			setValue(text);
		}
	};

	return (
		<Box>
			<Box marginRight={1}>
				<Text color={colors.success}>
					?
				</Text>
			</Box>
			<Box marginRight={1}>

				<Text>
					{ prompt }
				</Text>
			</Box>
			<Box>
				<Text color={defaultConfirm ? colors.success : undefined}>
					{`[${yesStrings[0]}`}
				</Text>
				<Text>
					/
				</Text>
				<Text color={defaultConfirm ? undefined : colors.success}>
					{`${noStrings[1]}]`}
				</Text>
				<Text>
					&gt;
				</Text>
			</Box>
			<TextInput showCursor={false} value={value} onChange={onTextChange} onSubmit={onSubmitLocal} />
		</Box>
	);
};

export const getConfirmInput = (
	prompt: string,
	defaultConfirm = true,
): Promise<boolean> => {
	return new Promise(resolve => {
		// eslint-disable-next-line prefer-const
		let unmount: any;
		const onInput = (input: boolean): void => {
			resolve(input);
			unmount();
		};

		const { unmount: unmountInk } = render(<ConfirmInputComponent defaultConfirm={defaultConfirm} prompt={prompt}  onSubmit={onInput} />);
		unmount = unmountInk;
	});
};
