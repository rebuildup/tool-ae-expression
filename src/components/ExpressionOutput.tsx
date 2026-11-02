import {
	AlertCircle,
	CheckCircle,
	Copy,
	Download,
	Pause,
	Play,
	RotateCcw,
	Save,
} from "lucide-react";
import {
	COLORS,
	FONT_MONO,
	FONT_SANS,
	ICON_SIZE,
	activeButtonStyle,
	buttonStyle,
	panelStyle,
} from "./ae-expression-theme";
import type { AEExpression, ValidationResult } from "./ae-expression-types";

interface ExpressionOutputProps {
	expression: AEExpression | null;
	generatedCode: string;
	validationResult: ValidationResult;
	isPreviewPlaying: boolean;
	previewTime: number;
	copySuccess: boolean;
	onTogglePreview: () => void;
	onResetPreview: () => void;
	onSave: () => void;
	onExport: () => void;
	onCopy: () => void;
}

export function ExpressionOutput({
	expression,
	generatedCode,
	validationResult,
	isPreviewPlaying,
	previewTime,
	copySuccess,
	onTogglePreview,
	onResetPreview,
	onSave,
	onExport,
	onCopy,
}: ExpressionOutputProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: "8px",
				}}
			>
				<h2 style={{ margin: 0, fontSize: "1.25rem", fontFamily: FONT_SANS }}>
					生成されたコード
				</h2>
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						gap: "8px",
					}}
				>
					<button type="button" onClick={onTogglePreview} style={buttonStyle}>
						{isPreviewPlaying ? (
							<Pause size={ICON_SIZE} />
						) : (
							<Play size={ICON_SIZE} />
						)}
						{isPreviewPlaying ? "停止" : "再生"}
					</button>
					<button type="button" onClick={onResetPreview} style={buttonStyle}>
						<RotateCcw size={ICON_SIZE} />
						リセット
					</button>
					<button
						type="button"
						onClick={onSave}
						disabled={!expression || !generatedCode}
						style={{
							...buttonStyle,
							opacity: !expression || !generatedCode ? 0.5 : 1,
							cursor: !expression || !generatedCode ? "not-allowed" : "pointer",
						}}
					>
						<Save size={ICON_SIZE} />
						保存
					</button>
					<button
						type="button"
						onClick={onExport}
						disabled={!generatedCode}
						style={{
							...buttonStyle,
							opacity: !generatedCode ? 0.5 : 1,
							cursor: !generatedCode ? "not-allowed" : "pointer",
						}}
					>
						<Download size={ICON_SIZE} />
						エクスポート
					</button>
					<button
						type="button"
						onClick={onCopy}
						disabled={!generatedCode}
						style={{
							...(copySuccess ? activeButtonStyle : buttonStyle),
							opacity: !generatedCode ? 0.5 : 1,
							cursor: !generatedCode ? "not-allowed" : "pointer",
						}}
					>
						{copySuccess ? (
							<CheckCircle size={ICON_SIZE} />
						) : (
							<Copy size={ICON_SIZE} />
						)}
						{copySuccess ? "コピー完了" : "コピー"}
					</button>
				</div>
			</div>
			{generatedCode && (
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					{validationResult.errors.length > 0 && (
						<div
							style={{
								padding: "12px",
								borderRadius: "8px",
								background: COLORS.dangerSurface,
								border: `1px solid ${COLORS.danger}`,
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									marginBottom: "8px",
									color: COLORS.danger,
								}}
							>
								<AlertCircle size={ICON_SIZE} />
								<span style={{ fontSize: "0.875rem" }}>エラー</span>
							</div>
							<ul
								style={{
									margin: 0,
									paddingLeft: "1.25rem",
									fontSize: "0.875rem",
									color: COLORS.danger,
								}}
							>
								{validationResult.errors.map((error) => (
									<li key={error}>• {error}</li>
								))}
							</ul>
						</div>
					)}
					{validationResult.warnings.length > 0 && (
						<div
							style={{
								padding: "12px",
								borderRadius: "8px",
								background: COLORS.warningSurface,
								border: `1px solid ${COLORS.warning}`,
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									marginBottom: "8px",
									color: COLORS.warning,
								}}
							>
								<AlertCircle size={ICON_SIZE} />
								<span style={{ fontSize: "0.875rem" }}>警告</span>
							</div>
							<ul
								style={{
									margin: 0,
									paddingLeft: "1.25rem",
									fontSize: "0.875rem",
									color: COLORS.warning,
								}}
							>
								{validationResult.warnings.map((warning) => (
									<li key={warning}>• {warning}</li>
								))}
							</ul>
						</div>
					)}
					{validationResult.isValid &&
						validationResult.warnings.length === 0 && (
							<div
								style={{
									padding: "12px",
									borderRadius: "8px",
									background: COLORS.successSurface,
									border: `1px solid ${COLORS.success}`,
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "8px",
										color: COLORS.success,
									}}
								>
									<CheckCircle size={ICON_SIZE} />
									<span style={{ fontSize: "0.875rem" }}>
										エクスプレッションは正常です
									</span>
								</div>
							</div>
						)}
				</div>
			)}
			<div style={{ ...panelStyle, minHeight: "8rem" }}>
				<pre
					style={{
						margin: 0,
						whiteSpace: "pre-wrap",
						fontSize: "0.875rem",
						lineHeight: 1.7,
						fontFamily: FONT_MONO,
						color: COLORS.text,
					}}
				>
					{generatedCode || "エクスプレッションを選択してください..."}
				</pre>
			</div>
			{expression && (
				<div style={panelStyle}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: "8px",
						}}
					>
						<span style={{ fontSize: "0.875rem" }}>プレビュー時間</span>
						<span style={{ fontSize: "0.875rem", fontFamily: FONT_MONO }}>
							{previewTime.toFixed(1)}s
						</span>
					</div>
					<div style={{ fontSize: "0.75rem", color: COLORS.muted, lineHeight: 1.7 }}>
						実際のAfter
						Effectsでは、このエクスプレッションが時間に応じて値を変化させます.
					</div>
				</div>
			)}
			{expression && (
				<div style={panelStyle}>
					<h3 style={{ margin: "0 0 8px", fontSize: "0.875rem" }}>使用例</h3>
					<pre
						style={{
							margin: 0,
							fontSize: "0.75rem",
							fontFamily: FONT_MONO,
							whiteSpace: "pre-wrap",
							color: COLORS.text,
						}}
					>
						{expression.example}
					</pre>
				</div>
			)}
		</div>
	);
}
