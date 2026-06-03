import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PostReactions } from "./PostReactions.js";

describe("PostReactions", () => {
	afterEach(() => {
		cleanup();
	});

	it("shows reaction counts when present", () => {
		render(
			<PostReactions
				postId="p1"
				reactions={[
					{ emoji: "👍", count: 2 },
					{ emoji: "✨", count: 1 },
				]}
				myReactions={new Set(["👍"])}
				ownPost={false}
				onToggle={vi.fn()}
			/>,
		);

		expect(screen.getByRole("button", { name: "👍 2" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		expect(screen.getByRole("button", { name: "✨ 1" })).toHaveAttribute(
			"aria-pressed",
			"false",
		);
	});

	it("calls onToggle with post id and emoji", async () => {
		const user = userEvent.setup();
		const onToggle = vi.fn();
		render(
			<PostReactions
				postId="p1"
				reactions={[]}
				myReactions={new Set()}
				ownPost
				onToggle={onToggle}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "👀" }));
		expect(onToggle).toHaveBeenCalledWith("p1", "👀");
	});
});
