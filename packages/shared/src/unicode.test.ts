import { describe, expect, it } from "vitest";

import { MESSAGE_BODY_MAX_CODE_POINTS } from "./constants.js";
import { countUnicodeCodePoints, truncateToMaxCodePoints } from "./unicode.js";

describe("countUnicodeCodePoints", () => {
	it("matches spread length for BMP and supplementary text", () => {
		expect(countUnicodeCodePoints("abc")).toBe(3);
		expect(countUnicodeCodePoints("😀")).toBe(1);
	});
});

describe("truncateToMaxCodePoints", () => {
	it("returns input unchanged when within max", () => {
		expect(truncateToMaxCodePoints("hello", 5)).toBe("hello");
	});

	it("truncates by Unicode code point (SRS-FUNC-007)", () => {
		const input = `${"a".repeat(MESSAGE_BODY_MAX_CODE_POINTS)}😀`;
		const result = truncateToMaxCodePoints(input);
		expect(countUnicodeCodePoints(result)).toBe(MESSAGE_BODY_MAX_CODE_POINTS);
		expect(result).toBe("a".repeat(MESSAGE_BODY_MAX_CODE_POINTS));
	});
});
