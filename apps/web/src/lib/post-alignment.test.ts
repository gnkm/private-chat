import { describe, expect, it } from "vitest";

import { isOwnPost } from "./post-alignment.js";

describe("isOwnPost", () => {
	it("returns true when display names match after trim", () => {
		expect(isOwnPost("Alice", "Alice")).toBe(true);
		expect(isOwnPost(" Alice ", "Alice")).toBe(true);
		expect(isOwnPost("Alice", " Alice ")).toBe(true);
	});

	it("returns false for other users", () => {
		expect(isOwnPost("Bob", "Alice")).toBe(false);
	});

	it("returns false when current display name is blank", () => {
		expect(isOwnPost("Alice", "")).toBe(false);
		expect(isOwnPost("Alice", "   ")).toBe(false);
	});
});
