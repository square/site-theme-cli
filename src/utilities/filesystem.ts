import {
	stat,
	readdir,
	writeFile,
	mkdir,
	Stats,
	unlink,
	rm,
	createReadStream,
	readFile,
	ReadStream,
	appendFile,
} from 'node:fs';
import {
	join,
	dirname,
	isAbsolute,
} from 'node:path';
import { createHash } from 'node:crypto';
import chokidar from 'chokidar';
import parser from 'parse-gitignore';
import { ThemeState } from '../Types/index.js';
import { SDK } from './sdk/index.js';

export interface WatcherChange {
	[key: string]: number;
}
export interface WatcherStore {
	create: WatcherChange;
	update: WatcherChange;
	delete: WatcherChange
}

export const getFileSize = async (filePath: string): Promise<number | undefined> => {
	try {
		const stats = await getFSStat(filePath);
		if (!stats.isDirectory()) {
			return stats.size;
		}
	} catch {
		// no-op
	}
};

export const getFSStat = async (fullPath: string): Promise<Stats> => {
	return new Promise((resolve, reject) => {
		stat(fullPath, (error: NodeJS.ErrnoException | null, stats: Stats) => {
			if (error) {
				reject(error);
			} else {
				resolve(stats);
			}
		});
	});
};

export const checkDirExists = async (directoryPath: string): Promise<boolean> => {
	try {
		const stats = await getFSStat(directoryPath);
		return stats?.isDirectory();
	} catch {
		return false;
	}
};

export const createDir = async (directoryPath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		mkdir(directoryPath, {
			recursive: true,
		}, (error: NodeJS.ErrnoException | null) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
};

export const getDirFiles = async (directoryPath: string): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		readdir(directoryPath, (error: NodeJS.ErrnoException | null, files: string[]) => {
			if (error) {
				reject(error);
			} else {
				resolve(files);
			}
		});
	});
};

export const getDirFileRecursive = async (directoryPath: string): Promise<string[]> => {
	const files = await getDirFiles(directoryPath);
	const allFiles: string[] = [];
	await Promise.all(files.map(async file => {
		const fullPath = join(directoryPath, file);
		const isDir = await checkDirExists(fullPath);
		if (isDir) {
			const childFiles = await getDirFileRecursive(fullPath);
			allFiles.push(...childFiles.map(childFile => join(file, childFile)));
		} else {
			allFiles.push(file);
		}
	}));
	return allFiles;
};

export const checkDirHasFiles = async (directoryPath: string): Promise<boolean> => {
	const files = await getDirFiles(directoryPath);
	return files?.length > 0;
};

export const isDirValidForPull = async (directoryPath: string): Promise<boolean> => {
	// check if it exists and does not have files
	const exists = await checkDirExists(directoryPath);
	if (!exists) {
		return true;
	}

	const hasFiles = await checkDirHasFiles(directoryPath);
	return !hasFiles;
};

export const isFilePathAbsolute = (filePath: string): boolean => {
	return isAbsolute(filePath);
};

