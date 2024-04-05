import React, { useState } from 'react';
import {
	render, Box, Text,
} from 'ink';
import TextInput from 'ink-text-input';
import { colors } from '../styles.js';

interface Props {
	prompt: string;
	onSubmit: (input: string) => void;
	defaultInput?: string;
}

const TextInputComponent = ({ prompt, onSubmit, defaultInput = '' }: Props): React.JSX.Element => {
	const [value, setValue] = useState('');
	const [showCursor, setShowCursor] = useState(true);
	const hasDefaultInput = defaultInput !== '';
	const onSubmitLocal = (text: string) => {
		setShowCursor(false);
		if ((!text || text === '') && hasDefaultInput) {
			onSubmit(defaultInput);
		} else {
			onSubmit(text);
		}
	};

	return (
		<Box>
			<Box marginRight={1}>
				<Text>
					{ prompt }
				</Text>
				{
					hasDefaultInput ? (<Text
						color={colors.info}
					>
							[{
							defaultInput
						}]
					</Text>) : null
				}
				<Text>
					&gt;
				</Text>
			</Box>
			<TextInput showCursor={showCursor} value={value} onChange={setValue} onSubmit={onSubmitLocal} />
		</Box>
	);
};

export const getTextInput = (
	prompt: string,
	defaultInput?: string,
): Promise<string> => {
	return new Promise(resolve => {
		// eslint-disable-next-line prefer-const
		let unmount: any;
		const onInput = (input: string): void => {
			resolve(input);
			unmount();
		};

		const { unmount: unmountInk } = render(
			<TextInputComponent
				defaultInput={defaultInput}
				prompt={prompt}
				onSubmit={onInput}
			/>,
		);
		unmount = unmountInk;
	});
};
