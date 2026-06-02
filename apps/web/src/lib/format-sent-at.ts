/** 一覧表示用のローカル時刻文字列（SRS-UI-002） */
export function formatSentAt(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return iso;
	}
	return date.toLocaleString();
}
