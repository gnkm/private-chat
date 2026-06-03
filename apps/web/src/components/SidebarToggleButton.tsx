import { getSidebarToggleLabel } from "../lib/sidebar-toggle.js";

type SidebarToggleButtonProps = {
	sidebarOpen: boolean;
	onToggle: () => void;
	controlsId?: string;
};

export function SidebarToggleButton({
	sidebarOpen,
	onToggle,
	controlsId,
}: SidebarToggleButtonProps) {
	const label = getSidebarToggleLabel(sidebarOpen);

	return (
		<button
			type="button"
			className="shrink-0 rounded-lg bg-stone-100 p-2 text-stone-700 hover:bg-stone-200"
			aria-expanded={sidebarOpen}
			aria-controls={controlsId}
			aria-label={label}
			title={label}
			onClick={onToggle}
		>
			<svg
				aria-hidden="true"
				className="h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinejoin="round"
			>
				<rect height="18" rx="2" width="18" x="3" y="3" />
				<path d="M9 3v18" />
			</svg>
		</button>
	);
}
