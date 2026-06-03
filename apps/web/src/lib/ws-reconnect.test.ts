import { describe, expect, it } from "vitest";

import {
	RECONNECT_BASE_CAP_MS,
	RECONNECT_JITTER_MAX_MS,
	computeReconnectDelayMs,
} from "./ws-reconnect.js";

describe("computeReconnectDelayMs (architecture §7.3)", () => {
	it("adds jitter in 0..500ms to the base delay", () => {
		expect(computeReconnectDelayMs(0, () => 0)).toBe(1_000);
		expect(computeReconnectDelayMs(0, () => 1)).toBe(1_000 + 500);
	});

	it("caps base delay at 30 seconds before jitter", () => {
		const delay = computeReconnectDelayMs(100, () => 0);
		expect(delay).toBe(RECONNECT_BASE_CAP_MS);
	});

	it("never exceeds base cap plus max jitter", () => {
		const delay = computeReconnectDelayMs(100, () => 1);
		expect(delay).toBe(RECONNECT_BASE_CAP_MS + RECONNECT_JITTER_MAX_MS);
	});
});
