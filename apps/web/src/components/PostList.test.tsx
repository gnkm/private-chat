import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import type { ServerBroadcastPost } from "@private-chat/shared";
import {
	POST_LIST_EMPTY_DESCRIPTION,
	POST_LIST_EMPTY_HEADING,
	PostList,
} from "./PostList.js";

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
