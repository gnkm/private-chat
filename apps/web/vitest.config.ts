import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const repoRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../..",
);

export default defineConfig({
	resolve: {
		alias: {
			"@private-chat/shared": path.join(
				repoRoot,
				"packages/shared/src/index.ts",
			),
		},
	},
	test: {
		name: "web",
		include: ["src/**/*.test.ts"],
	},
});
