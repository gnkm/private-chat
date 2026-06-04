import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
	type AppConfig,
	DEFAULT_APP_CONFIG,
	parseAppConfigText,
} from "@private-chat/shared";

const serverDir = path.dirname(fileURLToPath(import.meta.url));

/** 開発時（`apps/web/dist` 未ビルド）に `public/config.jsonc` を参照する */
const DEV_PUBLIC_CONFIG = path.resolve(
	serverDir,
	"../../web/public/config.jsonc",
);

export type ResolveAppConfigPathOptions = {
	staticDir?: string;
	envPath?: string;
};

export function resolveAppConfigPath(
	options: ResolveAppConfigPathOptions = {},
): string | undefined {
	const envPath = options.envPath ?? process.env.APP_CONFIG_PATH;
	if (envPath && fs.existsSync(envPath)) {
		return path.resolve(envPath);
	}

	if (options.staticDir) {
		const staticConfig = path.join(options.staticDir, "config.jsonc");
		if (fs.existsSync(staticConfig)) {
			return staticConfig;
		}
	}

	if (fs.existsSync(DEV_PUBLIC_CONFIG)) {
		return DEV_PUBLIC_CONFIG;
	}

	return undefined;
}

export function loadAppConfigFromFile(
	configPath: string | undefined,
): AppConfig {
	if (!configPath) {
		return {
			shiki: { ...DEFAULT_APP_CONFIG.shiki },
			reactions: { emojis: [...DEFAULT_APP_CONFIG.reactions.emojis] },
		};
	}

	try {
		const text = fs.readFileSync(configPath, "utf8");
		return parseAppConfigText(text);
	} catch {
		return {
			shiki: { ...DEFAULT_APP_CONFIG.shiki },
			reactions: { emojis: [...DEFAULT_APP_CONFIG.reactions.emojis] },
		};
	}
}

export function loadAppConfigForServer(options: {
	staticDir?: string;
}): AppConfig {
	const configPath = resolveAppConfigPath(options);
	return loadAppConfigFromFile(configPath);
}
