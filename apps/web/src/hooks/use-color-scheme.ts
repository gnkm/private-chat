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
		saveColorScheme(scheme);
	}, [scheme]);

	const toggle = useCallback(() => {
		setScheme((current) => toggleColorScheme(current));
	}, []);

	return { scheme, toggle };
}
