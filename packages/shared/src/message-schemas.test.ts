import { describe, expect, it } from "vitest";

import {
	MESSAGE_BODY_MAX_CODE_POINTS,
	NUL_CHARACTER,
	clientPostPayloadSchema,
	postMessageBodySchema,
	serverBroadcastPostSchema,
} from "./index.js";

describe("postMessageBodySchema (SRS-FUNC-007〜008)", () => {
	it("accepts LF, CR, and tab", () => {
		const body = "a\nb\rc\tend";
		expect(postMessageBodySchema.safeParse(body).success).toBe(true);
	});

	it("rejects NUL", () => {
		const result = postMessageBodySchema.safeParse(
			`hello${NUL_CHARACTER}world`,
		);
		expect(result.success).toBe(false);
	});

	it("rejects empty string (SRS-FUNC-001)", () => {
		expect(postMessageBodySchema.safeParse("").success).toBe(false);
	});

	it("accepts exactly MESSAGE_BODY_MAX_CODE_POINTS code points", () => {
		const body = "a".repeat(MESSAGE_BODY_MAX_CODE_POINTS);
		expect(postMessageBodySchema.safeParse(body).success).toBe(true);
	});

	it("rejects when code point count exceeds max (BMP)", () => {
		const body = "a".repeat(MESSAGE_BODY_MAX_CODE_POINTS + 1);
		expect(postMessageBodySchema.safeParse(body).success).toBe(false);
	});

	it("counts supplementary characters as one code point each", () => {
		const emoji = "😀";
		expect([...emoji].length).toBe(1);
		const pad = "a".repeat(MESSAGE_BODY_MAX_CODE_POINTS - 1);
		expect(postMessageBodySchema.safeParse(`${emoji}${pad}`).success).toBe(
			true,
		);
		expect(postMessageBodySchema.safeParse(`${emoji}${pad}a`).success).toBe(
			false,
		);
	});
});

describe("clientPostPayloadSchema", () => {
	it("accepts displayName and body only", () => {
		const result = clientPostPayloadSchema.safeParse({
			displayName: "Alice",
			body: "hello",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ displayName: "Alice", body: "hello" });
		}
	});

	it("allows empty displayName", () => {
		const result = clientPostPayloadSchema.safeParse({
			displayName: "",
			body: "x",
		});
		expect(result.success).toBe(true);
	});

	it("rejects extra keys (no client-supplied id / sentAt)", () => {
		const result = clientPostPayloadSchema.safeParse({
			displayName: "a",
			body: "b",
			id: "should-not-be-here",
		});
		expect(result.success).toBe(false);
	});

	it("rejects sentAt from client", () => {
		const result = clientPostPayloadSchema.safeParse({
			displayName: "a",
			body: "b",
			sentAt: "2026-04-18T00:00:00.000Z",
		});
		expect(result.success).toBe(false);
	});
});

describe("serverBroadcastPostSchema", () => {
	const valid = {
		id: "550e8400-e29b-41d4-a716-446655440000",
		displayName: "Bob",
		body: "hi",
		sentAt: "2026-04-18T12:34:56.789Z",
	};

	it("accepts id, displayName, body, sentAt", () => {
		const result = serverBroadcastPostSchema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it("rejects empty id", () => {
		const result = serverBroadcastPostSchema.safeParse({ ...valid, id: "" });
		expect(result.success).toBe(false);
	});

	it("rejects invalid sentAt", () => {
		const result = serverBroadcastPostSchema.safeParse({
			...valid,
			sentAt: "not-a-timestamp",
		});
		expect(result.success).toBe(false);
	});

	it("rejects non-ISO date strings that Date.parse might accept", () => {
		for (const sentAt of ["January 1, 2024", "4/18/2024", "2024-01-01"]) {
			expect(
				serverBroadcastPostSchema.safeParse({ ...valid, sentAt }).success,
			).toBe(false);
		}
	});

	it("rejects body violating shared body rules", () => {
		const result = serverBroadcastPostSchema.safeParse({
			...valid,
			body: "",
		});
		expect(result.success).toBe(false);
	});

	it("rejects unknown keys", () => {
		const result = serverBroadcastPostSchema.safeParse({
			...valid,
			extra: 1,
		});
		expect(result.success).toBe(false);
	});
});
