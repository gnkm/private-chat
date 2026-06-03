import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ServerBroadcastPost } from "@private-chat/shared";
import {
	POST_LIST_EMPTY_DESCRIPTION,
	POST_LIST_EMPTY_HEADING,
	PostList,
} from "./PostList.js";

vi.mock("../lib/shiki-highlighter.js", () => ({
	highlightCode: vi.fn(
		async (code: string) => `<pre class="shiki">${code}</pre>`,
	),
}));

const samplePost: ServerBroadcastPost = {
	id: "1",
	displayName: "Alice",
	body: "hello",
	sentAt: "2026-04-18T12:00:00.000Z",
};

const secondPost: ServerBroadcastPost = {
	id: "2",
	displayName: "Bob",
	body: "world",
	sentAt: "2026-04-18T12:01:00.000Z",
};

function mockScrollContainer(
	element: HTMLElement,
	metrics: { scrollHeight: number; clientHeight: number; scrollTop: number },
): void {
	Object.defineProperty(element, "scrollHeight", {
		value: metrics.scrollHeight,
		configurable: true,
	});
	Object.defineProperty(element, "clientHeight", {
		value: metrics.clientHeight,
		configurable: true,
	});
	element.scrollTop = metrics.scrollTop;
}

describe("PostList", () => {
	afterEach(() => {
		cleanup();
	});

	it("shows empty state when there are no posts", () => {
		render(<PostList posts={[]} />);

		expect(screen.getByLabelText("投稿一覧")).toBeInTheDocument();
		expect(screen.getByText(POST_LIST_EMPTY_HEADING)).toBeInTheDocument();
		expect(screen.getByText(POST_LIST_EMPTY_DESCRIPTION)).toBeInTheDocument();
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
	});

	it("hides empty state when posts exist", () => {
		render(<PostList posts={[samplePost]} />);

		expect(screen.queryByText(POST_LIST_EMPTY_HEADING)).not.toBeInTheDocument();
		expect(screen.getByRole("list")).toBeInTheDocument();
		expect(screen.getByText("hello")).toBeInTheDocument();
	});

	it("renders fenced code blocks inside post bubbles", async () => {
		render(
			<PostList
				posts={[
					{
						...samplePost,
						body: "```javascript\nconst x = 1\n```",
					},
				]}
			/>,
		);

		expect(screen.getByText("const x = 1")).toBeInTheDocument();
		await waitFor(() => {
			expect(
				document.querySelector(".post-code-block .shiki"),
			).toBeInTheDocument();
		});
	});

	it("shows display name and sent date outside the bubble body", () => {
		render(<PostList posts={[samplePost, secondPost]} />);

		const bodies = document.querySelectorAll(".post-bubble-body");
		for (const body of bodies) {
			const element = body as HTMLElement;
			expect(within(element).queryByText(/Alice|Bob/)).toBeNull();
			expect(within(element).queryByRole("time")).toBeNull();
		}
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
		expect(screen.getAllByRole("time")).toHaveLength(2);
	});

	it("aligns own posts to the right and others to the left", () => {
		render(
			<PostList posts={[samplePost, secondPost]} currentDisplayName="Alice" />,
		);

		const items = screen.getAllByRole("listitem");
		expect(items[0]).toHaveClass("justify-end");
		expect(items[1]).toHaveClass("justify-start");
	});

	it("renders rounded body with a horizontal tail on the outer side", () => {
		const { container } = render(
			<PostList posts={[samplePost, secondPost]} currentDisplayName="Alice" />,
		);

		expect(container.querySelector(".post-bubble-body")).toHaveClass(
			"rounded-2xl",
		);
		expect(
			container.querySelector(".post-bubble-tail--own"),
		).toBeInTheDocument();
		expect(
			container.querySelector(".post-bubble-tail--other"),
		).toBeInTheDocument();
	});

	it("renders reaction controls for each post", () => {
		render(
			<PostList
				posts={[samplePost]}
				reactionsByPostId={{
					"1": [{ emoji: "🙏", count: 3 }],
				}}
				myReactionsByPostId={{ "1": new Set(["🙏"]) }}
				onToggleReaction={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("group", { name: "リアクション" }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "🙏 3" })).toBeInTheDocument();
	});

	it("aligns all posts to the left when display name is blank", () => {
		render(<PostList posts={[samplePost, secondPost]} currentDisplayName="" />);

		for (const item of screen.getAllByRole("listitem")) {
			expect(item).toHaveClass("justify-start");
		}
	});

	it("scrolls to bottom when near bottom and a new post is added", async () => {
		const { rerender } = render(<PostList posts={[samplePost]} />);
		const section = screen.getByLabelText("投稿一覧");
		mockScrollContainer(section, {
			scrollHeight: 1000,
			clientHeight: 100,
			scrollTop: 900,
		});
		fireEvent.scroll(section);

		rerender(<PostList posts={[samplePost, secondPost]} />);

		await waitFor(() => {
			expect(section.scrollTop).toBe(1000);
		});
		expect(
			screen.queryByRole("button", { name: "新着へ" }),
		).not.toBeInTheDocument();
	});

	it("shows 新着へ when scrolled up and a new post arrives", async () => {
		const { rerender } = render(<PostList posts={[samplePost]} />);
		const section = screen.getByLabelText("投稿一覧");
		mockScrollContainer(section, {
			scrollHeight: 1000,
			clientHeight: 100,
			scrollTop: 0,
		});
		fireEvent.scroll(section);

		rerender(<PostList posts={[samplePost, secondPost]} />);

		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: "新着へ" }),
			).toBeInTheDocument();
		});
	});

	it("scrolls to bottom and hides 新着へ when the button is clicked", async () => {
		const user = userEvent.setup();
		const { rerender } = render(<PostList posts={[samplePost]} />);
		const section = screen.getByLabelText("投稿一覧");
		mockScrollContainer(section, {
			scrollHeight: 1000,
			clientHeight: 100,
			scrollTop: 0,
		});
		fireEvent.scroll(section);

		rerender(<PostList posts={[samplePost, secondPost]} />);
		await screen.findByRole("button", { name: "新着へ" });

		await user.click(screen.getByRole("button", { name: "新着へ" }));

		expect(section.scrollTop).toBe(1000);
		expect(
			screen.queryByRole("button", { name: "新着へ" }),
		).not.toBeInTheDocument();
	});
});
