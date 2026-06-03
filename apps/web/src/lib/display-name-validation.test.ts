import { describe, expect, it } from "vitest";

import { isDisplayNameBlank } from "./display-name-validation.js";

describe("isDisplayNameBlank", () => {
	it("returns true for empty string", () => {
		expect(isDisplayNameBlank("")).toBe(true);
	});

	it("returns true for whitespace only", () => {
		expect(isDisplayNameBlank("   ")).toBe(true);
	});

	it("returns false when non-whitespace characters exist", () => {
		expect(isDisplayNameBlank("Alice")).toBe(false);
		expect(isDisplayNameBlank("  Bob  ")).toBe(false);
	});
});
