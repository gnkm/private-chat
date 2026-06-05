import { ChatApp } from "./components/ChatApp.js";
import { AppConfigProvider } from "./config/AppConfigContext.js";

export function App() {
	return (
		<AppConfigProvider>
			<ChatApp />
		</AppConfigProvider>
	);
}
