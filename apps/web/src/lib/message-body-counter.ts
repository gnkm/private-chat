import { MESSAGE_BODY_MAX_CODE_POINTS } from "@private-chat/shared";

export function formatMessageBodyCounter(
	currentCodePoints: number,
	maxCodePoints = MESSAGE_BODY_MAX_CODE_POINTS,
): string {
	return `${currentCodePoints.toLocaleString("ja-JP")} / ${maxCodePoints.toLocaleString("ja-JP")}`;
}
