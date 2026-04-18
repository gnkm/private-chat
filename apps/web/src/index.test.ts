import { describe, expect, it } from "vitest";

import { webLabel } from "./index.js";

describe("@private-chat/web", () => {
	it("includes shared label", () => {
		expect(webLabel()).toBe("web:@private-chat/shared");
	});
});
