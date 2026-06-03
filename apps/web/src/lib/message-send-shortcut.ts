type MessageSendShortcutEvent = {
	key: string;
	metaKey: boolean;
	ctrlKey: boolean;
	shiftKey: boolean;
	isComposing: boolean;
};

export function isMacPlatform(): boolean {
	if (typeof navigator === "undefined") {
		return false;
	}
	return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

export function isMessageSendShortcut(
	event: MessageSendShortcutEvent,
	isMac = isMacPlatform(),
): boolean {
	if (event.key !== "Enter" || event.isComposing) {
		return false;
	}
	if (isMac) {
		return event.metaKey && !event.shiftKey;
	}
	return event.ctrlKey && !event.shiftKey;
}

export function messageSendShortcutLabel(isMac = isMacPlatform()): string {
	return isMac ? "⌘+Enter で送信" : "Ctrl+Enter で送信";
}
