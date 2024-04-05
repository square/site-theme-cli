import { printTable } from './ui/display/Table.js';

export const printSimpleList = (title: string, lines: string[]): void => {
	const columns = [{
		title,
		width: 50,
		getCellValue: (row: string) => row,
	}];
	printTable(columns, lines);
};
