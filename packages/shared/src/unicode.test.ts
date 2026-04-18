import { describe, expect, it } from "vitest";

import { countUnicodeCodePoints } from "./unicode.js";

describe("countUnicodeCodePoints", () => {
	it("matches spread length for BMP and supplementary text", () => {
		expect(countUnicodeCodePoints("abc")).toBe(3);
		expect(countUnicodeCodePoints("😀")).toBe(1);
	});
});
