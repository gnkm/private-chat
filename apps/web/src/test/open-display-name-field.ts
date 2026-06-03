import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

/** サイドバーが閉じている場合は開いてから表示名入力欄を操作する */
export async function typeDisplayName(
	user: UserEvent,
	name: string,
): Promise<void> {
	const openToggle = screen.queryByRole("button", { name: "サイドバーを開く" });
	if (openToggle) {
		await user.click(openToggle);
	}
	await user.type(screen.getByLabelText("表示名"), name);
}
