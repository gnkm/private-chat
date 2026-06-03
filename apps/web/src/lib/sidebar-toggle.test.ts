import { describe, expect, it } from "vitest";

import { getSidebarToggleLabel } from "./sidebar-toggle.js";

describe("getSidebarToggleLabel", () => {
	it("returns open label when sidebar is closed", () => {
		expect(getSidebarToggleLabel(false)).toBe("サイドバーを開く");
	});

	it("returns close label when sidebar is open", () => {
		expect(getSidebarToggleLabel(true)).toBe("サイドバーを閉じる");
	});
});
