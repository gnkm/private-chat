import type { ServerBroadcastPost } from "@private-chat/shared";

import { formatSentAt } from "../lib/format-sent-at.js";

export const POST_LIST_EMPTY_HEADING = "ここにメッセージが表示されます";
export const POST_LIST_EMPTY_DESCRIPTION =
	"送信した内容や、接続中に届いた投稿がここに並びます。再読み込み後は過去の投稿は表示されません。";

type PostListProps = {
	posts: ServerBroadcastPost[];
};

export function PostList({ posts }: PostListProps) {
	return (
		<section
			className="flex flex-1 flex-col overflow-y-auto p-4"
			aria-label="投稿一覧"
		>
			{posts.length === 0 ? (
				<div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
					<p className="text-sm text-slate-600">{POST_LIST_EMPTY_HEADING}</p>
					<p className="mt-2 max-w-md text-xs text-slate-500">
						{POST_LIST_EMPTY_DESCRIPTION}
					</p>
				</div>
			) : (
				<ul className="flex flex-col gap-3">
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
			)}
		</section>
	);
}
