import { describe, expect, it } from "vitest";

import {
	getPostAuthorNameClassName,
	getPostBubbleBodyClassName,
	getPostBubbleRowClassName,
	getPostBubbleTailClassName,
	getPostMessageColumnClassName,
	getPostMetaClassName,
	getPostSentAtClassName,
} from "./post-bubble.js";

describe("post bubble class names", () => {
	it("returns message column with 85% width", () => {
		expect(getPostMessageColumnClassName(false)).toContain("w-[85%]");
		expect(getPostMessageColumnClassName(true)).toContain("items-end");
		expect(getPostMessageColumnClassName(false)).toContain("items-start");
	});

	it("returns meta and author name classes", () => {
		expect(getPostMetaClassName(false)).toContain("post-meta");
		expect(getPostMetaClassName(true)).toContain("justify-end");
		expect(getPostAuthorNameClassName()).toContain("post-author-name");
		expect(getPostSentAtClassName()).toContain("post-sent-at");
	});

	it("returns row classes for own and other", () => {
		expect(getPostBubbleRowClassName(false)).toContain(
			"post-bubble-row--other",
		);
		expect(getPostBubbleRowClassName(true)).toContain("post-bubble-row--own");
		expect(getPostBubbleRowClassName(false)).toContain("w-full");
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
