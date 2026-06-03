import type { Participant } from "@private-chat/shared";

import { sortParticipantsByDisplayName } from "../lib/sort-participants.js";

const PARTICIPANTS_LIST_LABEL = "参加者";
const PARTICIPANTS_EMPTY_MESSAGE = "まだ参加者はいません";

type ParticipantListProps = {
	participants: Participant[];
};

export function ParticipantList({ participants }: ParticipantListProps) {
	const sorted = sortParticipantsByDisplayName(participants);

	return (
		<section
			className="mt-6 flex flex-col gap-2"
			aria-labelledby="participants-heading"
		>
			<h2
				id="participants-heading"
				className="text-sm font-medium text-stone-700 dark:text-stone-300"
			>
				{PARTICIPANTS_LIST_LABEL}
			</h2>
			{sorted.length === 0 ? (
				<p className="text-xs text-stone-500 dark:text-stone-400">
					{PARTICIPANTS_EMPTY_MESSAGE}
				</p>
			) : (
				<ul
					aria-label={PARTICIPANTS_LIST_LABEL}
					className="flex flex-col gap-1 text-sm text-stone-800 dark:text-stone-200"
				>
					{sorted.map((participant) => (
						<li key={participant.id}>{participant.displayName}</li>
					))}
				</ul>
			)}
		</section>
	);
}
