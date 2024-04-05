import React from 'react';
import {
	render,
	Text,
} from 'ink';
import Link from 'ink-link';
import { colors } from '../styles.js';

export const showLink = (url: string, label?: string): Promise<void> => {
	return new Promise(resolve => {
		const text = label || url;
		const { unmount } = render(
			<Link url={url} fallback={false}>
				<Text color={colors.info}> {text} </Text>
			</Link>);
		unmount();
		resolve();
	});
};
