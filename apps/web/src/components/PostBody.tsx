import { useEffect, useState } from "react";

import { parsePostBody } from "../lib/parse-post-body.js";
import { highlightCode } from "../lib/shiki-highlighter.js";

type PostBodyProps = {
	body: string;
};

type PostCodeBlockProps = {
	code: string;
	language: string | null;
};

function PostCodeBlock({ code, language }: PostCodeBlockProps) {
	const [html, setHtml] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		void highlightCode(code, language).then((highlighted) => {
			if (!cancelled) {
				setHtml(highlighted);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [code, language]);

	if (!html) {
		return (
			<pre className="post-code-block post-code-block--fallback">
				<code>{code}</code>
			</pre>
		);
	}

	return (
		<div
			className="post-code-block"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki が生成する静的 HTML を描画する
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}

export function PostBody({ body }: PostBodyProps) {
	const segments = parsePostBody(body);

	return (
		<div className="post-body text-sm text-stone-900 dark:text-stone-300">
			{segments.map((segment) => {
				if (segment.type === "text") {
					return (
						<p key={segment.key} className="whitespace-pre-wrap">
							{segment.content}
						</p>
					);
				}

				return (
					<PostCodeBlock
						key={segment.key}
						code={segment.content}
						language={segment.language}
					/>
				);
			})}
		</div>
	);
}
