/**
 * Design tokens for the standalone build.
 *
 * The tool used to be rendered inside the host application, where the
 * host's Tailwind theme supplied the typography and the surfaces. A
 * standalone build has no Tailwind pipeline, so every utility class the
 * components used to rely on is replaced by an inline style that reads
 * these tokens.
 *
 * The tokens are intentionally self-contained: no web font is fetched, so
 * the artefact contacts zero third-party origins.
 */

import type { CSSProperties } from "react";

export const FONT_SANS =
	'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif';

export const FONT_MONO =
	'ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", "Noto Sans Mono", monospace';

export const COLORS = {
	text: "#111111",
	muted: "#666666",
	subtle: "#8a8a8a",
	surface: "#ffffff",
	surfaceMuted: "#f7f7f7",
	border: "#e2e2e2",
	borderStrong: "#cfcfcf",
	accent: "#1f1f1f",
	accentText: "#ffffff",
	danger: "#b3261e",
	dangerSurface: "#fdf1f0",
	warning: "#8a5a00",
	warningSurface: "#fdf7e8",
	success: "#1b5e20",
	successSurface: "#f1f8f2",
} as const;

export const PANEL_SHADOW = "0 8px 24px rgba(0, 0, 0, 0.25)";

export const ICON_SIZE = 16;

export const inputStyle: CSSProperties = {
	width: "100%",
	padding: "8px 12px",
	fontSize: "0.875rem",
	fontFamily: FONT_SANS,
	color: COLORS.text,
	background: COLORS.surface,
	border: `1px solid ${COLORS.border}`,
	borderRadius: "6px",
	boxSizing: "border-box",
};

export const selectStyle: CSSProperties = {
	padding: "8px 16px",
	fontSize: "0.875rem",
	fontFamily: FONT_SANS,
	color: COLORS.text,
	background: COLORS.surface,
	border: `1px solid ${COLORS.border}`,
	borderRadius: "6px",
};

export const buttonStyle: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: "8px",
	padding: "8px 16px",
	fontSize: "0.875rem",
	fontFamily: FONT_SANS,
	color: COLORS.text,
	background: COLORS.surfaceMuted,
	border: `1px solid ${COLORS.border}`,
	borderRadius: "6px",
	cursor: "pointer",
};

export const activeButtonStyle: CSSProperties = {
	...buttonStyle,
	color: COLORS.accentText,
	background: COLORS.accent,
	borderColor: COLORS.accent,
};

export const panelStyle: CSSProperties = {
	borderRadius: "12px",
	boxShadow: PANEL_SHADOW,
	padding: "16px",
	background: COLORS.surface,
};

export const DIFFICULTY_COLORS: Record<
	"beginner" | "intermediate" | "advanced",
	{ background: string; color: string }
> = {
	beginner: { background: COLORS.successSurface, color: COLORS.success },
	intermediate: { background: COLORS.warningSurface, color: COLORS.warning },
	advanced: { background: COLORS.dangerSurface, color: COLORS.danger },
};
