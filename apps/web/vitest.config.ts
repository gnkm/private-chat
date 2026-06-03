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
		// localStorage は setup.ts で差し替えるため --no-webstorage は不要。
		// execArgv を外すことで軽量な threads プールが使える（forks は GHA で OOM/ハングした）。
		pool: "threads",
		// 万一ハングしても 18 分待たず即失敗させる安全網。
		testTimeout: 15_000,
		hookTimeout: 15_000,
		teardownTimeout: 10_000,
		// GHA ランナーは 2 コア。スレッド数を絞ってメモリ競合を防ぐ。
		...(process.env.CI ? { maxWorkers: 2 } : {}),
	},
});
