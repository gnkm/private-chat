import { describe, expect, it, vi } from "vitest";

import { createFakeWebSocketClass } from "./fake-websocket.js";

describe("FakeWebSocket", () => {
	it("古いソケットの close が再接続後の controller を上書きしない", async () => {
		const { FakeWebSocket, getLastController } = createFakeWebSocketClass();
		const first = new FakeWebSocket("ws://test/ws");
		await vi.waitFor(() => expect(getLastController()?.readyState).toBe(1));
		const firstController = getLastController();

		new FakeWebSocket("ws://test/ws");
		await vi.waitFor(() => expect(getLastController()?.readyState).toBe(1));
		const secondController = getLastController();

		first.close();

		expect(firstController?.readyState).toBe(3);
		expect(secondController?.readyState).toBe(1);
	});
});
