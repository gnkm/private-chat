import type { Participant } from "@private-chat/shared";

export function sortParticipantsByDisplayName(
	participants: Participant[],
): Participant[] {
	return [...participants].sort((a, b) =>
		a.displayName.localeCompare(b.displayName, "ja"),
	);
}
