import { afterEach, describe, expect, it, vi } from "vitest";

import {
	APP_CONFIG_PATH,
	DEFAULT_APP_CONFIG,
	loadAppConfig,
	resetAppConfigCache,
} from "./load-app-config.js";

describe("loadAppConfig", () => {
	afterEach(() => {
		resetAppConfigCache();
		vi.restoreAllMocks();
	});

	it("loads shiki themes from config.jsonc with JSONC comments", async () => {
		const fetchImpl = vi.fn(async () => ({
			ok: true,
			text: async () => `{
				// ライトモード
				"shiki": {
					"light": "vitesse-light",
					"dark": "nord"
				}
			}`,
		})) as unknown as typeof fetch;

		await expect(loadAppConfig({ fetchImpl })).resolves.toEqual({
			shiki: {
				light: "vitesse-light",
				dark: "nord",
			},
		});
		expect(fetchImpl).toHaveBeenCalledWith(APP_CONFIG_PATH);
	});

	it("falls back to defaults when config.jsonc is missing", async () => {
		const fetchImpl = vi.fn(async () => ({
			ok: false,
			text: async () => "",
		})) as unknown as typeof fetch;

		await expect(loadAppConfig({ fetchImpl })).resolves.toEqual(
			DEFAULT_APP_CONFIG,
		);
	});

	it("falls back to defaults when config is invalid", async () => {
		const fetchImpl = vi.fn(async () => ({
			ok: true,
			text: async () => `{ "shiki": { "light": "" } }`,
		})) as unknown as typeof fetch;

		await expect(loadAppConfig({ fetchImpl })).resolves.toEqual(
			DEFAULT_APP_CONFIG,
		);
	});

	it("caches the loaded config", async () => {
		const fetchImpl = vi.fn(async () => ({
			ok: true,
			text: async () =>
				`{ "shiki": { "light": "github-light", "dark": "github-dark" } }`,
		})) as unknown as typeof fetch;

		await loadAppConfig({ fetchImpl });
		await loadAppConfig({ fetchImpl });

		expect(fetchImpl).toHaveBeenCalledTimes(1);
	});
});
