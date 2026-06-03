import { type UseChatOptions, useChat } from "../hooks/use-chat.js";

import { DisplayNameField } from "./DisplayNameField.js";
import { ErrorBanner } from "./ErrorBanner.js";
import { MessageComposer } from "./MessageComposer.js";
import { PostList } from "./PostList.js";

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

	return (
		<div className="flex h-full min-h-0 overflow-hidden bg-slate-100 text-slate-900">
			<aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-slate-200 bg-slate-50 p-4">
				<h1 className="text-lg font-bold text-slate-800">Private Chat</h1>
				<DisplayNameField value={displayName} onChange={updateDisplayName} />
			</aside>
			<main className="flex min-h-0 min-w-0 flex-1 flex-col">
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
	);
}
