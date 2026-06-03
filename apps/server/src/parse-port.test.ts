import { describe, expect, it } from "vitest";

import { DEFAULT_LISTEN_PORT, parseListenPort } from "./parse-port.js";

describe("parseListenPort", () => {
	it("未設定時は既定ポート", () => {
		expect(parseListenPort(undefined)).toBe(DEFAULT_LISTEN_PORT);
		expect(parseListenPort("")).toBe(DEFAULT_LISTEN_PORT);
	});

	it("有効なポート番号を返す", () => {
		expect(parseListenPort("8080")).toBe(8080);
	});

	it("数値以外や範囲外はエラー", () => {
		expect(() => parseListenPort("abc")).toThrow(/Invalid PORT/);
		expect(() => parseListenPort("0")).toThrow(/Invalid PORT/);
		expect(() => parseListenPort("70000")).toThrow(/Invalid PORT/);
	});
});
