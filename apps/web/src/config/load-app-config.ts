import {
	type AppConfig,
	DEFAULT_APP_CONFIG,
	parseAppConfigText,
} from "@private-chat/shared";

/** ブラウザが fetch するランタイム設定（Git 管理外） */
export const APP_CONFIG_PATH = "/config.jsonc";

export { DEFAULT_APP_CONFIG };
export type { AppConfig };

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
			return cloneDefaultAppConfig();
		}

		const text = await response.text();
		return parseAppConfigText(text);
	} catch {
		return cloneDefaultAppConfig();
	}
}

function cloneDefaultAppConfig(): AppConfig {
	return {
		shiki: { ...DEFAULT_APP_CONFIG.shiki },
		reactions: { emojis: [...DEFAULT_APP_CONFIG.reactions.emojis] },
	};
}
