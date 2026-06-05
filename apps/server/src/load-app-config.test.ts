import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_APP_CONFIG } from "@private-chat/shared";

import {
	loadAppConfigFromFile,
	resolveAppConfigPath,
} from "./load-app-config.js";

describe("resolveAppConfigPath", () => {
	it("prefers staticDir/config.jsonc when present", () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pc-config-"));
		const configPath = path.join(dir, "config.jsonc");
		fs.writeFileSync(configPath, "{}");

		expect(resolveAppConfigPath({ staticDir: dir })).toBe(configPath);
	});
});

describe("loadAppConfigFromFile", () => {
	const tempDirs: string[] = [];

	afterEach(() => {
		for (const dir of tempDirs) {
			fs.rmSync(dir, { recursive: true, force: true });
		}
		tempDirs.length = 0;
	});

	it("loads custom reaction emojis from config.jsonc", () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pc-config-"));
		tempDirs.push(dir);
		fs.writeFileSync(
			path.join(dir, "config.jsonc"),
			`{ "reactions": { "emojis": ["🔥", "👍"] } }`,
		);

		expect(loadAppConfigFromFile(path.join(dir, "config.jsonc"))).toEqual({
			shiki: { ...DEFAULT_APP_CONFIG.shiki },
			reactions: { emojis: ["🔥", "👍"] },
		});
	});

	it("returns defaults when the file is missing", () => {
		expect(
			loadAppConfigFromFile(path.join(os.tmpdir(), "missing.jsonc")),
		).toEqual(DEFAULT_APP_CONFIG);
	});
});
