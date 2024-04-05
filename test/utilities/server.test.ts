import { assert } from 'node:console';
import { describe, it } from 'vitest';
import { LocalServer } from '../../src/utilities/server';

describe('LocalServer Test', () => {
	it('starts an instance and continues listening', async () => {
		const LOCAL_SERVER_PORT = 8035;
		const localServer = new LocalServer(LOCAL_SERVER_PORT);
		assert(localServer.isListening === false);
		await localServer.start();
		assert(localServer.isListening === true);
		await localServer.start();
		assert(localServer.isListening === true);
		localServer.server.close();
	});
});
