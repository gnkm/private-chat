import { cleanup, render, screen } from "@testing-library/react";
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
});
