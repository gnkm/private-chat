import {
	DEFAULT_REACTION_EMOJIS,
	type ReactionCount,
	type ReactionEmoji,
} from "@private-chat/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { countForEmoji } from "../lib/reactions.js";

type PostReactionsProps = {
	postId: string;
	reactionEmojis?: readonly string[];
	reactions: ReactionCount[] | undefined;
	myReactions: ReadonlySet<ReactionEmoji>;
	ownPost: boolean;
	onToggle: (postId: string, emoji: ReactionEmoji) => void;
};

const ADD_REACTION_LABEL = "リアクションを追加";
const REACTION_PICKER_LABEL = "リアクションを選択";

/** リアクション絵文字を想起させるスマイリー + プラスのアイコン */
function AddReactionIcon() {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4"
		>
			<path d="M22 11v1a10 10 0 1 1-9-10" />
			<path d="M8 14s1.5 2 4 2 4-2 4-2" />
			<line x1="9" x2="9.01" y1="9" y2="9" />
			<line x1="15" x2="15.01" y1="9" y2="9" />
			<path d="M16 5h6" />
			<path d="M19 2v6" />
		</svg>
	);
}

const reactionButtonClass = (active: boolean) =>
	`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition-colors ${
		active
			? "border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-600 dark:bg-sky-950 dark:text-sky-100"
			: "border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
	}`;

function reactionButtonLabel(emoji: ReactionEmoji, count: number): string {
	if (count > 0) {
		return `${emoji} ${count}`;
	}
	return emoji;
}

type ReactionButtonProps = {
	postId: string;
	emoji: ReactionEmoji;
	count: number;
	active: boolean;
	onToggle: PostReactionsProps["onToggle"];
	onActivated?: () => void;
	className?: string;
};

function ReactionButton({
	postId,
	emoji,
	count,
	active,
	onToggle,
	onActivated,
	className,
}: ReactionButtonProps) {
	return (
		<button
			type="button"
			className={`${reactionButtonClass(active)}${className ? ` ${className}` : ""}`}
			aria-pressed={active}
			aria-label={reactionButtonLabel(emoji, count)}
			onClick={() => {
				onToggle(postId, emoji);
				onActivated?.();
			}}
		>
			<span aria-hidden>{emoji}</span>
			{count > 0 ? (
				<span className="text-xs font-medium tabular-nums">{count}</span>
			) : null}
		</button>
	);
}

type PickerPosition = {
	left: number;
	top: number;
};

export function PostReactions({
	postId,
	reactionEmojis = DEFAULT_REACTION_EMOJIS,
	reactions,
	myReactions,
	ownPost,
	onToggle,
}: PostReactionsProps) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const [pickerPosition, setPickerPosition] = useState<PickerPosition | null>(
		null,
	);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const popoverRef = useRef<HTMLFieldSetElement>(null);

	const activeEmojis = reactionEmojis.filter(
		(emoji) => countForEmoji(reactions, emoji) > 0,
	);

	const closePicker = useCallback(() => {
		setPickerOpen(false);
	}, []);

	const openPicker = useCallback(() => {
		const rect = triggerRef.current?.getBoundingClientRect();
		if (rect) {
			setPickerPosition({
				left: ownPost ? rect.right : rect.left,
				top: rect.top,
			});
		}
		setPickerOpen(true);
	}, [ownPost]);

	useEffect(() => {
		if (!pickerOpen) {
			return;
		}

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (
				popoverRef.current?.contains(target) ||
				triggerRef.current?.contains(target)
			) {
				return;
			}
			setPickerOpen(false);
		};

		const handleReposition = () => {
			setPickerOpen(false);
		};

		document.addEventListener("pointerdown", handlePointerDown);
		window.addEventListener("scroll", handleReposition, true);
		window.addEventListener("resize", handleReposition);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			window.removeEventListener("scroll", handleReposition, true);
			window.removeEventListener("resize", handleReposition);
		};
	}, [pickerOpen]);

	return (
		<fieldset
			className={`mt-1 flex flex-wrap gap-1 border-0 p-0 ${ownPost ? "justify-end" : "justify-start"}`}
			aria-label="リアクション"
		>
			{activeEmojis.map((emoji) => (
				<ReactionButton
					key={emoji}
					postId={postId}
					emoji={emoji}
					count={countForEmoji(reactions, emoji)}
					active={myReactions.has(emoji)}
					onToggle={onToggle}
				/>
			))}
			<button
				ref={triggerRef}
				type="button"
				className={reactionButtonClass(false)}
				aria-label={ADD_REACTION_LABEL}
				aria-expanded={pickerOpen}
				onClick={() => (pickerOpen ? closePicker() : openPicker())}
			>
				<AddReactionIcon />
			</button>
			{pickerOpen
				? createPortal(
						<fieldset
							ref={popoverRef}
							className="fixed z-50 grid w-64 max-h-64 grid-cols-5 gap-1 overflow-y-auto rounded-xl border border-stone-200 bg-white p-2 shadow-lg dark:border-stone-700 dark:bg-stone-800"
							style={{
								left: pickerPosition?.left ?? 0,
								top: pickerPosition?.top ?? 0,
								transform: ownPost
									? "translate(-100%, calc(-100% - 8px))"
									: "translateY(calc(-100% - 8px))",
							}}
						>
							<legend className="sr-only">{REACTION_PICKER_LABEL}</legend>
							{reactionEmojis.map((emoji) => (
								<ReactionButton
									key={emoji}
									postId={postId}
									emoji={emoji}
									count={0}
									active={myReactions.has(emoji)}
									onToggle={onToggle}
									onActivated={closePicker}
									className="w-full justify-center"
								/>
							))}
						</fieldset>,
						document.body,
					)
				: null}
		</fieldset>
	);
}
