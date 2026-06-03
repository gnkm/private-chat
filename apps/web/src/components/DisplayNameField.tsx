import {
	DISPLAY_NAME_EMPTY_HINT,
	DISPLAY_NAME_PLACEHOLDER,
	isDisplayNameBlank,
} from "../lib/display-name-validation.js";

type DisplayNameFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

export function DisplayNameField({ value, onChange }: DisplayNameFieldProps) {
	const showHint = isDisplayNameBlank(value);
	const hintId = "display-name-hint";

	return (
		<div className="flex flex-col gap-1 text-sm">
			<label
				htmlFor="display-name"
				className="font-medium text-stone-700 dark:text-stone-300"
			>
				表示名
			</label>
			<input
				id="display-name"
				type="text"
				className="rounded border border-stone-300 bg-white px-2 py-1.5 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={DISPLAY_NAME_PLACEHOLDER}
				autoComplete="nickname"
				spellCheck={false}
				aria-describedby={showHint ? hintId : undefined}
			/>
			{showHint ? (
				<p id={hintId} className="text-xs text-amber-800 dark:text-amber-300">
					{DISPLAY_NAME_EMPTY_HINT}
				</p>
			) : null}
		</div>
	);
}
