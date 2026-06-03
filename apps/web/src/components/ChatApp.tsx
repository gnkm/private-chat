import { useState } from "react";

import { type UseChatOptions, useChat } from "../hooks/use-chat.js";
import {
	SIDEBAR_TRANSITION_CLASS,
	SIDEBAR_WIDTH_COLLAPSED_CLASS,
	SIDEBAR_WIDTH_OPEN_CLASS,
} from "../lib/sidebar-layout.js";
import { ChatSidebar } from "./ChatSidebar.js";
import { ErrorBanner } from "./ErrorBanner.js";
import { MessageComposer } from "./MessageComposer.js";
import { PostList } from "./PostList.js";
import { SidebarToggleButton } from "./SidebarToggleButton.js";
import { ThemeToggleButton } from "./ThemeToggleButton.js";

const SIDEBAR_CONTENT_TRANSITION_CLASS =
	"transition-opacity duration-300 ease-in-out motion-reduce:transition-none";

type ChatAppProps = {
	chatOptions?: UseChatOptions;
};

/** Slack 風レイアウトのメイン画面（SRS-UI-001） */
export function ChatApp({ chatOptions }: ChatAppProps = {}) {
	const {
		posts,
		reactionsByPostId,
		myReactionsByPostId,
		toggleReaction,
		participants,
		displayName,
		draftBody,
		sendError,
		setDraftBody,
		updateDisplayName,
		commitDisplayName,
		sendMessage,
		clearSendError,
	} = useChat(chatOptions ?? {});

	const [sidebarOpen, setSidebarOpen] = useState(true);

	const toggleSidebar = () => setSidebarOpen((open) => !open);

	return (
		<div className="flex h-full min-h-0 overflow-hidden bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-300">
			<aside
				id="chat-sidebar"
				aria-label="サイドバー"
				className={`flex shrink-0 flex-col overflow-hidden border-r border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800 ${SIDEBAR_TRANSITION_CLASS} ${
					sidebarOpen ? SIDEBAR_WIDTH_OPEN_CLASS : SIDEBAR_WIDTH_COLLAPSED_CLASS
				}`}
			>
				<div
					className={`flex shrink-0 items-center border-b border-stone-200 py-2 transition-[padding] duration-300 ease-in-out motion-reduce:transition-none dark:border-stone-700 ${
						sidebarOpen ? "justify-between gap-2 px-3" : "justify-center px-1"
					}`}
				>
					{sidebarOpen ? (
						<h1
							className={`min-w-0 flex-1 truncate text-base font-semibold text-stone-800 dark:text-stone-200 ${SIDEBAR_CONTENT_TRANSITION_CLASS} opacity-100`}
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
					inert={!sidebarOpen ? true : undefined}
					aria-hidden={!sidebarOpen}
					className={`flex flex-col overflow-y-auto overscroll-contain ${SIDEBAR_CONTENT_TRANSITION_CLASS} ${
						sidebarOpen
							? "max-h-full flex-1 p-4 opacity-100"
							: "max-h-0 flex-none overflow-hidden p-0 opacity-0"
					}`}
				>
					<ChatSidebar
						displayName={displayName}
						participants={participants}
						onDisplayNameChange={updateDisplayName}
						onDisplayNameCommit={commitDisplayName}
					/>
				</div>
			</aside>

			<div
				className="flex min-h-0 min-w-0 flex-1 flex-col dark:bg-stone-900"
				aria-label="チャット"
			>
				<header className="flex shrink-0 items-center justify-end px-3 py-2">
					<ThemeToggleButton />
				</header>
				<main className="flex min-h-0 flex-1 flex-col">
					{sendError ? (
						<div className="shrink-0">
							<ErrorBanner message={sendError} onDismiss={clearSendError} />
						</div>
					) : null}
					<PostList
						posts={posts}
						currentDisplayName={displayName}
						reactionsByPostId={reactionsByPostId}
						myReactionsByPostId={myReactionsByPostId}
						onToggleReaction={toggleReaction}
					/>
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
