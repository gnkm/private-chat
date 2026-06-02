import {
	type ClientPostPayload,
	type ServerBroadcastPost,
	clientPostPayloadSchema,
} from "@private-chat/shared";

import { parseWsFrame } from "./ws-frame.js";
import { computeReconnectDelayMs } from "./ws-reconnect.js";

export type ChatSocketCallbacks = {
	onPost: (post: ServerBroadcastPost) => void;
	onSendError: (message: string) => void;
};

export type WebSocketFactory = (url: string) => WebSocket;

export class ChatSocket {
	private ws: WebSocket | undefined;
	private reconnectAttempt = 0;
	private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
	private disposed = false;

	constructor(
		private readonly url: string,
		private readonly callbacks: ChatSocketCallbacks,
		private readonly createWebSocket: WebSocketFactory = (u) =>
			new WebSocket(u),
		private readonly scheduleDelay: (
			delayMs: number,
			fn: () => void,
		) => ReturnType<typeof setTimeout> = (delayMs, fn) =>
			setTimeout(fn, delayMs),
	) {}

	connect(): void {
		this.clearReconnectTimer();
		this.openSocket();
	}

	dispose(): void {
		this.disposed = true;
		this.clearReconnectTimer();
		if (this.ws) {
			this.ws.onclose = null;
			this.ws.close();
			this.ws = undefined;
		}
	}

	sendPost(payload: ClientPostPayload): void {
		const validated = clientPostPayloadSchema.safeParse(payload);
		if (!validated.success) {
			return;
		}

		if (this.ws?.readyState !== WebSocket.OPEN) {
			this.callbacks.onSendError(
				"サーバに接続できていません。しばらくしてから再度お試しください。",
			);
			return;
		}

		this.ws.send(JSON.stringify(validated.data));
	}

	private openSocket(): void {
		const ws = this.createWebSocket(this.url);
		this.ws = ws;

		ws.onopen = () => {
			this.reconnectAttempt = 0;
		};

		ws.onmessage = (event: MessageEvent) => {
			const text = typeof event.data === "string" ? event.data : "";
			const frame = parseWsFrame(text);
			if (frame.kind === "post") {
				this.callbacks.onPost(frame.post);
			} else if (frame.kind === "error") {
				this.callbacks.onSendError(frame.message);
			}
		};

		ws.onclose = () => {
			this.ws = undefined;
			if (!this.disposed) {
				this.scheduleReconnect();
			}
		};
	}

	private scheduleReconnect(): void {
		const delayMs = computeReconnectDelayMs(this.reconnectAttempt);
		this.reconnectAttempt += 1;
		this.reconnectTimer = this.scheduleDelay(delayMs, () => {
			if (!this.disposed) {
				this.openSocket();
			}
		});
	}

	private clearReconnectTimer(): void {
		if (this.reconnectTimer !== undefined) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = undefined;
		}
	}
}
