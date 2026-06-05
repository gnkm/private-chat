import { type AppConfig, DEFAULT_APP_CONFIG } from "@private-chat/shared";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

import { loadAppConfig } from "./load-app-config.js";

const AppConfigContext = createContext<AppConfig>({
	shiki: { ...DEFAULT_APP_CONFIG.shiki },
	reactions: { emojis: [...DEFAULT_APP_CONFIG.reactions.emojis] },
});

export function AppConfigProvider({ children }: { children: ReactNode }) {
	const [config, setConfig] = useState<AppConfig>({
		shiki: { ...DEFAULT_APP_CONFIG.shiki },
		reactions: { emojis: [...DEFAULT_APP_CONFIG.reactions.emojis] },
	});

	useEffect(() => {
		void loadAppConfig().then(setConfig);
	}, []);

	return (
		<AppConfigContext.Provider value={config}>
			{children}
		</AppConfigContext.Provider>
	);
}

export function useAppConfig(): AppConfig {
	return useContext(AppConfigContext);
}
