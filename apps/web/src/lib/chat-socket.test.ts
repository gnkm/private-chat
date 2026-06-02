import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChatSocket } from "./chat-socket.js";
import type { FakeWebSocketController } from "./fake-websocket.js";
import { createFakeWebSocketClass } from "./fake-websocket.js";

describe("ChatSocket (SRS-IF-001, SRS-IF-003)", () => {
	let FakeWebSocket: ReturnType<
		typeof createFakeWebSocketClass
	>["FakeWebSocket"];
	let getLastController: () => FakeWebSocketController | undefined;

	beforeEach(() => {
		vi.useFakeTimers();
		const created = createFakeWebSocketClass();
		FakeWebSocket = created.FakeWebSocket;
		getLastController = created.getLastController;
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("invokes onPost when a broadcast arrives", async () => {
		const onPost = vi.fn();
		const socket = new ChatSocket(
			"ws://test/ws",
			{ onPost, onSendError: vi.fn() },
			() => new FakeWebSocket("ws://test/ws"),
		);
		socket.connect();
		await vi.waitFor(() => expect(getLastController()?.readyState).toBe(1));

		getLastController()?.simulateMessage(
			JSON.stringify({
				id: "1",
				displayName: "A",
				body: "hello",
				sentAt: "2026-04-18T12:34:56.789Z",
			}),
		);

		expect(onPost).toHaveBeenCalledWith({
			id: "1",
			displayName: "A",
			body: "hello",
			sentAt: "2026-04-18T12:34:56.789Z",
		});
		socket.dispose();
	});

	it("invokes onSendError when server returns error frame", async () => {
		const onSendError = vi.fn();
		const socket = new ChatSocket(
			"ws://test/ws",
			{ onPost: vi.fn(), onSendError },
			() => new FakeWebSocket("ws://test/ws"),
		);
		socket.connect();
		await vi.waitFor(() => expect(getLastController()?.readyState).toBe(1));

		getLastController()?.simulateMessage(
			JSON.stringify({ type: "error", message: "invalid body" }),
		);

		expect(onSendError).toHaveBeenCalledWith("invalid body");
		socket.dispose();
	});

	it("does not send empty body (SRS-FUNC-001)", async () => {
		const socket = new ChatSocket(
			"ws://test/ws",
			{ onPost: vi.fn(), onSendError: vi.fn() },
			() => new FakeWebSocket("ws://test/ws"),
		);
		socket.connect();
		await vi.waitFor(() => expect(getLastController()?.readyState).toBe(1));

		socket.sendPost({ displayName: "A", body: "" });
		expect(getLastController()?.sent).toHaveLength(0);
		socket.dispose();
	});

	it("schedules reconnect with backoff after unexpected close", async () => {
		const socket = new ChatSocket(
			"ws://test/ws",
			{ onPost: vi.fn(), onSendError: vi.fn() },
			() => new FakeWebSocket("ws://test/ws"),
		);
		socket.connect();
		await vi.waitFor(() => expect(getLastController()?.readyState).toBe(1));
		const first = getLastController();
		first?.simulateClose();

		await vi.advanceTimersByTimeAsync(1_000);
		await vi.waitFor(() => expect(getLastController()).not.toBe(first));
		socket.dispose();
	});
});
