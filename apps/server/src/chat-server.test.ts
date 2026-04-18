import type http from "node:http";

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import WebSocket from "ws";

import { WS_PATH, createChatServer } from "./chat-server.js";

async function listen(server: http.Server): Promise<{ baseUrl: string }> {
	await new Promise<void>((resolve, reject) => {
		server.listen(0, () => resolve());
		server.once("error", reject);
	});
	const addr = server.address();
	if (!addr || typeof addr === "string") {
		throw new Error("expected numeric listen address");
	}
	return { baseUrl: `http://127.0.0.1:${addr.port}` };
}

function toWs(baseUrl: string): string {
	return `${baseUrl.replace(/^http/, "ws")}${WS_PATH}`;
}

/** 指定ミリ秒の間に 1 件でも `message` 来たら即失敗。負荷下の遅延に合わせ窓はやや長め。 */
function expectNoMessageDuring(
	ws: WebSocket,
	quietWindowMs: number,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const onMessage = () => {
			cleanup();
			reject(
				new Error(
					"unexpected WebSocket message during quiet period (history must not replay)",
				),
			);
		};
		const timer = setTimeout(() => {
			cleanup();
			resolve();
		}, quietWindowMs);
		function cleanup(): void {
			clearTimeout(timer);
			ws.off("message", onMessage);
		}
		ws.on("message", onMessage);
	});
}

describe("createChatServer (フェーズ2)", () => {
	let chat: ReturnType<typeof createChatServer>;
	let baseUrl: string;

	beforeEach(async () => {
		chat = createChatServer();
		({ baseUrl } = await listen(chat.httpServer));
	});

	afterEach(async () => {
		await chat.close();
	});

	it("GET /health は 200 と JSON で応答する（SRS-NF-004・運用）", async () => {
		const res = await fetch(`${baseUrl}/health`);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	it("有効な投稿を接続中の全クライアントへブロードキャストする（SRS-FUNC-002）", async () => {
		const w1 = new WebSocket(toWs(baseUrl));
		const w2 = new WebSocket(toWs(baseUrl));
		await Promise.all([
			new Promise<void>((resolve, reject) => {
				w1.once("open", () => resolve());
				w1.once("error", reject);
			}),
			new Promise<void>((resolve, reject) => {
				w2.once("open", () => resolve());
				w2.once("error", reject);
			}),
		]);

		const nextText = (ws: WebSocket) =>
			new Promise<string>((resolve, reject) => {
				ws.once("message", (data) => resolve(data.toString()));
				ws.once("error", reject);
			});

		const p1 = nextText(w1);
		const p2 = nextText(w2);
		w1.send(JSON.stringify({ displayName: "Alice", body: "hello" }));

		const [m1, m2] = await Promise.all([p1, p2]);
		expect(m1).toBe(m2);

		const parsed = JSON.parse(m1) as {
			id: string;
			displayName: string;
			body: string;
			sentAt: string;
		};
		expect(parsed).toMatchObject({
			displayName: "Alice",
			body: "hello",
		});
		expect(parsed.id.length).toBeGreaterThan(0);
		expect(parsed.sentAt).toMatch(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
		);

		w1.close();
		w2.close();
		await new Promise<void>((resolve) => setTimeout(resolve, 10));
	});

	it("新規接続には過去投稿を送らない（architecture §7.3）", async () => {
		const w1 = new WebSocket(toWs(baseUrl));
		await new Promise<void>((resolve, reject) => {
			w1.once("open", () => resolve());
			w1.once("error", reject);
		});

		const firstAck = new Promise<void>((resolve, reject) => {
			w1.once("message", () => resolve());
			w1.once("error", reject);
		});
		w1.send(
			JSON.stringify({ displayName: "A", body: "before-second-connect" }),
		);
		await firstAck;

		const w2 = new WebSocket(toWs(baseUrl));
		await new Promise<void>((resolve, reject) => {
			w2.once("open", () => resolve());
			w2.once("error", reject);
		});

		await expectNoMessageDuring(w2, 500);

		const nextOnW2 = new Promise<string>((resolve, reject) => {
			w2.once("message", (data) => resolve(data.toString()));
			w2.once("error", reject);
		});
		w1.send(
			JSON.stringify({ displayName: "B", body: "after-second-connected" }),
		);

		const raw = await nextOnW2;
		expect(JSON.parse(raw)).toMatchObject({ body: "after-second-connected" });

		w1.close();
		w2.close();
		await new Promise<void>((resolve) => setTimeout(resolve, 10));
	});

	it("検証失敗時は error フレームを返し接続は維持する（SRS-IF-003）", async () => {
		const ws = new WebSocket(toWs(baseUrl));
		await new Promise<void>((resolve, reject) => {
			ws.once("open", () => resolve());
			ws.once("error", reject);
		});

		const next = () =>
			new Promise<string>((resolve, reject) => {
				ws.once("message", (data) => resolve(data.toString()));
				ws.once("error", reject);
			});

		ws.send(JSON.stringify({ displayName: "A", body: "" }));
		const errRaw = await next();
		const errJson = JSON.parse(errRaw) as { type?: string; message?: string };
		expect(errJson.type).toBe("error");
		expect(typeof errJson.message).toBe("string");
		expect(errJson.message?.length).toBeGreaterThan(0);

		ws.send(JSON.stringify({ displayName: "A", body: "fixed" }));
		const okRaw = await next();
		expect(JSON.parse(okRaw)).toMatchObject({ body: "fixed" });

		ws.close();
	});

	it("JSON でないテキストは error を返す", async () => {
		const ws = new WebSocket(toWs(baseUrl));
		await new Promise<void>((resolve, reject) => {
			ws.once("open", () => resolve());
			ws.once("error", reject);
		});
		ws.send("not-json");
		const errRaw = await new Promise<string>((resolve, reject) => {
			ws.once("message", (data) => resolve(data.toString()));
			ws.once("error", reject);
		});
		const errJson = JSON.parse(errRaw) as { type?: string };
		expect(errJson.type).toBe("error");
		ws.close();
	});
});
