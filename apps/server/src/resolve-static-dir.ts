import fs from "node:fs";
import path from "node:path";

/** `start.ts` 用: index.html が存在する静的ディレクトリのみ返す */
export function resolveStaticDirForStart(dir: string): string | undefined {
	const absolute = path.resolve(dir);
	const indexPath = path.join(absolute, "index.html");
	return fs.existsSync(indexPath) ? absolute : undefined;
}
