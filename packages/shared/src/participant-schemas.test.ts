import { describe, expect, it } from "vitest";

import {
	clientInboundMessageSchema,
	clientSetDisplayNameSchema,
	participantSchema,
	serverParticipantsFrameSchema,
} from "./participant-schemas.js";

describe("clientSetDisplayNameSchema", () => {
	it("accepts setDisplayName payload", () => {
		const result = clientSetDisplayNameSchema.safeParse({
			type: "setDisplayName",
			displayName: "Alice",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				type: "setDisplayName",
				displayName: "Alice",
			});
		}
	});

	it("allows empty displayName", () => {
		const result = clientSetDisplayNameSchema.safeParse({
			type: "setDisplayName",
			displayName: "",
		});
		expect(result.success).toBe(true);
	});

	it("rejects wrong type", () => {
		const result = clientSetDisplayNameSchema.safeParse({
			type: "participants",
			displayName: "Alice",
		});
		expect(result.success).toBe(false);
	});

	it("rejects extra keys", () => {
		const result = clientSetDisplayNameSchema.safeParse({
			type: "setDisplayName",
			displayName: "Alice",
			body: "hello",
		});
		expect(result.success).toBe(false);
	});
});

describe("participantSchema", () => {
	it("accepts id and displayName", () => {
		const result = participantSchema.safeParse({
			id: "550e8400-e29b-41d4-a716-446655440000",
			displayName: "Bob",
		});
		expect(result.success).toBe(true);
	});
});

describe("serverParticipantsFrameSchema", () => {
	it("accepts participants frame", () => {
		const result = serverParticipantsFrameSchema.safeParse({
			type: "participants",
			participants: [
				{
					id: "550e8400-e29b-41d4-a716-446655440000",
					displayName: "Alice",
				},
			],
		});
		expect(result.success).toBe(true);
	});

	it("accepts empty participants array", () => {
		const result = serverParticipantsFrameSchema.safeParse({
			type: "participants",
			participants: [],
		});
		expect(result.success).toBe(true);
	});
});

describe("clientInboundMessageSchema", () => {
	it("parses post payload", () => {
		const result = clientInboundMessageSchema.safeParse({
			displayName: "Alice",
			body: "hello",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				displayName: "Alice",
				body: "hello",
			});
		}
	});

	it("parses setDisplayName payload", () => {
		const result = clientInboundMessageSchema.safeParse({
			type: "setDisplayName",
			displayName: "Alice",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				type: "setDisplayName",
				displayName: "Alice",
			});
		}
	});

	it("rejects ambiguous payload with both type and body", () => {
		const result = clientInboundMessageSchema.safeParse({
			type: "setDisplayName",
			displayName: "Alice",
			body: "hello",
		});
		expect(result.success).toBe(false);
	});
});
