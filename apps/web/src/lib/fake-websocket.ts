/** テスト用 WebSocket の制御面 */
export type FakeWebSocketController = {
	readonly url: string;
	readonly sent: string[];
	readyState: number;
	simulateMessage: (data: string) => void;
	simulateClose: () => void;
};

export function createFakeWebSocketClass(): {
	FakeWebSocket: {
		new (url: string): WebSocket;
		readonly OPEN: number;
	};
	getLastController: () => FakeWebSocketController | undefined;
} {
	let lastController: FakeWebSocketController | undefined;

	class FakeWebSocket implements WebSocket {
		static readonly CONNECTING = 0;
		static readonly OPEN = 1;
		static readonly CLOSING = 2;
		static readonly CLOSED = 3;

		readonly CONNECTING = 0;
		readonly OPEN = 1;
		readonly CLOSING = 2;
		readonly CLOSED = 3;

		readonly url: string;
		readonly sent: string[] = [];
		readyState = FakeWebSocket.CONNECTING;
		private readonly controller: FakeWebSocketController;

		binaryType: BinaryType = "blob";
		bufferedAmount = 0;
		extensions = "";
		protocol = "";

		onopen: ((this: WebSocket, ev: Event) => void) | null = null;
		onclose: ((this: WebSocket, ev: CloseEvent) => void) | null = null;
		onmessage: ((this: WebSocket, ev: MessageEvent) => void) | null = null;
		onerror: ((this: WebSocket, ev: Event) => void) | null = null;

		constructor(url: string) {
			this.url = url;
			this.controller = {
				url,
				sent: this.sent,
				readyState: this.readyState,
				simulateMessage: (data: string) => {
					this.onmessage?.(
						new MessageEvent("message", { data }) as MessageEvent,
					);
				},
				simulateClose: () => this.simulateCloseInternal(),
			};
			lastController = this.controller;

			queueMicrotask(() => {
				this.readyState = FakeWebSocket.OPEN;
				this.controller.readyState = this.readyState;
				this.onopen?.(new Event("open") as Event);
			});
		}

		send(data: string): void {
			this.sent.push(data);
		}

		close(): void {
			this.simulateCloseInternal();
		}

		private simulateCloseInternal(): void {
			if (this.readyState === FakeWebSocket.CLOSED) {
				return;
			}
			this.readyState = FakeWebSocket.CLOSED;
			this.controller.readyState = this.readyState;
			this.onclose?.(new CloseEvent("close") as CloseEvent);
		}

		addEventListener(): void {
			throw new Error("not implemented in fake");
		}
		removeEventListener(): void {
			throw new Error("not implemented in fake");
		}
		dispatchEvent(): boolean {
			throw new Error("not implemented in fake");
		}
	}

	return {
		FakeWebSocket: FakeWebSocket as unknown as {
			new (url: string): WebSocket;
			readonly OPEN: number;
		},
		getLastController: () => lastController,
	};
}
