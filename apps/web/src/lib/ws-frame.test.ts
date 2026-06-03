import { describe, expect, it } from "vitest";

import { parseWsFrame } from "./ws-frame.js";

describe("parseWsFrame", () => {
	it("parses a server broadcast post", () => {
		const raw = JSON.stringify({
			id: "1",
			displayName: "A",
			body: "hi",
			sentAt: "2026-04-18T12:34:56.789Z",
		});
		const result = parseWsFrame(raw);
		expect(result).toEqual({
			kind: "post",
			post: {
				id: "1",
				displayName: "A",
				body: "hi",
				sentAt: "2026-04-18T12:34:56.789Z",
			},
		});
	});

	it("parses participants frame", () => {
		const raw = JSON.stringify({
			type: "participants",
			participants: [{ id: "p1", displayName: "Alice" }],
		});
		expect(parseWsFrame(raw)).toEqual({
			kind: "participants",
			participants: [{ id: "p1", displayName: "Alice" }],
		});
	});

	it("parses server error frames (SRS-IF-003)", () => {
		const raw = JSON.stringify({ type: "error", message: "body is required" });
		expect(parseWsFrame(raw)).toEqual({
			kind: "error",
			message: "body is required",
		});
	});

	it("returns invalid for non-JSON", () => {
		expect(parseWsFrame("not-json")).toEqual({ kind: "invalid" });
	});

	it("returns invalid for unknown JSON shape", () => {
		expect(parseWsFrame(JSON.stringify({ foo: 1 }))).toEqual({
			kind: "invalid",
		});
	});
});
