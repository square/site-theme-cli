// export const EN = 'en';
// export const LOCALE = process.env.TARGET_LOCALE || EN;
import stringsJSON from './en/strings.js';

stringsJSON as any;
export const strings = stringsJSON;
export const substituteValues = (str: string, obj: Record<string, any>): string  => {
	return str.replace(/{(\w+)}/g, (match: string, key: string) => {
		return obj[key] === undefined ? match : obj[key];
	});
};
