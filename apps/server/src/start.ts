import path from "node:path";
import { fileURLToPath } from "node:url";

import { createChatServer } from "./chat-server.js";
import { loadAppConfigForServer } from "./load-app-config.js";
import { parseListenPort } from "./parse-port.js";
import { resolveStaticDirForStart } from "./resolve-static-dir.js";

const defaultStaticDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../web/dist",
);
const staticDir = resolveStaticDirForStart({
	defaultStaticDir,
	envStaticDir: process.env.STATIC_DIR,
	nodeEnv: process.env.NODE_ENV,
});

let port: number;
try {
	port = parseListenPort(process.env.PORT);
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}

/** 閉じた LAN 向け: 全インターフェースで待ち受け（省略時と同じ実態を明示） */
const LISTEN_HOST = "0.0.0.0";

const appConfig = loadAppConfigForServer(staticDir ? { staticDir } : {});
const chat = createChatServer({
	...(staticDir ? { staticDir } : {}),
	reactionEmojis: appConfig.reactions.emojis,
});

chat.httpServer.listen(port, LISTEN_HOST, () => {
	const mode = staticDir ? `static=${staticDir}` : "api-only";
	console.log(
		`Private Chat server listening on http://${LISTEN_HOST}:${port} (${mode})`,
	);
});
