import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChatSocket } from "./chat-socket.js";
import type { FakeWebSocketController } from "./fake-websocket.js";
import { createFakeWebSocketClass } from "./fake-websocket.js";

const noopParticipants = vi.fn();
const noopOpen = vi.fn();

function socketCallbacks(
	overrides: Partial<{
		onPost: ReturnType<typeof vi.fn>;
		onSendError: ReturnType<typeof vi.fn>;
		onParticipants: ReturnType<typeof vi.fn>;
		onOpen: ReturnType<typeof vi.fn>;
	}> = {},
) {
	return {
		onPost: vi.fn(),
		onSendError: vi.fn(),
		onParticipants: noopParticipants,
		onOpen: noopOpen,
		...overrides,
	};
}

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
			socketCallbacks({ onPost }),
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
			socketCallbacks({ onSendError }),
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
			socketCallbacks(),
			() => new FakeWebSocket("ws://test/ws"),
		);
		socket.connect();
		await vi.waitFor(() => expect(getLastController()?.readyState).toBe(1));

		expect(socket.sendPost({ displayName: "A", body: "" })).toBe(false);
		expect(getLastController()?.sent).toHaveLength(0);
		socket.dispose();
	});

	it("schedules reconnect with backoff after unexpected close", async () => {
		const socket = new ChatSocket(
			"ws://test/ws",
			socketCallbacks(),
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

	it("invokes onParticipants when participants frame arrives", async () => {
		const onParticipants = vi.fn();
		const socket = new ChatSocket(
			"ws://test/ws",
			socketCallbacks({ onParticipants }),
			() => new FakeWebSocket("ws://test/ws"),
		);
		socket.connect();
		await vi.waitFor(() => expect(getLastController()?.readyState).toBe(1));

		getLastController()?.simulateMessage(
			JSON.stringify({
				type: "participants",
				participants: [{ id: "p1", displayName: "Alice" }],
			}),
		);

		expect(onParticipants).toHaveBeenCalledWith([
			{ id: "p1", displayName: "Alice" },
		]);
		socket.dispose();
	});

	it("sends setDisplayName payload", async () => {
		const socket = new ChatSocket(
			"ws://test/ws",
			socketCallbacks(),
			() => new FakeWebSocket("ws://test/ws"),
		);
		socket.connect();
		await vi.waitFor(() => expect(getLastController()?.readyState).toBe(1));

		expect(socket.sendSetDisplayName("Alice")).toBe(true);
		expect(getLastController()?.sent).toContainEqual(
			JSON.stringify({ type: "setDisplayName", displayName: "Alice" }),
		);
		socket.dispose();
	});

	it("invokes onOpen when connection opens", async () => {
		const onOpen = vi.fn();
		const socket = new ChatSocket(
			"ws://test/ws",
			socketCallbacks({ onOpen }),
			() => new FakeWebSocket("ws://test/ws"),
		);
		socket.connect();
		await vi.waitFor(() => expect(onOpen).toHaveBeenCalled());
		socket.dispose();
	});
});
