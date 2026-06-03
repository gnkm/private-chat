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

type ParticipantsFrame = {
	type: string;
	participants: Array<{ id: string; displayName: string }>;
};

function parseParticipants(raw: string): ParticipantsFrame {
	return JSON.parse(raw) as ParticipantsFrame;
}

/** 接続直後の参加者スナップショットを取りこぼさないよう、open 前から message を待つ */
function openWebSocket(baseUrl: string): Promise<{
	ws: WebSocket;
	initialParticipants: ParticipantsFrame;
}> {
	const ws = new WebSocket(toWs(baseUrl));
	return new Promise((resolve, reject) => {
		let opened = false;
		let initialRaw: string | undefined;

		ws.once("error", reject);
		ws.once("message", (data) => {
			initialRaw = data.toString();
			maybeResolve();
		});
		ws.once("open", () => {
			opened = true;
			maybeResolve();
		});

		function maybeResolve() {
			if (opened && initialRaw !== undefined) {
				const frame = parseParticipants(initialRaw);
				expect(frame.type).toBe("participants");
				resolve({ ws, initialParticipants: frame });
			}
		}
	});
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

function nextText(ws: WebSocket): Promise<string> {
	return new Promise((resolve, reject) => {
		ws.once("message", (data) => resolve(data.toString()));
		ws.once("error", reject);
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
		const { ws: w1 } = await openWebSocket(baseUrl);
		const { ws: w2 } = await openWebSocket(baseUrl);

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
		const { ws: w1 } = await openWebSocket(baseUrl);

		const firstAck = nextText(w1);
		w1.send(
			JSON.stringify({ displayName: "A", body: "before-second-connect" }),
		);
		await firstAck;

		const { ws: w2 } = await openWebSocket(baseUrl);

		await expectNoMessageDuring(w2, 500);

		const nextOnW2 = nextText(w2);
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
		const { ws } = await openWebSocket(baseUrl);

		ws.send(JSON.stringify({ displayName: "A", body: "" }));
		const errRaw = await nextText(ws);
		const errJson = JSON.parse(errRaw) as { type?: string; message?: string };
		expect(errJson.type).toBe("error");
		expect(typeof errJson.message).toBe("string");
		expect(errJson.message?.length).toBeGreaterThan(0);

		ws.send(JSON.stringify({ displayName: "A", body: "fixed" }));
		const okRaw = await nextText(ws);
		expect(JSON.parse(okRaw)).toMatchObject({ body: "fixed" });

		ws.close();
	});

	it("JSON でないテキストは error を返す", async () => {
		const { ws } = await openWebSocket(baseUrl);
		ws.send("not-json");
		const errRaw = await nextText(ws);
		const errJson = JSON.parse(errRaw) as { type?: string };
		expect(errJson.type).toBe("error");
		ws.close();
	});
});

