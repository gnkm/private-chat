import { useCallback, useEffect, useState } from "react";

import {
	type ColorScheme,
	applyColorSchemeToDocument,
	getPreferredColorScheme,
	saveColorScheme,
	toggleColorScheme,
} from "../lib/color-scheme.js";

export function useColorScheme() {
	const [scheme, setScheme] = useState<ColorScheme>(() =>
		getPreferredColorScheme(),
	);

	useEffect(() => {
		applyColorSchemeToDocument(scheme);
	}, [scheme]);

	const toggle = useCallback(() => {
		setScheme((current) => {
			const next = toggleColorScheme(current);
			saveColorScheme(next);
			return next;
		});
	}, []);

	return { scheme, toggle };
}
