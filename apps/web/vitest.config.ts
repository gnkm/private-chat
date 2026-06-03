import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const repoRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../..",
);

export default defineConfig({
	plugins: [react()],
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
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		execArgv: ["--no-webstorage"],
		// GHA: 既定の fork 大量並列は OOM/EPIPE になる。threads で並列数を抑える
		...(process.env.CI
			? { pool: "threads", maxWorkers: 4, fileParallelism: true }
			: {}),
	},
});
