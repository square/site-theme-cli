import figlet from 'figlet';
import React from 'react';
import {
	render,
	Box,
	Text,
} from 'ink';
import { colors } from '../styles.js';

const Banner = ({ message }: {message: string}): React.JSX.Element => {
	return (
		<Box>
			<Text color={colors.info}>
				{
					message
				}
			</Text>
		</Box>
	);
};

export const showBanner = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		figlet('Square Online CLI', async (error: Error | null, data: any) => {
			if (error) {
				reject(error);
			} else {
				data as string;
				const { unmount } = render(<Banner message={data} />);
				unmount();
				resolve();
			}
		});
	});
};
