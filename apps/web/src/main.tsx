import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App.js";
import { loadAppConfig } from "./config/load-app-config.js";
import "./index.css";

void loadAppConfig();

const rootEl = document.getElementById("root");
if (!rootEl) {
	throw new Error("root element not found");
}

createRoot(rootEl).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
