import { parse } from "jsonc-parser";
import { z } from "zod";

/** ブラウザが fetch するランタイム設定（Git 管理外） */
export const APP_CONFIG_PATH = "/config.jsonc";

export const DEFAULT_APP_CONFIG = {
	shiki: {
		light: "github-light",
		dark: "github-dark",
	},
} as const;

const appConfigSchema = z.object({
	shiki: z.object({
		light: z.string().min(1),
		dark: z.string().min(1),
	}),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

type LoadAppConfigOptions = {
	fetchImpl?: typeof fetch;
};

let configPromise: Promise<AppConfig> | undefined;

export function resetAppConfigCache(): void {
	configPromise = undefined;
}

export function loadAppConfig(
	options: LoadAppConfigOptions = {},
): Promise<AppConfig> {
	if (!configPromise) {
		configPromise = fetchAppConfig(options.fetchImpl ?? fetch);
	}
	return configPromise;
}

async function fetchAppConfig(fetchImpl: typeof fetch): Promise<AppConfig> {
	try {
		const response = await fetchImpl(APP_CONFIG_PATH);
		if (!response.ok) {
			return { ...DEFAULT_APP_CONFIG };
		}

		const text = await response.text();
		const parsed: unknown = parse(text);
		const result = appConfigSchema.safeParse(parsed);
		if (!result.success) {
			return { ...DEFAULT_APP_CONFIG };
		}

		return result.data;
	} catch {
		return { ...DEFAULT_APP_CONFIG };
	}
}
