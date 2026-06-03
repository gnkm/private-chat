import {
	isMessageSendShortcut,
	messageSendShortcutLabel,
} from "../lib/message-send-shortcut.js";

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

	return (
		<div className="border-t border-slate-200 bg-white p-4">
			<textarea
				className="min-h-24 w-full resize-y rounded border border-slate-300 px-3 py-2 text-sm text-slate-900"
				placeholder={`メッセージを入力（${sendShortcutLabel}、Enter で改行）`}
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
			<p className="mt-1 text-xs text-slate-500">{sendShortcutLabel}</p>
		</div>
	);
}
