import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resolveStaticDirForStart } from "./resolve-static-dir.js";

describe("resolveStaticDirForStart", () => {
	let tmpDir: string;

	beforeEach(async () => {
		tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "private-chat-resolve-"));
	});

	afterEach(async () => {
		await fs.rm(tmpDir, { recursive: true, force: true });
	});

	it("index.html があるディレクトリを返す", async () => {
		await fs.writeFile(path.join(tmpDir, "index.html"), "<html></html>");
		expect(resolveStaticDirForStart(tmpDir)).toBe(path.resolve(tmpDir));
	});

	it("index.html が無い場合は undefined", () => {
		expect(resolveStaticDirForStart(tmpDir)).toBeUndefined();
	});
});
