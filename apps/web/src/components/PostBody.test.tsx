import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PostBody } from "./PostBody.js";

vi.mock("../lib/shiki-highlighter.js", () => ({
	highlightCode: vi.fn(async (code: string, language: string | null) => {
		const lang = language ?? "text";
		return `<pre class="shiki" data-lang="${lang}"><code>${code}</code></pre>`;
	}),
}));

describe("PostBody", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders plain text with preserved line breaks", () => {
		render(<PostBody body={"line one\nline two"} />);

		const paragraph = screen.getByText(/line one/);
		expect(paragraph).toHaveClass("whitespace-pre-wrap");
		expect(paragraph.textContent).toContain("line one");
		expect(paragraph.textContent).toContain("line two");
	});

	it("shows fallback code while highlighting loads", () => {
		render(<PostBody body={"```javascript\nconst x = 1\n```"} />);

		expect(screen.getByText("const x = 1")).toBeInTheDocument();
	});

	it("renders Shiki HTML after highlighting", async () => {
		render(<PostBody body={"```javascript\nconst x = 1\n```"} />);

		await waitFor(() => {
			expect(
				document.querySelector(".post-code-block .shiki"),
			).toBeInTheDocument();
		});
		expect(document.querySelector(".post-code-block .shiki")).toHaveAttribute(
			"data-lang",
			"javascript",
		);
	});

	it("renders text and code segments in order", async () => {
		render(<PostBody body={"before\n```\ncode\n```\nafter"} />);

		expect(screen.getByText(/before/)).toBeInTheDocument();
		expect(screen.getByText("code")).toBeInTheDocument();
		await waitFor(() => {
			expect(screen.getByText(/after/)).toBeInTheDocument();
		});
	});
});
