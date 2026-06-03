import {
	isMessageSendShortcut,
	messageSendShortcutLabel,
} from "../lib/message-send-shortcut.js";

const MESSAGE_PLACEHOLDER = "メッセージを入力…";

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

	const canSend = body.length > 0;

	return (
		<div className="border-t border-slate-200 bg-white p-4">
			<div className="flex items-end gap-2">
				<textarea
					className="min-h-24 min-w-0 flex-1 resize-y rounded border border-slate-300 px-3 py-2 text-sm text-slate-900"
					placeholder={MESSAGE_PLACEHOLDER}
					value={body}
					onChange={(e) => onBodyChange(e.target.value)}
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
				/>
				<button
					type="button"
					className="shrink-0 rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
					disabled={!canSend}
					onClick={onSend}
				>
					送信
				</button>
			</div>
			<p className="mt-1 text-xs text-slate-500">{composerHint}</p>
		</div>
	);
}
