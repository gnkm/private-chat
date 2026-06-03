import { describe, expect, it } from "vitest";

import { parsePostBody } from "./parse-post-body.js";

describe("parsePostBody", () => {
	it("returns a single text segment for plain text", () => {
		expect(parsePostBody("hello world")).toEqual([
			{ type: "text", content: "hello world", key: "text-0" },
		]);
	});

	it("parses a fenced code block with language", () => {
		expect(
			parsePostBody('before\n```javascript\nconsole.log("hi")\n```\nafter'),
		).toEqual([
			{ type: "text", content: "before\n", key: "text-0" },
			{
				type: "code",
				language: "javascript",
				content: 'console.log("hi")',
				key: "code-7",
			},
			{ type: "text", content: "after", key: "text-43" },
		]);
	});

	it("parses a fenced code block without language", () => {
		expect(parsePostBody("```\nplain code\n```")).toEqual([
			{
				type: "code",
				language: null,
				content: "plain code",
				key: "code-0",
			},
		]);
	});

	it("parses multiple code blocks", () => {
		expect(parsePostBody("```js\na\n```\nmid\n```py\nb\n```")).toEqual([
			{ type: "code", language: "js", content: "a", key: "code-0" },
			{ type: "text", content: "mid\n", key: "text-12" },
			{ type: "code", language: "py", content: "b", key: "code-16" },
		]);
	});

	it("treats unclosed fence as plain text", () => {
		expect(parsePostBody("```javascript\nnever closed")).toEqual([
			{
				type: "text",
				content: "```javascript\nnever closed",
				key: "text-0",
			},
		]);
	});

	it("preserves empty lines inside code blocks", () => {
		expect(parsePostBody("```\nline1\n\nline3\n```")).toEqual([
			{
				type: "code",
				language: null,
				content: "line1\n\nline3",
				key: "code-0",
			},
		]);
	});

	it("does not treat inline triple backticks as closing fence", () => {
		expect(parsePostBody("```\nsome ``` code\n```")).toEqual([
			{
				type: "code",
				language: null,
				content: "some ``` code",
				key: "code-0",
			},
		]);
	});
});
