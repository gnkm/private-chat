import {
	MESSAGE_BODY_MAX_CODE_POINTS,
	countUnicodeCodePoints,
	truncateToMaxCodePoints,
} from "@private-chat/shared";

import { formatMessageBodyCounter } from "../lib/message-body-counter.js";
import {
	isMessageSendShortcut,
	messageSendShortcutLabel,
} from "../lib/message-send-shortcut.js";

const MESSAGE_PLACEHOLDER = "メッセージを入力…";
const MESSAGE_BODY_COUNTER_ID = "message-body-counter";
const MESSAGE_BODY_NEAR_LIMIT_REMAINING = 100;

type MessageComposerProps = {
	body: string;
	onBodyChange: (value: string) => void;
	onSend: () => void;
};

export function MessageComposer({
	body,
	onBodyChange,
	onSend,
}: MessageComposerProps) {
	const sendShortcutLabel = messageSendShortcutLabel();
	const composerHint = `${sendShortcutLabel}。Enter で改行`;

	const codePointCount = countUnicodeCodePoints(body);
	const counterText = formatMessageBodyCounter(codePointCount);
	const remainingCodePoints = MESSAGE_BODY_MAX_CODE_POINTS - codePointCount;
	const canSend = codePointCount > 0;

	const handleBodyChange = (value: string) => {
		onBodyChange(truncateToMaxCodePoints(value));
	};

	return (
		<div className="border-t border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
			<div className="flex items-end gap-2">
				<textarea
					className="min-h-24 min-w-0 flex-1 resize-y rounded border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-950 dark:text-stone-100"
					placeholder={MESSAGE_PLACEHOLDER}
					value={body}
					onChange={(e) => handleBodyChange(e.target.value)}
					onKeyDown={(e) => {
						if (
							isMessageSendShortcut({
								key: e.key,
								metaKey: e.metaKey,
								ctrlKey: e.ctrlKey,
								shiftKey: e.shiftKey,
								isComposing: e.nativeEvent.isComposing,
							})
						) {
							e.preventDefault();
							onSend();
						}
					}}
					aria-label="メッセージ入力"
					aria-describedby={`${MESSAGE_BODY_COUNTER_ID} message-composer-hint`}
				/>
				<button
					type="button"
					className="shrink-0 rounded bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 dark:bg-stone-200 dark:text-stone-900 dark:hover:bg-stone-300 dark:disabled:bg-stone-700 dark:disabled:text-stone-500"
					disabled={!canSend}
					onClick={onSend}
				>
					送信
				</button>
			</div>
			<div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<p
					id="message-composer-hint"
					className="text-xs text-stone-500 dark:text-stone-400"
				>
					{composerHint}
				</p>
				<p
					id={MESSAGE_BODY_COUNTER_ID}
					className={`text-xs tabular-nums ${
						remainingCodePoints <= MESSAGE_BODY_NEAR_LIMIT_REMAINING
							? "text-amber-700 dark:text-amber-400"
							: "text-stone-500 dark:text-stone-400"
					}`}
					aria-live="polite"
				>
					{counterText}
				</p>
			</div>
		</div>
	);
}
