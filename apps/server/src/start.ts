import path from "node:path";
import { fileURLToPath } from "node:url";

import { createChatServer } from "./chat-server.js";
import { resolveStaticDirForStart } from "./resolve-static-dir.js";

const DEFAULT_PORT = 3000;

const defaultStaticDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../web/dist",
);
const staticDir = resolveStaticDirForStart(
	process.env.STATIC_DIR ?? defaultStaticDir,
);

const port = Number(process.env.PORT ?? DEFAULT_PORT);
const chat = createChatServer(staticDir ? { staticDir } : {});

chat.httpServer.listen(port, () => {
	const mode = staticDir ? `static=${staticDir}` : "api-only";
	console.log(
		`Private Chat server listening on http://127.0.0.1:${port} (${mode})`,
	);
});
