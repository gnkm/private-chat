import { describe, expect, it } from "vitest";

import { formatMessageBodyCounter } from "./message-body-counter.js";

describe("formatMessageBodyCounter", () => {
	it("formats current and max with grouping", () => {
		expect(formatMessageBodyCounter(0, 12_000)).toBe("0 / 12,000");
		expect(formatMessageBodyCounter(1200, 12_000)).toBe("1,200 / 12,000");
	});
});
