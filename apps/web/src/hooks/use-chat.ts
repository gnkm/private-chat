import type {
	ClientPostPayload,
	ServerBroadcastPost,
} from "@private-chat/shared";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatSocket } from "../lib/chat-socket.js";
import {
	DISPLAY_NAME_REQUIRED_ERROR,
	isDisplayNameBlank,
} from "../lib/display-name-validation.js";
import { loadDisplayName, saveDisplayName } from "../lib/display-name.js";
import { resolveWebSocketUrl } from "../lib/ws-url.js";

export type UseChatOptions = {
	wsUrl?: string;
	createSocket?: (
		url: string,
		callbacks: {
			onPost: (post: ServerBroadcastPost) => void;
			onSendError: (message: string) => void;
		},
	) => ChatSocket;
};

export function useChat(options: UseChatOptions = {}) {
	const [posts, setPosts] = useState<ServerBroadcastPost[]>([]);
	const [displayName, setDisplayName] = useState(() => loadDisplayName());
	const [draftBody, setDraftBody] = useState("");
	const [sendError, setSendError] = useState<string | null>(null);
	const socketRef = useRef<ChatSocket | undefined>(undefined);

	const wsUrl = options.wsUrl ?? resolveWebSocketUrl();
	const createSocketRef = useRef(options.createSocket);
	createSocketRef.current = options.createSocket;

	useEffect(() => {
		const socket =
			createSocketRef.current?.(wsUrl, {
				onPost: (post) => {
					setPosts((prev) => [...prev, post]);
				},
				onSendError: (message) => {
					setSendError(message);
				},
			}) ??
			new ChatSocket(wsUrl, {
				onPost: (post) => {
					setPosts((prev) => [...prev, post]);
				},
				onSendError: (message) => {
					setSendError(message);
				},
			});

		socketRef.current = socket;
		socket.connect();

		return () => {
			socket.dispose();
			socketRef.current = undefined;
		};
	}, [wsUrl]);

	const updateDisplayName = useCallback((name: string) => {
		setDisplayName(name);
		saveDisplayName(name);
	}, []);

	const sendMessage = useCallback(() => {
		if (draftBody.length === 0) {
			return;
		}
		if (isDisplayNameBlank(displayName)) {
			setSendError(DISPLAY_NAME_REQUIRED_ERROR);
			return;
		}
		setSendError(null);
		const payload: ClientPostPayload = {
			displayName,
			body: draftBody,
		};
		if (socketRef.current?.sendPost(payload)) {
			setDraftBody("");
		}
	}, [displayName, draftBody]);

	const clearSendError = useCallback(() => setSendError(null), []);

	return {
		posts,
		displayName,
		draftBody,
		sendError,
		setDraftBody,
		updateDisplayName,
		sendMessage,
		clearSendError,
	};
}
