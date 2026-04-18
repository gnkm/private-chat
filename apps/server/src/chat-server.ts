import { randomUUID } from "node:crypto";
import http from "node:http";

import express from "express";
import { type RawData, WebSocket, WebSocketServer } from "ws";

import {
	type ServerBroadcastPost,
	clientPostPayloadSchema,
	serverBroadcastPostSchema,
} from "@private-chat/shared";

/** WebSocket パス（同一オリジンからの接続先） */
export const WS_PATH = "/ws";

export type ChatServer = {
	readonly httpServer: http.Server;
	readonly close: () => Promise<void>;
};

function sendWsError(ws: WebSocket, message: string): void {
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify({ type: "error", message }));
	}
}

/**
 * Express（ヘルスチェック）と `ws` の単一会話ルームサーバを同一プロセスで起動する。
 * メモリに投稿を保持するが、新規 WebSocket 接続には履歴を再送しない。
 */
export function createChatServer(): ChatServer {
	const app = express();
	app.get("/health", (_req, res) => {
		res.status(200).json({ ok: true });
	});

	const httpServer = http.createServer(app);
	const clients = new Set<WebSocket>();
	/** プロセス内ストア（SRS-FUNC-005〜006）。履歴の再送には使わない。 */
	const messageStore: ServerBroadcastPost[] = [];

	const wss = new WebSocketServer({ server: httpServer, path: WS_PATH });

	wss.on("connection", (ws) => {
		clients.add(ws);
		ws.on("close", () => {
			clients.delete(ws);
		});
		ws.on("message", (data: RawData, isBinary: boolean) => {
			handleIncomingMessage(ws, data, isBinary);
		});
	});

	function handleIncomingMessage(
		ws: WebSocket,
		data: RawData,
		isBinary: boolean,
	): void {
		if (isBinary) {
			sendWsError(ws, "Expected a UTF-8 text frame");
			return;
		}

		const text = typeof data === "string" ? data : data.toString("utf8");
		let parsed: unknown;
		try {
			parsed = JSON.parse(text) as unknown;
		} catch {
			sendWsError(ws, "Message must be valid JSON");
			return;
		}

		const result = clientPostPayloadSchema.safeParse(parsed);
		if (!result.success) {
			const message = result.error.issues.map((i) => i.message).join("; ");
			sendWsError(ws, message);
			return;
		}

		const broadcastRaw: ServerBroadcastPost = {
			id: randomUUID(),
			displayName: result.data.displayName,
			body: result.data.body,
			sentAt: new Date().toISOString(),
		};

		const validated = serverBroadcastPostSchema.safeParse(broadcastRaw);
		if (!validated.success) {
			sendWsError(ws, "Internal validation error");
			return;
		}

		const broadcast = validated.data;
		messageStore.push(broadcast);

		const payload = JSON.stringify(broadcast);
		for (const client of clients) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(payload);
			}
		}
	}

	return {
		httpServer,
		close: () =>
			new Promise<void>((resolve, reject) => {
				for (const client of [...clients]) {
					client.close();
				}
				wss.close((wssErr) => {
					if (wssErr) {
						reject(wssErr);
						return;
					}
					httpServer.close((httpErr) => {
						if (httpErr) {
							reject(httpErr);
						} else {
							resolve();
						}
					});
				});
			}),
	};
}
