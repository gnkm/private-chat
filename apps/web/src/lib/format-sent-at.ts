function pad2(value: number): string {
	return String(value).padStart(2, "0");
}

/** ISO を `yyyy-mm-dd hh:mm:ss`（ローカル時刻）に整形する */
function formatDateTimeLocal(date: Date): string {
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/** 一覧表示用の送信日時文字列（SRS-UI-002） */
export function formatSentAt(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return iso;
	}
	return formatDateTimeLocal(date);
}
