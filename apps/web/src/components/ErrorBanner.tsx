type ErrorBannerProps = {
	message: string;
	onDismiss: () => void;
};

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
	return (
		<div
			role="alert"
			className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
		>
			<div className="flex items-start justify-between gap-2">
				<p>{message}</p>
				<button
					type="button"
					className="shrink-0 text-red-700 underline dark:text-red-300"
					onClick={onDismiss}
				>
					閉じる
				</button>
			</div>
		</div>
	);
}
