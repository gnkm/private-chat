import { DisplayNameField } from "./DisplayNameField.js";

type ChatSidebarProps = {
	displayName: string;
	onDisplayNameChange: (value: string) => void;
};

export function ChatSidebar({
	displayName,
	onDisplayNameChange,
}: ChatSidebarProps) {
	return (
		<DisplayNameField value={displayName} onChange={onDisplayNameChange} />
	);
}
