import { describe, expect, it } from "vitest";

import { DEFAULT_REACTION_EMOJIS } from "./reaction-config.js";
import {
	REACTION_EMOJIS,
	createReactionSchemas,
	reactionCountsFromRoster,
	toggleReactionOnRoster,
} from "./reaction-schemas.js";

const defaultSchemas = createReactionSchemas();

describe("clientReactionPayloadSchema", () => {
	it("accepts a valid reaction toggle", () => {
		const result = defaultSchemas.clientReactionPayloadSchema.safeParse({
			type: "reaction",
			postId: "post-1",
			emoji: "👍",
			displayName: "Alice",
		});
		expect(result.success).toBe(true);
	});

	it("rejects unknown emoji", () => {
		const result = defaultSchemas.clientReactionPayloadSchema.safeParse({
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
		const result = defaultSchemas.serverReactionsFrameSchema.safeParse({
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
		expect(reactionCountsFromRoster(roster, DEFAULT_REACTION_EMOJIS)).toEqual([
			{ emoji: "👍", count: 1 },
		]);

		roster = toggleReactionOnRoster(roster, "👍", "Alice");
		expect(reactionCountsFromRoster(roster, DEFAULT_REACTION_EMOJIS)).toEqual(
			[],
		);
	});

	it("tracks multiple users on the same emoji", () => {
		let roster = toggleReactionOnRoster(new Map(), "👀", "Alice");
		roster = toggleReactionOnRoster(roster, "👀", "Bob");
		expect(reactionCountsFromRoster(roster, DEFAULT_REACTION_EMOJIS)).toEqual([
			{ emoji: "👀", count: 2 },
		]);
	});

	it("allows one user to react with multiple emojis", () => {
		let roster = toggleReactionOnRoster(new Map(), "👍", "Alice");
		roster = toggleReactionOnRoster(roster, "🙏", "Alice");
		expect(reactionCountsFromRoster(roster, DEFAULT_REACTION_EMOJIS)).toEqual([
			{ emoji: "👍", count: 1 },
			{ emoji: "🙏", count: 1 },
		]);
	});

	it("only exposes allowed emojis in stable order", () => {
		expect(REACTION_EMOJIS).toEqual(["👍", "🙏", "👀", "✨"]);
	});
});

describe("createReactionSchemas", () => {
	it("accepts custom emoji lists from config", () => {
		const schemas = createReactionSchemas(["🔥", "👍"]);
		expect(schemas.allowedEmojis).toEqual(["🔥", "👍"]);
		expect(
			schemas.clientReactionPayloadSchema.safeParse({
				type: "reaction",
				postId: "p1",
				emoji: "🔥",
				displayName: "Bob",
			}).success,
		).toBe(true);
		expect(
			schemas.clientReactionPayloadSchema.safeParse({
				type: "reaction",
				postId: "p1",
				emoji: "✨",
				displayName: "Bob",
			}).success,
		).toBe(false);
	});
});
