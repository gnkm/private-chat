import { describe, expect, it } from "vitest";

import { serverLabel } from "./index.js";

describe("@private-chat/server", () => {
	it("includes shared label", () => {
		expect(serverLabel()).toBe("server:@private-chat/shared");
	});
});
