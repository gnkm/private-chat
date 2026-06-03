import { describe, expect, it } from "vitest";

import { sortParticipantsByDisplayName } from "./sort-participants.js";

describe("sortParticipantsByDisplayName", () => {
	it("sorts by display name in Japanese locale order", () => {
		const sorted = sortParticipantsByDisplayName([
			{ id: "2", displayName: "Bob" },
			{ id: "1", displayName: "Alice" },
			{ id: "3", displayName: "Charlie" },
		]);
		expect(sorted.map((p) => p.displayName)).toEqual([
			"Alice",
			"Bob",
			"Charlie",
		]);
	});
});
