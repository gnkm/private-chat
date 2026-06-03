import type { Participant } from "@private-chat/shared";

import { DisplayNameField } from "./DisplayNameField.js";
import { ParticipantList } from "./ParticipantList.js";

type ChatSidebarProps = {
	displayName: string;
	participants: Participant[];
	onDisplayNameChange: (value: string) => void;
	onDisplayNameCommit: () => void;
};

export function ChatSidebar({
	displayName,
	participants,
	onDisplayNameChange,
	onDisplayNameCommit,
}: ChatSidebarProps) {
	return (
		<>
			<DisplayNameField
				value={displayName}
				onChange={onDisplayNameChange}
				onBlur={onDisplayNameCommit}
			/>
			<ParticipantList participants={participants} />
		</>
	);
}
