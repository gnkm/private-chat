import { describe, expect, it } from "vitest";

import {
	applyReactionsFrame,
	countForEmoji,
	toggleMyReaction,
} from "./reactions.js";

describe("applyReactionsFrame", () => {
	it("stores counts for a post id", () => {
		const next = applyReactionsFrame(
			{},
			{
				type: "reactions",
				postId: "p1",
				reactions: [{ emoji: "👍", count: 2 }],
			},
		);
		expect(next).toEqual({ p1: [{ emoji: "👍", count: 2 }] });
	});
});

describe("countForEmoji", () => {
	it("returns zero when emoji is absent", () => {
		expect(countForEmoji(undefined, "👀")).toBe(0);
	});
});

describe("toggleMyReaction", () => {
	it("adds and removes emoji for the current user", () => {
		expect(toggleMyReaction(new Set(), "🙏")).toEqual(new Set(["🙏"]));
		expect(toggleMyReaction(new Set(["🙏"]), "🙏")).toEqual(new Set());
	});
});
