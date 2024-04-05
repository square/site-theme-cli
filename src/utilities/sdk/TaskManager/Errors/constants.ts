import { MAX_THEME_FILE_BYTE_SIZE } from '../../../api/constants.js';
import { ErrorCode, ErrorMessage } from './Types.js';

export const SITE_PAGE_READ_PARSING_ERROR_CODE = 100;
export const SETTINGS_READ_PARSING_ERROR_CODE = 101;
export const THEME_READ_PARSING_ERROR_CODE = 102;
export const GLOBAL_ELEMENT_PARSING_ERROR_CODE = 103;

export const SITE_PAGE_READ_PARSING_ERROR_MESSAGE = 'Unable to parse file contents for Site Page, please check that file is valid JSON.';
export const SETTINGS_READ_PARSING_ERROR_MESSAGE = 'Unable to parse file contents for Site Settings, please check that file is valid JSON.';
export const THEME_READ_PARSING_ERROR_MESSAGE = 'Unable to read file contents for Theme File. Please check file contents';
export const GLOBAL_ELEMENT_PARSING_ERROR_MESSAGE = 'Unable to parse file contents for Global Element, please check that file is valid JSON.';

export const THEME_READ_SIZE_ERROR_CODE = 201;
export const THEME_READ_SIZE_ERROR_MESSAGE = `Files within /theme directory must be between 1 and ${MAX_THEME_FILE_BYTE_SIZE} bytes`;

export const GENERIC_ERROR_CODE = 600;
export const GENERIC_ERROR_MESSAGE = 'Something went wrong.';

export const ERROR_CODE_MESSAGE_MAP = {
	[SITE_PAGE_READ_PARSING_ERROR_CODE]: SITE_PAGE_READ_PARSING_ERROR_MESSAGE,
	[SETTINGS_READ_PARSING_ERROR_CODE]: SETTINGS_READ_PARSING_ERROR_MESSAGE,
	[THEME_READ_PARSING_ERROR_CODE]: THEME_READ_PARSING_ERROR_MESSAGE,
	[GLOBAL_ELEMENT_PARSING_ERROR_CODE]: GLOBAL_ELEMENT_PARSING_ERROR_MESSAGE,
	[THEME_READ_SIZE_ERROR_CODE]: THEME_READ_SIZE_ERROR_MESSAGE,
	[GENERIC_ERROR_CODE]: GENERIC_ERROR_MESSAGE,
} satisfies {
	[key in ErrorCode]: ErrorMessage;
};
