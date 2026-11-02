import type { ReactNode } from "react";
import { COLORS, FONT_SANS } from "./ae-expression-theme";

interface ToolWrapperProps {
	children: ReactNode;
	toolName: string;
	description: string;
	category: string;
}

/**
 * The tool's own shell.
 *
 * The host application (`my-web-2025` / `my-web-2026`) used to provide
 * this component and the tool reached it through the relative path
 * `../../../../src/components/tools-ui/ToolWrapper`, which only resolves
 * when this repository happens to sit next to the host checkout. A
 * standalone build cannot resolve it at all, and the host's shell also
 * links to host routes (`/`, `/tools`) that do not exist inside an
 * iframe: following one would navigate the frame away from the tool.
 *
 * This component therefore owns the shell here. It keeps the host's
 * public prop contract (`toolName` / `description` / `category` /
 * `children`) so the surrounding tool components do not change, and it
 * renders the host navigation as plain text instead of links.
 */
export default function ToolWrapper({
	children,
	toolName,
	description,
	category,
}: ToolWrapperProps) {
	return (
		<div
			style={{
				minHeight: "100vh",
				background: COLORS.surface,
				color: COLORS.text,
				fontFamily: FONT_SANS,
			}}
		>
			<main style={{ padding: "40px 0" }}>
				<div
					style={{
						maxWidth: "72rem",
						margin: "0 auto",
						padding: "0 16px",
						display: "flex",
						flexDirection: "column",
						gap: "40px",
					}}
				>
					<header style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
						<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
							<h1 style={{ margin: 0, fontSize: "2.25rem", lineHeight: 1.2 }}>
								{toolName}
							</h1>
							<p
								style={{
									margin: 0,
									fontSize: "0.875rem",
									lineHeight: 1.8,
									maxWidth: "42rem",
									color: COLORS.muted,
								}}
							>
								{description}
							</p>
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									gap: "16px",
									alignItems: "center",
								}}
							>
								<span
									style={{
										borderRadius: "999px",
										padding: "4px 12px",
										fontSize: "0.75rem",
										background: COLORS.surfaceMuted,
										border: `1px solid ${COLORS.border}`,
										color: COLORS.muted,
									}}
								>
									{category}
								</span>
								<span style={{ fontSize: "0.75rem", color: COLORS.muted }}>
									オフライン対応・この Tool 内だけで動作します
								</span>
							</div>
						</div>
					</header>

					<div role="application" aria-label={`${toolName} tool`}>
						{children}
					</div>

					<nav aria-label="Site navigation">
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
								gap: "24px",
							}}
						>
							<span
								style={{
									borderRadius: "16px",
									padding: "16px",
									textAlign: "center",
									background: COLORS.surfaceMuted,
									border: `1px solid ${COLORS.border}`,
									color: COLORS.muted,
								}}
							>
								← Tools
							</span>
							<span
								style={{
									borderRadius: "16px",
									padding: "16px",
									textAlign: "center",
									background: COLORS.surfaceMuted,
									border: `1px solid ${COLORS.border}`,
									color: COLORS.muted,
								}}
							>
								← Home
							</span>
						</div>
					</nav>
				</div>
			</main>
		</div>
	);
}
