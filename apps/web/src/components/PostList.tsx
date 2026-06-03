import type { ServerBroadcastPost } from "@private-chat/shared";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { formatSentAt } from "../lib/format-sent-at.js";
import {
	isNearScrollBottom,
	scrollElementToBottom,
} from "../lib/post-list-scroll.js";

export const POST_LIST_EMPTY_HEADING = "ここにメッセージが表示されます";
export const POST_LIST_EMPTY_DESCRIPTION =
	"送信した内容や、接続中に届いた投稿がここに並びます。再読み込み後は過去の投稿は表示されません。";
export const JUMP_TO_LATEST_LABEL = "新着へ";

type PostListProps = {
	posts: ServerBroadcastPost[];
};

export function PostList({ posts }: PostListProps) {
	const scrollRef = useRef<HTMLElement>(null);
	const stickToBottomRef = useRef(true);
	const [showJumpToLatest, setShowJumpToLatest] = useState(false);
	const syncJumpButton = useCallback(() => {
		const element = scrollRef.current;
		if (!element || posts.length === 0) {
			stickToBottomRef.current = true;
			setShowJumpToLatest(false);
			return;
		}

		const nearBottom = isNearScrollBottom(
			element.scrollTop,
			element.scrollHeight,
			element.clientHeight,
		);
		stickToBottomRef.current = nearBottom;
		setShowJumpToLatest(!nearBottom);
	}, [posts.length]);

	const scrollToBottom = useCallback(() => {
		const element = scrollRef.current;
		if (!element) {
			return;
		}
		scrollElementToBottom(element);
		stickToBottomRef.current = true;
		setShowJumpToLatest(false);
	}, []);

	useLayoutEffect(() => {
		if (posts.length === 0) {
			return;
		}

		const element = scrollRef.current;
		if (!element) {
			return;
		}

		if (stickToBottomRef.current) {
			scrollElementToBottom(element);
			setShowJumpToLatest(false);
		} else {
			setShowJumpToLatest(true);
		}
	}, [posts]);

	return (
		<div className="relative flex min-h-0 flex-1 flex-col">
			<section
				ref={scrollRef}
				className="flex flex-1 flex-col overflow-y-auto p-4"
				aria-label="投稿一覧"
				onScroll={syncJumpButton}
			>
				{posts.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
						<p className="text-sm text-stone-600 dark:text-stone-400">
							{POST_LIST_EMPTY_HEADING}
						</p>
						<p className="mt-2 max-w-md text-xs text-stone-500 dark:text-stone-400">
							{POST_LIST_EMPTY_DESCRIPTION}
						</p>
					</div>
				) : (
					<ul className="flex flex-col gap-3">
						{posts.map((post) => (
							<li
								key={post.id}
								className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900"
							>
								<div className="flex items-baseline justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
									<span className="font-semibold text-stone-800 dark:text-stone-200">
										{post.displayName}
									</span>
									<time dateTime={post.sentAt}>
										{formatSentAt(post.sentAt)}
									</time>
								</div>
								<p className="mt-1 whitespace-pre-wrap text-sm text-stone-900 dark:text-stone-100">
									{post.body}
								</p>
							</li>
						))}
					</ul>
				)}
			</section>
			{showJumpToLatest ? (
				<button
					type="button"
					className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-md hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
					onClick={scrollToBottom}
				>
					{JUMP_TO_LATEST_LABEL}
				</button>
			) : null}
		</div>
	);
}
