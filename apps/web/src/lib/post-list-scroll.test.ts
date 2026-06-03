import { describe, expect, it } from "vitest";

import {
	isNearScrollBottom,
	scrollElementToBottom,
} from "./post-list-scroll.js";

describe("isNearScrollBottom", () => {
	it("returns true when within threshold of the bottom", () => {
		expect(isNearScrollBottom(852, 1000, 100, 48)).toBe(true);
	});

	it("returns false when far from the bottom", () => {
		expect(isNearScrollBottom(0, 1000, 100, 48)).toBe(false);
	});
});

describe("scrollElementToBottom", () => {
	it("sets scrollTop to scrollHeight", () => {
		const element = document.createElement("div");
		Object.defineProperty(element, "scrollHeight", {
			value: 500,
			configurable: true,
		});
		element.scrollTop = 0;

		scrollElementToBottom(element);

		expect(element.scrollTop).toBe(500);
	});
});
