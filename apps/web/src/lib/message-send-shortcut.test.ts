import { describe, expect, it } from "vitest";

import {
	isMacPlatform,
	isMessageSendShortcut,
} from "./message-send-shortcut.js";

describe("isMessageSendShortcut", () => {
	const base = {
		key: "Enter",
		metaKey: false,
		ctrlKey: false,
		shiftKey: false,
		isComposing: false,
	};

	it("returns false for plain Enter on Windows", () => {
		expect(isMessageSendShortcut(base, false)).toBe(false);
	});

	it("returns false for plain Enter on Mac", () => {
		expect(isMessageSendShortcut(base, true)).toBe(false);
	});

	it("returns true for Ctrl+Enter on Windows", () => {
		expect(isMessageSendShortcut({ ...base, ctrlKey: true }, false)).toBe(true);
	});

	it("returns false for Meta+Enter on Windows", () => {
		expect(isMessageSendShortcut({ ...base, metaKey: true }, false)).toBe(
			false,
		);
	});

	it("returns true for Meta+Enter on Mac", () => {
		expect(isMessageSendShortcut({ ...base, metaKey: true }, true)).toBe(true);
	});

	it("returns false for Ctrl+Enter on Mac", () => {
		expect(isMessageSendShortcut({ ...base, ctrlKey: true }, true)).toBe(false);
	});

	it("returns false while IME is composing", () => {
		expect(
			isMessageSendShortcut(
				{ ...base, ctrlKey: true, isComposing: true },
				false,
			),
		).toBe(false);
	});

	it("returns false for Shift+Ctrl+Enter on Windows", () => {
		expect(
			isMessageSendShortcut({ ...base, ctrlKey: true, shiftKey: true }, false),
		).toBe(false);
	});
});

describe("isMacPlatform", () => {
	it("detects Mac from navigator.platform", () => {
		const original = navigator.platform;
		Object.defineProperty(navigator, "platform", {
			configurable: true,
			value: "MacIntel",
		});
		expect(isMacPlatform()).toBe(true);
		Object.defineProperty(navigator, "platform", {
			configurable: true,
			value: original,
		});
	});
});
