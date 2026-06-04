import { parse } from "jsonc-parser";
import { z } from "zod";

import {
	DEFAULT_REACTION_EMOJIS,
	normalizeReactionEmojis,
} from "./reaction-config.js";

export const DEFAULT_APP_CONFIG = {
	shiki: {
		light: "github-light",
		dark: "github-dark",
	},
	reactions: {
		emojis: [...DEFAULT_REACTION_EMOJIS],
	},
} as const;

const appConfigInputSchema = z
	.object({
		shiki: z
			.object({
				light: z.string().min(1),
				dark: z.string().min(1),
			})
			.strict()
			.optional(),
		reactions: z
			.object({
				emojis: z.array(z.string()).optional(),
			})
			.strict()
			.optional(),
	})
	.strict();

export type AppConfig = {
	shiki: {
		light: string;
		dark: string;
	};
	reactions: {
		emojis: readonly string[];
	};
};

export function parseAppConfig(input: unknown): AppConfig {
	const parsed = appConfigInputSchema.safeParse(input);
	const raw = parsed.success ? parsed.data : {};

	return {
		shiki: {
			light: raw.shiki?.light ?? DEFAULT_APP_CONFIG.shiki.light,
			dark: raw.shiki?.dark ?? DEFAULT_APP_CONFIG.shiki.dark,
		},
		reactions: {
			emojis: normalizeReactionEmojis(
				raw.reactions?.emojis ?? DEFAULT_APP_CONFIG.reactions.emojis,
			),
		},
	};
}

export function parseAppConfigText(text: string): AppConfig {
	const parsed: unknown = parse(text);
	return parseAppConfig(parsed);
}
