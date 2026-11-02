import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AeExpressionApp from "./AeExpressionApp";

const container = document.getElementById("root");

if (!container) {
	throw new Error("AE Expression: missing #root element");
}

createRoot(container).render(
	<StrictMode>
		<AeExpressionApp />
	</StrictMode>,
);
