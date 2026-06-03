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
		// GHA: 複数 fork + jsdom は OOM で Worker exited になる。Vitest 4 では singleFork → maxWorkers: 1
		// threads は execArgv（--no-webstorage）非対応（ERR_WORKER_INVALID_EXEC_ARGV）
		...(process.env.CI ? { pool: "forks", maxWorkers: 1 } : {}),
	},
});
