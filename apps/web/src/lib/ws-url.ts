/** 開発時は `VITE_WS_URL` でサーバ直結（フェーズ4のプロキシ前でも手動結合可能） */
export function resolveWebSocketUrl(): string {
	const fromEnv = import.meta.env.VITE_WS_URL;
	if (typeof fromEnv === "string" && fromEnv.length > 0) {
		return fromEnv;
	}
	const protocol = globalThis.location.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${globalThis.location.host}/ws`;
}
