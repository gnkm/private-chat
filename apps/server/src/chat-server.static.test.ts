import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createChatServer } from "./chat-server.js";

async function listen(
	server: ReturnType<typeof createChatServer>["httpServer"],
): Promise<{ baseUrl: string }> {
	await new Promise<void>((resolve, reject) => {
		server.listen(0, () => resolve());
		server.once("error", reject);
	});
	const addr = server.address();
	if (!addr || typeof addr === "string") {
		throw new Error("expected numeric listen address");
	}
	return { baseUrl: `http://127.0.0.1:${addr.port}` };
}

describe("createChatServer static (フェーズ4)", () => {
	let tmpDir: string;
	let chat: ReturnType<typeof createChatServer>;
	let baseUrl: string;

	beforeEach(async () => {
		tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "private-chat-static-"));
		await fs.writeFile(
			path.join(tmpDir, "index.html"),
			"<!DOCTYPE html><html><body>spa-root</body></html>",
		);
		await fs.writeFile(
			path.join(tmpDir, "app.js"),
			"console.log('static-asset');",
		);
		chat = createChatServer({ staticDir: tmpDir });
		({ baseUrl } = await listen(chat.httpServer));
	});

	afterEach(async () => {
		await chat.close();
		await fs.rm(tmpDir, { recursive: true, force: true });
	});

	it("GET / は index.html を返す", async () => {
		const res = await fetch(`${baseUrl}/`);
		expect(res.status).toBe(200);
		expect(await res.text()).toContain("spa-root");
	});

	it("静的アセットを配信する", async () => {
		const res = await fetch(`${baseUrl}/app.js`);
		expect(res.status).toBe(200);
		expect(await res.text()).toContain("static-asset");
	});

	it("未知パスは SPA フォールバックで index.html を返す", async () => {
		const res = await fetch(`${baseUrl}/rooms/general`);
		expect(res.status).toBe(200);
		expect(await res.text()).toContain("spa-root");
	});

	it("GET /health は静的配信より優先される", async () => {
		const res = await fetch(`${baseUrl}/health`);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});
});
