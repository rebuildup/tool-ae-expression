"use client";

import AEExpressionTool from "./components/AEExpressionTool";
import { COLORS, FONT_SANS } from "./components/ae-expression-theme";

export default function AeExpressionApp() {
	return (
		<div style={{ position: "relative", minHeight: "100vh" }}>
			<main
				style={{ position: "relative", zIndex: 10, minHeight: "100vh", padding: "40px 0" }}
				tabIndex={-1}
			>
				<div
					style={{
						maxWidth: "72rem",
						margin: "0 auto",
						padding: "0 16px",
						display: "flex",
						flexDirection: "column",
						gap: "64px",
					}}
				>
					<nav aria-label="Breadcrumb" style={{ marginBottom: "16px", paddingTop: "16px" }}>
						<ol
							style={{
								display: "flex",
								alignItems: "baseline",
								gap: "4px",
								listStyle: "none",
								padding: 0,
								margin: 0,
								fontSize: "0.75rem",
								color: COLORS.muted,
								fontFamily: FONT_SANS,
							}}
						>
							<li style={{ display: "flex", alignItems: "baseline" }}>
								<span>Home</span>
							</li>
							<li style={{ display: "flex", alignItems: "baseline" }}>
								<span aria-hidden="true" style={{ margin: "0 8px" }}>
									/
								</span>
								<span>Tools</span>
							</li>
							<li style={{ display: "flex", alignItems: "baseline" }}>
								<span aria-hidden="true" style={{ margin: "0 8px" }}>
									/
								</span>
								<span aria-current="page">After Effects Expression Helper</span>
							</li>
						</ol>
					</nav>

					<section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
						<AEExpressionTool />
					</section>
				</div>
			</main>
		</div>
	);
}
