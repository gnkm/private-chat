export const DEFAULT_LISTEN_PORT = 3000;

export function parseListenPort(
	raw: string | undefined,
	defaultPort = DEFAULT_LISTEN_PORT,
): number {
	if (raw === undefined || raw === "") {
		return defaultPort;
	}
	const port = Number(raw);
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error(`Invalid PORT value: "${raw}"`);
	}
	return port;
}
