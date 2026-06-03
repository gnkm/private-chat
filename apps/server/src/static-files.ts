import fs from "node:fs";
import path from "node:path";

import type { Express } from "express";
import express from "express";

/** 本番用 SPA の静的配信とクライアントルーティング用フォールバック */
export function mountStaticSpa(app: Express, staticDir: string): void {
	const absoluteDir = path.resolve(staticDir);
	const indexPath = path.join(absoluteDir, "index.html");

	if (!fs.existsSync(indexPath)) {
		throw new Error(`static index not found: ${indexPath}`);
	}

	app.use(express.static(absoluteDir, { index: false }));

	app.get("*", (_req, res) => {
		res.sendFile(indexPath);
	});
}
