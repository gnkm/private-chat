import { describe, expect, it } from "vitest";

import {
	REACTION_EMOJIS,
	clientReactionPayloadSchema,
	reactionCountsFromRoster,
	serverReactionsFrameSchema,
	toggleReactionOnRoster,
} from "./reaction-schemas.js";

describe("clientReactionPayloadSchema", () => {
	it("accepts a valid reaction toggle", () => {
		const result = clientReactionPayloadSchema.safeParse({
			type: "reaction",
			postId: "post-1",
			emoji: "👍",
			displayName: "Alice",
		});
		expect(result.success).toBe(true);
	});

	it("rejects unknown emoji", () => {
		const result = clientReactionPayloadSchema.safeParse({
			type: "reaction",
			postId: "post-1",
			emoji: "🔥",
			displayName: "Alice",
		});
		expect(result.success).toBe(false);
	});
});

describe("serverReactionsFrameSchema", () => {
	it("accepts reactions with counts", () => {
		const result = serverReactionsFrameSchema.safeParse({
			type: "reactions",
			postId: "post-1",
			reactions: [
				{ emoji: "👍", count: 2 },
				{ emoji: "✨", count: 1 },
			],
		});
		expect(result.success).toBe(true);
	});
});

describe("toggleReactionOnRoster", () => {
	it("adds then removes a reaction for the same user", () => {
		let roster = toggleReactionOnRoster(new Map(), "👍", "Alice");
		expect(reactionCountsFromRoster(roster)).toEqual([
			{ emoji: "👍", count: 1 },
		]);

		roster = toggleReactionOnRoster(roster, "👍", "Alice");
		expect(reactionCountsFromRoster(roster)).toEqual([]);
	});

	it("tracks multiple users on the same emoji", () => {
		let roster = toggleReactionOnRoster(new Map(), "👀", "Alice");
		roster = toggleReactionOnRoster(roster, "👀", "Bob");
		expect(reactionCountsFromRoster(roster)).toEqual([
			{ emoji: "👀", count: 2 },
		]);
	});

	it("allows one user to react with multiple emojis", () => {
		let roster = toggleReactionOnRoster(new Map(), "👍", "Alice");
		roster = toggleReactionOnRoster(roster, "🙏", "Alice");
		expect(reactionCountsFromRoster(roster)).toEqual([
			{ emoji: "👍", count: 1 },
			{ emoji: "🙏", count: 1 },
		]);
	});

	it("only exposes allowed emojis in stable order", () => {
		expect(REACTION_EMOJIS).toEqual(["👍", "🙏", "👀", "✨"]);
	});
});
