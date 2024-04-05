import {
	describe, expect, it, vi,
} from 'vitest';
import { assert } from 'node:console';
import chokidar from 'chokidar';
import { FileIgnorer, ThemeWatcher } from '../../src/utilities/filesystem';

describe('Filesystem Test', () => {
	it('ignore typescript regex', async () => {
		const fileIgnorer = new FileIgnorer([/\.ts$/]);
		console.log(fileIgnorer.patterns);
		expect(fileIgnorer.accepts('test.ts')).toBe(false);
		expect(fileIgnorer.accepts('.soignore')).toBe(false);
		expect(fileIgnorer.accepts('test.js')).toBe(true);
	});

	it('constructs a themewatcher', async () => {
		const watcher = chokidar.watch('/mock', {
			ignored: '',
			persistent: true,
			awaitWriteFinish: true,
			ignoreInitial: true,
		});
		vi.spyOn(chokidar, 'watch').mockReturnValue(watcher);
		const fileIgnorer = new FileIgnorer([/\.ts$/]);
		const themeWatcher = new ThemeWatcher('foo', fileIgnorer);
		const watcherStore = themeWatcher.getFileWatcherStore();
		assert(Object.keys(watcherStore.create).length === 0);
		assert(themeWatcher.hasFilesForSync() === false);
		watcher.emit('add', 'folder');
		assert(Object.keys(watcherStore.create).length === 1);
		assert(themeWatcher.hasFilesForSync() === true);
		themeWatcher.close();
	});
});
