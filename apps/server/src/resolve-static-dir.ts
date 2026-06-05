import fs from "node:fs";
import path from "node:path";

/** `start.ts` 用: index.html が存在する静的ディレクトリのみ返す */
export function resolveStaticDirPath(dir: string): string | undefined {
	const absolute = path.resolve(dir);
	const indexPath = path.join(absolute, "index.html");
	return fs.existsSync(indexPath) ? absolute : undefined;
}

export type ResolveStaticDirForStartOptions = {
	envStaticDir?: string;
	defaultStaticDir: string;
	nodeEnv?: string;
};

export function resolveStaticDirForStart(
	options: ResolveStaticDirForStartOptions,
): string | undefined;
export function resolveStaticDirForStart(dir: string): string | undefined;
export function resolveStaticDirForStart(
	input: ResolveStaticDirForStartOptions | string,
): string | undefined {
	if (typeof input === "string") {
		return resolveStaticDirPath(input);
	}

	const candidate =
		input.envStaticDir ??
		(input.nodeEnv === "production" ? input.defaultStaticDir : undefined);
	return candidate ? resolveStaticDirPath(candidate) : undefined;
}
