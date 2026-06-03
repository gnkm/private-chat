import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const repoRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../..",
);

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, import.meta.dirname, "");
	const apiTarget = env.VITE_DEV_API_TARGET || "http://127.0.0.1:3000";

	return {
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@private-chat/shared": path.join(
					repoRoot,
					"packages/shared/src/index.ts",
				),
			},
		},
		server: {
			port: 5173,
			proxy: {
				"/ws": {
					target: apiTarget,
					ws: true,
				},
				"/health": {
					target: apiTarget,
				},
			},
		},
	};
});
