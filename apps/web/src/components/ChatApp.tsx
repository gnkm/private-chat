import { useState } from "react";

import { type UseChatOptions, useChat } from "../hooks/use-chat.js";
import {
	SIDEBAR_TRANSITION_CLASS,
	SIDEBAR_WIDTH_COLLAPSED_CLASS,
	SIDEBAR_WIDTH_OPEN_CLASS,
} from "../lib/sidebar-layout.js";

const SIDEBAR_CONTENT_TRANSITION_CLASS =
	"transition-opacity duration-300 ease-in-out motion-reduce:transition-none";

import { ChatSidebar } from "./ChatSidebar.js";
import { ErrorBanner } from "./ErrorBanner.js";
import { MessageComposer } from "./MessageComposer.js";
import { PostList } from "./PostList.js";
import { SidebarToggleButton } from "./SidebarToggleButton.js";

type ChatAppProps = {
	chatOptions?: UseChatOptions;
};

/** Slack 風レイアウトのメイン画面（SRS-UI-001） */
export function ChatApp({ chatOptions }: ChatAppProps = {}) {
	const {
		posts,
		displayName,
		draftBody,
		sendError,
		setDraftBody,
		updateDisplayName,
		sendMessage,
		clearSendError,
	} = useChat(chatOptions ?? {});

	const [sidebarOpen, setSidebarOpen] = useState(true);

	const toggleSidebar = () => setSidebarOpen((open) => !open);

	return (
		<div className="flex h-full min-h-0 overflow-hidden bg-slate-100 text-slate-900">
			<aside
				id="chat-sidebar"
				aria-label="サイドバー"
				className={`flex shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-slate-50 ${SIDEBAR_TRANSITION_CLASS} ${
					sidebarOpen ? SIDEBAR_WIDTH_OPEN_CLASS : SIDEBAR_WIDTH_COLLAPSED_CLASS
				}`}
			>
				<div
					className={`flex shrink-0 items-center border-b border-slate-200 py-2 transition-[padding] duration-300 ease-in-out motion-reduce:transition-none ${
						sidebarOpen ? "justify-between gap-2 px-3" : "justify-center px-1"
					}`}
				>
					{sidebarOpen ? (
						<h1
							className={`min-w-0 flex-1 truncate text-base font-semibold text-slate-800 ${SIDEBAR_CONTENT_TRANSITION_CLASS} opacity-100`}
						>
							Private Chat
						</h1>
					) : (
						<span className="sr-only">Private Chat</span>
					)}
					<SidebarToggleButton
						sidebarOpen={sidebarOpen}
						onToggle={toggleSidebar}
						controlsId="chat-sidebar-panel"
					/>
				</div>
				<div
					id="chat-sidebar-panel"
					aria-hidden={!sidebarOpen}
					className={`flex flex-col overflow-y-auto overscroll-contain ${SIDEBAR_CONTENT_TRANSITION_CLASS} ${
						sidebarOpen
							? "max-h-full flex-1 p-4 opacity-100"
							: "max-h-0 flex-none overflow-hidden p-0 opacity-0"
					}`}
				>
					<ChatSidebar
						displayName={displayName}
						onDisplayNameChange={updateDisplayName}
					/>
				</div>
			</aside>

			<div className="flex min-h-0 min-w-0 flex-1 flex-col">
				<main className="flex min-h-0 flex-1 flex-col">
					{sendError ? (
						<div className="shrink-0">
							<ErrorBanner message={sendError} onDismiss={clearSendError} />
						</div>
					) : null}
					<PostList posts={posts} />
					<div className="shrink-0">
						<MessageComposer
							body={draftBody}
							onBodyChange={setDraftBody}
							onSend={sendMessage}
						/>
					</div>
				</main>
			</div>
		</div>
	);
}
