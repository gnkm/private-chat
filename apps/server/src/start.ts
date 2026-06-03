import path from "node:path";
import { fileURLToPath } from "node:url";

import { createChatServer } from "./chat-server.js";
import { parseListenPort } from "./parse-port.js";
import { resolveStaticDirForStart } from "./resolve-static-dir.js";

const defaultStaticDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../web/dist",
);
const staticDir = resolveStaticDirForStart(
	process.env.STATIC_DIR ?? defaultStaticDir,
);

let port: number;
try {
	port = parseListenPort(process.env.PORT);
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}

const chat = createChatServer(staticDir ? { staticDir } : {});

chat.httpServer.listen(port, () => {
	const mode = staticDir ? `static=${staticDir}` : "api-only";
	console.log(
		`Private Chat server listening on http://127.0.0.1:${port} (${mode})`,
	);
});
