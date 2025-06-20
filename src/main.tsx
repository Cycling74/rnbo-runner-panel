import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/global.css";
import "@mantine/core/styles.css";

import { App } from "./app";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

