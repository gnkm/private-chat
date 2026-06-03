/** 同一オリジン（本番または `pnpm dev` の Vite プロキシ）では location から /ws を組み立てる */
export function resolveWebSocketUrl(): string {
	const fromEnv = import.meta.env.VITE_WS_URL;
	if (typeof fromEnv === "string" && fromEnv.length > 0) {
		return fromEnv;
	}
	const protocol = globalThis.location.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${globalThis.location.host}/ws`;
}
