import {
	DEFAULT_REACTION_EMOJIS,
	type ReactionCount,
	type ReactionEmoji,
} from "@private-chat/shared";

import { countForEmoji } from "../lib/reactions.js";

type PostReactionsProps = {
	postId: string;
	reactionEmojis?: readonly string[];
	reactions: ReactionCount[] | undefined;
	myReactions: ReadonlySet<ReactionEmoji>;
	ownPost: boolean;
	onToggle: (postId: string, emoji: ReactionEmoji) => void;
};

function reactionButtonLabel(emoji: ReactionEmoji, count: number): string {
	if (count > 0) {
		return `${emoji} ${count}`;
	}
	return emoji;
}

export function PostReactions({
	postId,
	reactionEmojis = DEFAULT_REACTION_EMOJIS,
	reactions,
	myReactions,
	ownPost,
	onToggle,
}: PostReactionsProps) {
	return (
		<fieldset
			className={`mt-1 flex flex-wrap gap-1 border-0 p-0 ${ownPost ? "justify-end" : "justify-start"}`}
			aria-label="リアクション"
		>
			{reactionEmojis.map((emoji) => {
				const count = countForEmoji(reactions, emoji);
				const active = myReactions.has(emoji);
				return (
					<button
						key={emoji}
						type="button"
						className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition-colors ${
							active
								? "border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-600 dark:bg-sky-950 dark:text-sky-100"
								: "border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
						}`}
						aria-pressed={active}
						aria-label={reactionButtonLabel(emoji, count)}
						onClick={() => onToggle(postId, emoji)}
					>
						<span aria-hidden>{emoji}</span>
						{count > 0 ? (
							<span className="text-xs font-medium tabular-nums">{count}</span>
						) : null}
					</button>
				);
			})}
		</fieldset>
	);
}
