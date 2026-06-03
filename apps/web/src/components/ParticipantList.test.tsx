import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ParticipantList } from "./ParticipantList.js";

describe("ParticipantList", () => {
	it("shows empty message when there are no participants", () => {
		render(<ParticipantList participants={[]} />);
		expect(screen.getByText("まだ参加者はいません")).toBeInTheDocument();
	});

	it("lists participants sorted by display name", () => {
		render(
			<ParticipantList
				participants={[
					{ id: "2", displayName: "Bob" },
					{ id: "1", displayName: "Alice" },
				]}
			/>,
		);
		const items = screen.getAllByRole("listitem");
		expect(items.map((el) => el.textContent)).toEqual(["Alice", "Bob"]);
	});
});
