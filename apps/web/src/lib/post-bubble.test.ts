import { describe, expect, it } from "vitest";

import {
	getPostBubbleBodyClassName,
	getPostBubbleRowClassName,
	getPostBubbleTailClassName,
} from "./post-bubble.js";

describe("post bubble class names", () => {
	it("returns row classes for own and other", () => {
		expect(getPostBubbleRowClassName(false)).toContain(
			"post-bubble-row--other",
		);
		expect(getPostBubbleRowClassName(true)).toContain("post-bubble-row--own");
		expect(getPostBubbleRowClassName(false)).toContain("w-[85%]");
	});

	it("returns rounded body classes", () => {
		expect(getPostBubbleBodyClassName(false)).toContain("rounded-2xl");
		expect(getPostBubbleBodyClassName(true)).toContain("post-bubble-body--own");
	});

	it("returns tail classes on the outer side", () => {
		expect(getPostBubbleTailClassName(false)).toContain(
			"post-bubble-tail--other",
		);
		expect(getPostBubbleTailClassName(true)).toContain("post-bubble-tail--own");
	});
});
