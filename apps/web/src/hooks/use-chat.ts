import type {
	ClientPostPayload,
	Participant,
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

export type ChatSocketCallbacks = {
	onPost: (post: ServerBroadcastPost) => void;
	onSendError: (message: string) => void;
	onParticipants: (participants: Participant[]) => void;
	onOpen: () => void;
};

export type UseChatOptions = {
	wsUrl?: string;
	createSocket?: (url: string, callbacks: ChatSocketCallbacks) => ChatSocket;
};

export function useChat(options: UseChatOptions = {}) {
	const [posts, setPosts] = useState<ServerBroadcastPost[]>([]);
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [displayName, setDisplayName] = useState(() => loadDisplayName());
	const [draftBody, setDraftBody] = useState("");
	const [sendError, setSendError] = useState<string | null>(null);
	const socketRef = useRef<ChatSocket | undefined>(undefined);
	const displayNameRef = useRef(displayName);
	displayNameRef.current = displayName;

	const wsUrl = options.wsUrl ?? resolveWebSocketUrl();
	const createSocketRef = useRef(options.createSocket);
	createSocketRef.current = options.createSocket;

	const announceDisplayName = useCallback((name: string) => {
		socketRef.current?.sendSetDisplayName(name);
	}, []);

	useEffect(() => {
		const socket =
			createSocketRef.current?.(wsUrl, {
				onPost: (post) => {
					setPosts((prev) => [...prev, post]);
				},
				onSendError: (message) => {
					setSendError(message);
				},
				onParticipants: (next) => {
					setParticipants(next);
				},
				onOpen: () => {
					const stored = loadDisplayName();
					if (!isDisplayNameBlank(stored)) {
						announceDisplayName(stored);
					}
				},
			}) ??
			new ChatSocket(wsUrl, {
				onPost: (post) => {
					setPosts((prev) => [...prev, post]);
				},
				onSendError: (message) => {
					setSendError(message);
				},
				onParticipants: (next) => {
					setParticipants(next);
				},
				onOpen: () => {
					const stored = loadDisplayName();
					if (!isDisplayNameBlank(stored)) {
						announceDisplayName(stored);
					}
				},
			});

		socketRef.current = socket;
		socket.connect();

		return () => {
			socket.dispose();
			socketRef.current = undefined;
		};
	}, [wsUrl, announceDisplayName]);

	const updateDisplayName = useCallback((name: string) => {
		setDisplayName(name);
		saveDisplayName(name);
	}, []);

	const commitDisplayName = useCallback(() => {
		if (!isDisplayNameBlank(displayNameRef.current)) {
			announceDisplayName(displayNameRef.current);
		}
	}, [announceDisplayName]);

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
		participants,
		displayName,
		draftBody,
		sendError,
		setDraftBody,
		updateDisplayName,
		commitDisplayName,
		sendMessage,
		clearSendError,
	};
}