describe("createChatServer participants roster", () => {
	let chat: ReturnType<typeof createChatServer>;
	let baseUrl: string;

	beforeEach(async () => {
		chat = createChatServer();
		({ baseUrl } = await listen(chat.httpServer));
	});

	afterEach(async () => {
		await chat.close();
	});

	it("sends participants snapshot on connect", async () => {
		const { ws, initialParticipants } = await openWebSocket(baseUrl);
		expect(initialParticipants.participants).toEqual([]);
		ws.close();
	});

	it("broadcasts participant when client sets display name", async () => {
		const { ws: w1 } = await openWebSocket(baseUrl);
		const { ws: w2 } = await openWebSocket(baseUrl);

		const p1 = nextText(w1);
		const p2 = nextText(w2);
		w1.send(JSON.stringify({ type: "setDisplayName", displayName: "Alice" }));

		const [m1, m2] = await Promise.all([p1, p2]);
		expect(m1).toBe(m2);
		const frame = parseParticipants(m1);
		expect(frame.participants).toHaveLength(1);
		expect(frame.participants[0]?.displayName).toBe("Alice");

		w1.close();
		w2.close();
	});

	it("removes participant on disconnect", async () => {
		const { ws: w1 } = await openWebSocket(baseUrl);
		const { ws: w2 } = await openWebSocket(baseUrl);

		w1.send(JSON.stringify({ type: "setDisplayName", displayName: "Alice" }));
		await nextText(w1);
		await nextText(w2);

		const p2 = nextText(w2);
		w1.close();
		await new Promise<void>((resolve) => setTimeout(resolve, 10));

		const raw = await p2;
		const frame = parseParticipants(raw);
		expect(frame.participants).toEqual([]);

		w2.close();
	});

	it("does not broadcast participants when unnamed client disconnects", async () => {
		const { ws: w1 } = await openWebSocket(baseUrl);
		const { ws: w2 } = await openWebSocket(baseUrl);

		w1.close();
		await new Promise<void>((resolve) => setTimeout(resolve, 10));

		await expectNoMessageDuring(w2, 500);

		w2.close();
	});

	it("includes existing participants in snapshot for late joiner", async () => {
		const { ws: w1 } = await openWebSocket(baseUrl);

		w1.send(JSON.stringify({ type: "setDisplayName", displayName: "Alice" }));
		await nextText(w1);

		const { ws: w2, initialParticipants } = await openWebSocket(baseUrl);
		expect(initialParticipants.participants).toHaveLength(1);
		expect(initialParticipants.participants[0]?.displayName).toBe("Alice");

		w1.close();
		w2.close();
	});

	it("does not include blank display name in roster", async () => {
		const { ws } = await openWebSocket(baseUrl);

		ws.send(JSON.stringify({ type: "setDisplayName", displayName: "   " }));
		const raw = await nextText(ws);
		const frame = parseParticipants(raw);
		expect(frame.participants).toEqual([]);

		ws.close();
	});
});

describe("createChatServer reactions", () => {
	let chat: ReturnType<typeof createChatServer>;
	let baseUrl: string;

	beforeEach(async () => {
		chat = createChatServer();
		({ baseUrl } = await listen(chat.httpServer));
	});

	afterEach(async () => {
		await chat.close();
	});

	it("broadcasts reaction counts to all clients when toggled", async () => {
		const { ws: w1 } = await openWebSocket(baseUrl);
		const { ws: w2 } = await openWebSocket(baseUrl);

		const postPromise = nextText(w1);
		const peerPostPromise = nextText(w2);
		w1.send(JSON.stringify({ displayName: "Alice", body: "hello" }));
		const post = JSON.parse(await postPromise) as { id: string };
		await peerPostPromise;

		const r1 = nextText(w1);
		const r2 = nextText(w2);
		w1.send(
			JSON.stringify({
				type: "reaction",
				postId: post.id,
				emoji: "👍",
				displayName: "Alice",
			}),
		);

		const [m1, m2] = await Promise.all([r1, r2]);
		expect(m1).toBe(m2);
		expect(JSON.parse(m1)).toEqual({
			type: "reactions",
			postId: post.id,
			reactions: [{ emoji: "👍", count: 1 }],
		});

		w1.close();
		w2.close();
	});

	it("removes a reaction when the same user toggles again", async () => {
		const { ws } = await openWebSocket(baseUrl);

		const postRaw = await (async () => {
			const p = nextText(ws);
			ws.send(JSON.stringify({ displayName: "Alice", body: "hi" }));
			return p;
		})();
		const post = JSON.parse(postRaw) as { id: string };

		ws.send(
			JSON.stringify({
				type: "reaction",
				postId: post.id,
				emoji: "✨",
				displayName: "Alice",
			}),
		);
		await nextText(ws);

		const cleared = nextText(ws);
		ws.send(
			JSON.stringify({
				type: "reaction",
				postId: post.id,
				emoji: "✨",
				displayName: "Alice",
			}),
		);
		expect(JSON.parse(await cleared)).toEqual({
			type: "reactions",
			postId: post.id,
			reactions: [],
		});

		ws.close();
	});

	it("rejects invalid reaction emoji with error frame", async () => {
		const { ws } = await openWebSocket(baseUrl);

		ws.send(
			JSON.stringify({
				type: "reaction",
				postId: "unknown",
				emoji: "🔥",
				displayName: "Alice",
			}),
		);
		const errRaw = await nextText(ws);
		expect(JSON.parse(errRaw)).toMatchObject({ type: "error" });

		ws.close();
	});
});
