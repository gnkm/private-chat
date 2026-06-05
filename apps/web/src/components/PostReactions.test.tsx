import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PostReactions } from "./PostReactions.js";

describe("PostReactions", () => {
	afterEach(() => {
		cleanup();
	});

	it("初期はリアクション追加ボタンのみ表示し、絵文字チップは出さない", () => {
		render(
			<PostReactions
				postId="p1"
				reactions={[]}
				myReactions={new Set()}
				ownPost={false}
				onToggle={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "リアクションを追加" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "👍" }),
		).not.toBeInTheDocument();
	});

	it("リアクションがついた絵文字はチップとして表示する", () => {
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

	it("チップをクリックすると onToggle を呼ぶ", async () => {
		const user = userEvent.setup();
		const onToggle = vi.fn();
		render(
			<PostReactions
				postId="p1"
				reactions={[{ emoji: "👍", count: 1 }]}
				myReactions={new Set(["👍"])}
				ownPost={false}
				onToggle={onToggle}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "👍 1" }));
		expect(onToggle).toHaveBeenCalledWith("p1", "👍");
	});

	it("追加ボタンでピッカーを開き全絵文字を表示する", async () => {
		const user = userEvent.setup();
		render(
			<PostReactions
				postId="p1"
				reactions={[]}
				myReactions={new Set()}
				ownPost={false}
				onToggle={vi.fn()}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "リアクションを追加" }),
		);

		const picker = screen.getByRole("group", { name: "リアクションを選択" });
		expect(
			within(picker).getByRole("button", { name: "👍" }),
		).toBeInTheDocument();
		expect(
			within(picker).getByRole("button", { name: "✨" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "リアクションを追加" }),
		).toHaveAttribute("aria-expanded", "true");
	});

	it("ピッカーで絵文字を選ぶと onToggle を呼び閉じる", async () => {
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

		await user.click(
			screen.getByRole("button", { name: "リアクションを追加" }),
		);
		const picker = screen.getByRole("group", { name: "リアクションを選択" });
		await user.click(within(picker).getByRole("button", { name: "👀" }));

		expect(onToggle).toHaveBeenCalledWith("p1", "👀");
		expect(
			screen.queryByRole("group", { name: "リアクションを選択" }),
		).not.toBeInTheDocument();
	});

	it("ピッカー外クリックで閉じる", async () => {
		const user = userEvent.setup();
		render(
			<div>
				<button type="button">外側</button>
				<PostReactions
					postId="p1"
					reactions={[]}
					myReactions={new Set()}
					ownPost={false}
					onToggle={vi.fn()}
				/>
			</div>,
		);

		await user.click(
			screen.getByRole("button", { name: "リアクションを追加" }),
		);
		await user.click(screen.getByRole("button", { name: "外側" }));

		expect(
			screen.queryByRole("group", { name: "リアクションを選択" }),
		).not.toBeInTheDocument();
	});
});
