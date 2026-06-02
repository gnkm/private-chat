import { afterEach, describe, expect, it } from "vitest";

import {
	DISPLAY_NAME_STORAGE_KEY,
	loadDisplayName,
	saveDisplayName,
} from "./display-name.js";

describe("display-name storage (SRS-UI-004)", () => {
	afterEach(() => {
		localStorage.removeItem(DISPLAY_NAME_STORAGE_KEY);
	});

	it("returns empty string when unset", () => {
		expect(loadDisplayName()).toBe("");
	});

	it("persists and loads display name", () => {
		saveDisplayName("Alice");
		expect(loadDisplayName()).toBe("Alice");
	});
});
