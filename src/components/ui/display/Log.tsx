import React from 'react';
import { render, Box, Text } from 'ink';
import {
	colors,
} from '../styles.js';
import { strings } from '../../../translations/index.js';

const translations = strings.components.log;

export type LogLevel = 'info' | 'warn' | 'error';

export const logColors = {
	info: colors.info,
	warn: colors.warning,
	error: colors.danger,
} as {[key in LogLevel]: string};

const Log = ({ message, level }: {message: string, level: LogLevel}): React.JSX.Element => {
	return (
		<Box>
			<Box
				marginRight={1}
			>
				<Text color={logColors[level]}>
				[{
						translations.levels[level]
					}]
				</Text>
			</Box>
			<Box>
				<Text>
					{
						message
					}
				</Text>
			</Box>
		</Box>

	);
};

export default (message: string, level: LogLevel = 'info'): void => {
	const { unmount } = render(<Log message={message} level={level} />);
	unmount();
};
