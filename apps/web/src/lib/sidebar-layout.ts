/** サイドバー展開時の幅（Tailwind クラス） */
export const SIDEBAR_WIDTH_OPEN_CLASS = "w-56";

/** サイドバー折りたたみ時の幅（アイコン 1 個分） */
export const SIDEBAR_WIDTH_COLLAPSED_CLASS = "w-12";

/** サイドバー開閉のアニメーション（`prefers-reduced-motion` 時は無効） */
export const SIDEBAR_TRANSITION_CLASS =
	"transition-[width] duration-300 ease-in-out motion-reduce:transition-none";
