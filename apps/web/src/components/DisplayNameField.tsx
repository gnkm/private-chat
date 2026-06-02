type DisplayNameFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

export function DisplayNameField({ value, onChange }: DisplayNameFieldProps) {
	return (
		<label htmlFor="display-name" className="flex flex-col gap-1 text-sm">
			<span className="font-medium text-slate-700">表示名</span>
			<input
				id="display-name"
				type="text"
				className="rounded border border-slate-300 px-2 py-1.5 text-slate-900"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="任意の名前"
				autoComplete="nickname"
			/>
		</label>
	);
}
