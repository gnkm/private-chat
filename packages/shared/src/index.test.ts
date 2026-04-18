import { describe, expect, it } from "vitest";

import { PACKAGE_LABEL } from "./index.js";

describe("@private-chat/shared", () => {
	it("exports a package label", () => {
		expect(PACKAGE_LABEL).toBe("@private-chat/shared");
	});
});
