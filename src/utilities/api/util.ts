/* eslint-disable no-prototype-builtins */
import crypto from 'node:crypto';
import { RawAPITypes, APITypes } from './Types.js';

export const getCheckSum = (buff: Buffer): string => {
	const hash = crypto.createHash('sha256');
	hash.update(buff);
	return hash.digest('hex');
};

export const convertApiResource = (apiSite: RawAPITypes): APITypes => {
	return snakeToCamel(apiSite) as APITypes;
};

export const snakeToCamel = (jsonObj: any): any => {
	if (typeof jsonObj === 'string') {
		jsonObj = JSON.parse(jsonObj);
	}

	if (typeof jsonObj !== 'object' || jsonObj === null) {
		return jsonObj;
	}

	if (Array.isArray(jsonObj)) {
		return jsonObj.map((item: any) => snakeToCamel(item));
	}

	const camelJson: any = {};

	for (const key in jsonObj) {
		if (jsonObj.hasOwnProperty(key)) {
			let value = jsonObj[key];
			if (typeof value === 'object' && value !== null) {
				value = snakeToCamel(value);
			}

			const camelKey = key.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
			camelJson[camelKey] = value;
		}
	}

	return camelJson;
};
