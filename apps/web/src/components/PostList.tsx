import type { ServerBroadcastPost } from "@private-chat/shared";

import { formatSentAt } from "../lib/format-sent-at.js";

type PostListProps = {
	posts: ServerBroadcastPost[];
};

export function PostList({ posts }: PostListProps) {
	return (
		<ul
			className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
			aria-label="投稿一覧"
		>
			{posts.map((post) => (
				<li
					key={post.id}
					className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
				>
					<div className="flex items-baseline justify-between gap-2 text-xs text-slate-500">
						<span className="font-semibold text-slate-800">
							{post.displayName}
						</span>
						<time dateTime={post.sentAt}>{formatSentAt(post.sentAt)}</time>
					</div>
					<p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
						{post.body}
					</p>
				</li>
			))}
		</ul>
	);
}
