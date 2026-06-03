import { randomUUID } from "node:crypto";
import http from "node:http";

import express from "express";
import { type RawData, WebSocket, WebSocketServer } from "ws";

import {
	type ServerBroadcastPost,
	clientPostPayloadSchema,
	serverBroadcastPostSchema,
} from "@private-chat/shared";

import { mountStaticSpa } from "./static-files.js";

export type CreateChatServerOptions = {
	/** 本番ビルド済みフロント（`apps/web/dist` 等）のディレクトリ */
	staticDir?: string;
};

/** WebSocket パス（同一オリジンからの接続先） */
export const WS_PATH = "/ws";

/** Close ハンドシェイクが完了しない接続を `terminate` するまでの待機（ミリ秒） */
const WS_CLOSE_GRACE_MS = 5_000;

export type ChatServer = {
	readonly httpServer: http.Server;
	readonly close: () => Promise<void>;
};

function sendWsError(ws: WebSocket, message: string): void {
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify({ type: "error", message }));
	}
}

/** `close()` の応答がないソケットを時間切れで強制終了する。返り値でタイマーを解除する。 */
function scheduleForceTerminate(clients: WebSocket[]): () => void {
	const timer = setTimeout(() => {
		for (const client of clients) {
			if (client.readyState !== WebSocket.CLOSED) {
				client.terminate();
			}
		}
	}, WS_CLOSE_GRACE_MS);
	return () => {
		clearTimeout(timer);
	};
}

/**
 * Express（ヘルスチェック）と `ws` の単一会話ルームサーバを同一プロセスで起動する。
 * 投稿本文はサーバに蓄積しない（検証後にブロードキャストのみ）。新規接続には過去ログを送らない。
 */
export function createChatServer(
	options: CreateChatServerOptions = {},
): ChatServer {
	const app = express();
	app.get("/health", (_req, res) => {
		res.status(200).json({ ok: true });
	});

	if (options.staticDir) {
		mountStaticSpa(app, options.staticDir);
	}

	const httpServer = http.createServer(app);
	const clients = new Set<WebSocket>();

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
				const snapshot = [...clients];
				for (const client of snapshot) {
					client.close();
				}
				const cancelForceTerminate = scheduleForceTerminate(snapshot);
				wss.close((wssErr) => {
					cancelForceTerminate();
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