export const deleteFile = async (filePath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		unlink(filePath, (error: NodeJS.ErrnoException | null) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
};

export const deleteDir = async (dirPath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		rm(dirPath, {
			recursive: true, force: true,
		}, (error: NodeJS.ErrnoException | null) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
};

// Create Dir if it does not exist and clear all the files
export const prepareDirForPull = async (directoryPath: string): Promise<void> => {
	const exists = await checkDirExists(directoryPath);
	if (!exists) {
		await createDir(directoryPath);
		return;
	}

	const fileIgnorer = await FileIgnorer.fromIgnoreFile(directoryPath);
	const dirFiles = await getDirFiles(directoryPath);
	if (dirFiles?.length > 0) {
		// clear old files
		await Promise.all(dirFiles.map(async fileName => {
			const filePath = join(directoryPath, fileName);
			// Only delete folders/files if they are not on the ignore list
			if (fileIgnorer.accepts(filePath)) {
				const isDir = await checkDirExists(directoryPath);
				await (isDir ? deleteDir(filePath) : deleteFile(filePath));
			}
		}));
	}
};

export const saveFile = async (filePath: string, content: string | Buffer): Promise<void> => {
	return new Promise((resolve, reject) => {
		writeFile(filePath, content, (error: NodeJS.ErrnoException | null) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
};

export const prepareFileDir = async (filePath: string): Promise<void> => {
	const fileDir = dirname(filePath);
	const exists = await checkDirExists(fileDir);
	if (!exists) {
		await createDir(fileDir);
	}
};

/**
 * For now just check if the directory exists.
 * Additional validation on the theme structure.
 * @param dirPath: string
 * @returns Promise<boolean>
 */
export const isValidThemeDir = async (dirPath: string): Promise<boolean> => {
	const exists = await checkDirExists(dirPath);
	return exists;
};

export const getFileHash = async (filePath: string, relativePath: string): Promise<string | undefined> => {
	try {
		if (SDK.isThemeFile(relativePath)) {
			return getBinaryHash(filePath);
		}
		// for all others do a special JSON hash

		return await getJSONFileHash(filePath);
	} catch {}
};

export const getBinaryHash = (filePath: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const fileStream = createReadStream(filePath);
		const hash = createHash('sha256');
		fileStream.on('data', data => {
			hash.update(data);
		});
		fileStream.on('end', () => {
			const md5Hash = hash.digest('hex');
			resolve(md5Hash);
		});
		fileStream.on('error', err => {
			reject(err);
		});
	});
};

export const getJSONFileHash = async (filePath: string): Promise<string> => {
	const bufferContent = await getFileContent(filePath);
	const stringContent = bufferContent.toString();
	const json = JSON.parse(stringContent);
	return SDK.genJSONHash(json);
};

export const getLocalThemeState = async (dirPath: string, ignorer: FileIgnorer): Promise<ThemeState> => {
	const allFiles = await getDirFileRecursive(dirPath);
	const themeFiles = allFiles.filter(file => {
		const fileType = SDK.getFileType(file);
		if (!fileType) {
			return false;
		}

		return ignorer.accepts(file);
	});
	return {
		files: await Promise.all(themeFiles.map(async file => ({
			path: SDK.appendSlashToPath(file),
			hash: await getFileHash(join(dirPath, file), file),
		}))),
	};
};

export const getFileContent = async (fullPath: string): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		readFile(fullPath, (err: NodeJS.ErrnoException | null, data: Buffer) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

export const getFileStream = (fullPath: string): ReadStream => {
	return createReadStream(fullPath);
};

export const createAndAppendToFile = (fullPath: string, message: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		appendFile(fullPath, message, { flag: 'a+' }, (err: NodeJS.ErrnoException | null) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
};

export class ThemeWatcher {
	private themeDir: string;
	private watcherStore: WatcherStore;
	private watcher: chokidar.FSWatcher;
	constructor(themeDir: string, ignorer: FileIgnorer, ignoreDelete = false) {
		this.themeDir = themeDir;
		this.watcherStore = {
			create: {},
			update: {},
			delete: {},
		};
		const watchPaths = SDK.getThemeFileDirs().map((localPath: string) => join(this.themeDir, localPath));
		this.watcher = chokidar.watch(watchPaths, {
			ignored: ignorer.patterns,
			persistent: true,
			awaitWriteFinish: true,
			ignoreInitial: true,
		});
		this.watcher.on('add', this.createFileHandler);
		this.watcher.on('change', this.updateFileHandler);
		if (!ignoreDelete) {
			this.watcher.on('unlink', this.deleteFileHandler);
		}
	}

	private stripThemeDir = (filePath: string) => {
		return filePath.replace(this.themeDir, '');
	}

	private createFileHandler = (path: string) => {
		path = this.stripThemeDir(path);
		// Debouncing logic:
		// If a file path is marked for deletion, then store it as an update.
		// If a file path is marked for update. Then dont change it.
		// Otherwise save it for creation
		if (this.watcherStore.update[path]) {
			return;
		}

		if (this.watcherStore.delete[path]) {
			delete this.watcherStore.delete[path];
		}

		this.watcherStore.create[path] = Date.now();
	}

	private updateFileHandler = (path: string) => {
		path = this.stripThemeDir(path);
		// Debouncing logic:
		// If you receive an update and a create exists do nothing.
		if (this.watcherStore.create[path]) {
			return;
		}

		// If you receive an update and a delete exists. drop the delete only need to update remotely.
		if (this.watcherStore.delete[path]) {
			delete this.watcherStore.delete[path];
		}

		this.watcherStore.update[path] = Date.now();
	}

	private deleteFileHandler = (path: string) => {
		path = this.stripThemeDir(path);
		// Debouncing logic:
		// if you receive a delete and a create exits. drop the create. do nothing
		// if you receive a delete and update exists. drop the update and mark for deletion.
		if (this.watcherStore.create[path]) {
			delete this.watcherStore.create[path];
			return;
		}

		if (this.watcherStore.update[path]) {
			delete this.watcherStore.update[path];
		}

		this.watcherStore.delete[path] = Date.now();
	}

	public hasFilesForSync = (): boolean => {
		return (
			Object.keys(this.watcherStore.create).length > 0 ||
			Object.keys(this.watcherStore.update).length > 0 ||
			Object.keys(this.watcherStore.delete).length > 0
		);
	}

	public getFileWatcherStore = (): WatcherStore => {
		const fileWatcherSnapshot = {
			...this.watcherStore,
		};
		this.watcherStore = {
			create: {},
			update: {},
			delete: {},
		};
		return fileWatcherSnapshot;
	}

	public close(): void {
		this.watcher.close();
	}
}

export class FileIgnorer {
	static ignoreFilePath = '/theme/.soignore';
	static basePatterns: Array<RegExp> = [
		/_darcs/,
		/CVS/,
		/config.yml/,
		/node_modules/,
		/.git/,
		/.DS_Store/,
		/.soignore/,
		/.dockerignore/,
		/.gitmodules/,
	];

	static basePatternsToString(): string {
		return FileIgnorer.basePatterns.map(regex => regex.toString()).join(',');
	}

	public patterns: RegExp[] = [];

	constructor(additonalPatterns: Array<RegExp> = []) {
		this.patterns = [...FileIgnorer.basePatterns];
		for (const pattern of additonalPatterns) {
			this.patterns.push(pattern);
		}
	}

	static async fromIgnoreFile(themeDir: string): Promise<InstanceType <typeof FileIgnorer>> {
		try {
			// load ignorefile
			const ignoreFullFilePath = join(themeDir, FileIgnorer.ignoreFilePath);
			const fileContent = await getFileContent(ignoreFullFilePath);
			const parsed = parser.parse(fileContent);
			const filePatterns = parsed.patterns.map(entry => new RegExp(entry));
			return new FileIgnorer(filePatterns);
		} catch {
			// maybe warn no ignore file found.
			return new FileIgnorer();
		}
	}

	public accepts(input: string): boolean {
		for (const pattern of this.patterns) {
			if (pattern.test(input)) {
				return false;
			}
		}

		return true;
	}
}

/**
 * Class that allows logging to disk
 */
export class ProcessFileLogger {
	public errorLogFilePath: string;
	private hasLoggedError = false;
	constructor(logDir: string) {
		const errorLogFileName = `${Date.now()}-error.log`;
		this.errorLogFilePath = join(logDir, errorLogFileName);
	}

	public getHasLoggedError(): boolean {
		return this.hasLoggedError;
	}

	async logError(error: Error): Promise<void> {
		this.hasLoggedError = true;
		await prepareFileDir(this.errorLogFilePath);
		const entry = this.formatErrorMessage(error);
		await createAndAppendToFile(this.errorLogFilePath, entry);
	}

	private formatErrorMessage(error: Error): string {
		const message = JSON.stringify({
			message: error.message,
			stack: error.stack,
		}, null, 4);
		const now = new Date();
		return `[${now.toISOString()}] > ${message}`;
	}
}

