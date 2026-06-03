export type PostBodyTextSegment = {
	type: "text";
	content: string;
	key: string;
};

export type PostBodyCodeSegment = {
	type: "code";
	language: string | null;
	content: string;
	key: string;
};

export type PostBodySegment = PostBodyTextSegment | PostBodyCodeSegment;

// 閉じフェンスは行全体が ``` のみの行に限定する（CommonMark に近い）。
// コード行内の ``` は含められる。行単独の ``` 行は閉じと誤認する（既知の制限）。
const FENCED_CODE_BLOCK = /```([^\n`]*)\n([\s\S]*?)\n```[ \t]*(?:\n|$)/g;

export function parsePostBody(body: string): PostBodySegment[] {
	if (!body.includes("```")) {
		return [{ type: "text", content: body, key: "text-0" }];
	}

	const segments: PostBodySegment[] = [];
	let lastIndex = 0;

	for (const match of body.matchAll(FENCED_CODE_BLOCK)) {
		const fullMatch = match[0];
		const rawLanguage = match[1] ?? "";
		const codeContent = match[2] ?? "";
		const matchIndex = match.index ?? 0;

		if (matchIndex > lastIndex) {
			segments.push({
				type: "text",
				content: body.slice(lastIndex, matchIndex),
				key: `text-${lastIndex}`,
			});
		}

		const language = rawLanguage.trim() === "" ? null : rawLanguage.trim();
		segments.push({
			type: "code",
			language,
			content: codeContent,
			key: `code-${matchIndex}`,
		});

		lastIndex = matchIndex + fullMatch.length;
	}

	if (lastIndex < body.length) {
		segments.push({
			type: "text",
			content: body.slice(lastIndex),
			key: `text-${lastIndex}`,
		});
	}

	if (segments.length === 0) {
		return [{ type: "text", content: body, key: "text-0" }];
	}

	return segments;
}
