import { useColorScheme } from "../hooks/use-color-scheme.js";
import { getThemeToggleLabel } from "../lib/color-scheme.js";

export function ThemeToggleButton() {
	const { scheme, toggle } = useColorScheme();
	const label = getThemeToggleLabel(scheme);
	const isDark = scheme === "dark";

	return (
		<button
			type="button"
			className="shrink-0 rounded-lg bg-stone-100 p-2 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
			aria-label={label}
			title={label}
			onClick={toggle}
		>
			{isDark ? (
				<svg
					aria-hidden="true"
					className="h-5 w-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
				</svg>
			) : (
				<svg
					aria-hidden="true"
					className="h-5 w-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path d="M21 14.5A7.5 7.5 0 0 1 9.5 3 9.9 9.9 0 0 0 21 14.5z" />
				</svg>
			)}
		</button>
	);
}
