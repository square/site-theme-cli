import React from 'react';
import { render, Box, Text } from 'ink';

export interface Column {
    title: string;
    getCellValue: (row: any, index: number) => string;
	width: number;
}

export interface TableProps {
    columns: Column[];
	rows: any[];
}

const bottomLeftBorderOnly = {
	borderBottom: true,
	borderTop: false,
	borderLeft: true,
	borderRight: false,
};

const topBorderMissing = {
	borderBottom: true,
	borderTop: false,
	borderLeft: true,
	borderRight: true,
};

const TableComponent = ({ columns, rows }: TableProps): React.JSX.Element => {
	return <Box flexDirection="column" marginY={1}>
		<Box flexDirection="row">
			{
				columns.map((column: Column, index: number) => {
					return (
						<Box width={column.width} key={index} borderStyle={'doubleSingle'}>
							<Text>
								{
									column.title
								}
							</Text>
						</Box>
					);
				})
			}
		</Box>
		{
			rows.map((row: any, rowIndex: number) => {
				return <Box flexDirection="row" key={rowIndex} borderBottom={true}>
					{
						columns.map((column: Column, columnIndex: number) => {
							const borderProperties = columnIndex === columns.length - 1 ? topBorderMissing : bottomLeftBorderOnly;
							return <Box {...borderProperties} borderStyle={'classic'} key={columnIndex} width={column.width}>
								<Text>
									{
										column.getCellValue(row, rowIndex)
									}
								</Text>
							</Box>;
						})
					}
				</ Box>;
			})
		}
	</Box>;
};

export const printTable = (columns: Column[], rows: any[]): void => {
	const { unmount } = render(<TableComponent columns={columns} rows={rows} />);
	unmount();
};
