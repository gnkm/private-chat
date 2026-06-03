import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
	COLOR_SCHEME_STORAGE_KEY,
	type ColorScheme,
	applyColorSchemeToDocument,
	getPreferredColorScheme,
	getThemeToggleLabel,
	loadColorScheme,
	saveColorScheme,
	toggleColorScheme,
} from "./color-scheme.js";

describe("color-scheme storage", () => {
	afterEach(() => {
		localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
		document.documentElement.classList.remove("dark");
		vi.unstubAllGlobals();
	});

	it("returns null when unset", () => {
		expect(loadColorScheme()).toBeNull();
	});

	it("persists and loads light or dark", () => {
		saveColorScheme("dark");
		expect(loadColorScheme()).toBe("dark");
		saveColorScheme("light");
		expect(loadColorScheme()).toBe("light");
	});

	it("ignores invalid stored values", () => {
		localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, "sepia");
		expect(loadColorScheme()).toBeNull();
	});
});

describe("getPreferredColorScheme", () => {
	afterEach(() => {
		localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
		vi.unstubAllGlobals();
	});

	it("uses stored preference when set", () => {
		saveColorScheme("dark");
		expect(getPreferredColorScheme()).toBe("dark");
	});

	it("falls back to prefers-color-scheme when unset", () => {
		vi.stubGlobal("matchMedia", (query: string) => ({
			matches: query.includes("dark"),
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		}));
		expect(getPreferredColorScheme()).toBe("dark");
	});

	it("defaults to light when unset and system prefers light", () => {
		vi.stubGlobal("matchMedia", (query: string) => ({
			matches: false,
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		}));
		expect(getPreferredColorScheme()).toBe("light");
	});
});

describe("applyColorSchemeToDocument", () => {
	afterEach(() => {
		document.documentElement.classList.remove("dark");
	});

	it("adds dark class for dark scheme", () => {
		applyColorSchemeToDocument("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	it("removes dark class for light scheme", () => {
		document.documentElement.classList.add("dark");
		applyColorSchemeToDocument("light");
		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});
});

describe("toggleColorScheme", () => {
	it.each<[ColorScheme, ColorScheme]>([
		["light", "dark"],
		["dark", "light"],
	])("switches from %s to %s", (current, next) => {
		expect(toggleColorScheme(current)).toBe(next);
	});
});

describe("getThemeToggleLabel", () => {
	it("describes the target mode", () => {
		expect(getThemeToggleLabel("light")).toBe("ダークモードに切り替え");
		expect(getThemeToggleLabel("dark")).toBe("ライトモードに切り替え");
	});
});

describe("COLOR_SCHEME_STORAGE_KEY", () => {
	it("matches index.html bootstrap script", () => {
		const htmlPath = path.join(
			path.dirname(fileURLToPath(import.meta.url)),
			"../../index.html",
		);
		const html = readFileSync(htmlPath, "utf8");
		expect(html).toContain(`var key = "${COLOR_SCHEME_STORAGE_KEY}"`);
	});
});
