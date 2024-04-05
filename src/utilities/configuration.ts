import { load, dump } from 'js-yaml';
import { join } from 'node:path';
import {
	createDir,
	getFileContent,
	saveFile,
} from './filesystem.js';

interface BaseConfig {
    accessToken?: string,
}

const baseConfigFileName = 'base_config.yaml';

const readBaseConfigFileParsed = async (configDir: string): Promise<BaseConfig> => {
	const configFilePath = join(configDir, baseConfigFileName);
	try {
		const fileContent = await getFileContent(configFilePath);
		return parseBaseConfig(fileContent.toString());
	} catch (error: any) {
		error as  NodeJS.ErrnoException;
		if (error.code === 'ENOENT') {
			return {} as BaseConfig;
		}

		throw error;
	}
};

const writeParsedBaseConfigFile = async (configDir: string, formattedData: BaseConfig): Promise<void> => {
	await createDir(configDir);
	const configFilePath = join(configDir, baseConfigFileName);
	const fileContent = dump(formattedData);
	await saveFile(configFilePath, fileContent);
};

const parseBaseConfig = (data: string): BaseConfig  => {
	return load(data) as BaseConfig;
};

export const getAccessToken = async (configDir: string): Promise<string | undefined> => {
	const baseConfig = await readBaseConfigFileParsed(configDir);
	return baseConfig?.accessToken;
};

export const saveConfig = async (configObject: BaseConfig, configDir: string): Promise<void> => {
	const currentConfig = await readBaseConfigFileParsed(configDir);
	if (configObject.accessToken) {
		currentConfig.accessToken = configObject.accessToken;
	}

	await writeParsedBaseConfigFile(configDir, configObject);
};

export const checkConfig = async (configDir: string): Promise<void> => {
	const currentConfig = await readBaseConfigFileParsed(configDir);
	if (!currentConfig.accessToken) {
		throw new Error('Missing Access Token, please run auth command');
	}
};
