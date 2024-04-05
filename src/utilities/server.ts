import { Server, createServer } from 'node:http';
import WebSocket, { WebSocketServer } from 'ws';

/**
 * Returns a local server class to be used during development.
 * Intended to be used as a singleton throughout command lifecyle.
 * Local server supports a websocket server on localhost. Where browser clients
 * receive a reload notification messages from upstream caller.
 * Powers hot-reload feature for previewing in watch mode.
 */
export class LocalServer {
	isListening = false;
	port: number;
	server: Server;
	wss: InstanceType<typeof WebSocketServer>
	constructor(port: number) {
		this.port = port;
		this.server = createServer();
		this.wss = new WebSocketServer({ noServer: true });
		this.wss.on('connection', this.onWebSocketConnection);
		this.server.on('upgrade', (request, socket, head) => {
			this.wss.handleUpgrade(request, socket, head, ws => {
				this.wss.emit('connection', ws);
			});
		});
	}

	onWebSocketConnection(ws: InstanceType <typeof WebSocket>): void {
		ws.on('error', (error: Error) => {
			console.log('socket error', error);
		});
	}

	start(): Promise<void> {
		return new Promise(resolve => {
			if (this.isListening) {
				resolve();
			} else {
				this.server.listen(this.port, () => {
					console.log(`reload server running at http://localhost:${this.port}`);
					this.isListening = true;
					resolve();
				});
			}
		});
	}

	notifyWebSocketsOfSourceChange(): void {
		for (const client of this.wss.clients) {
			if (client.readyState === WebSocket.OPEN) {
				client.send('reload');
			}
		}
	}
}
