/** 投稿の表示名が、現在の利用者の表示名と一致するか（空白のみは未設定扱い） */
export function isOwnPost(
	postDisplayName: string,
	currentDisplayName: string,
): boolean {
	const current = currentDisplayName.trim();
	if (current.length === 0) {
		return false;
	}
	return postDisplayName.trim() === current;
}
