import { BookOpen, Heart, Info, Star } from "lucide-react";
import { CATEGORY_NAMES, DIFFICULTY_NAMES } from "./ae-expression-data";
import {
	COLORS,
	FONT_SANS,
	ICON_SIZE,
	inputStyle,
	panelStyle,
} from "./ae-expression-theme";
import type { AEExpression, ParameterValue } from "./ae-expression-types";

interface ExpressionParametersProps {
	expression: AEExpression | null;
	values: Record<string, ParameterValue>;
	showDocumentation: boolean;
	onToggleDocumentation: () => void;
	onToggleFavorite: (id: string) => void;
	onUpdateParameter: (name: string, value: ParameterValue) => void;
}

export function ExpressionParameters({
	expression,
	values,
	showDocumentation,
	onToggleDocumentation,
	onToggleFavorite,
	onUpdateParameter,
}: ExpressionParametersProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<h2 style={{ margin: 0, fontSize: "1.25rem", fontFamily: FONT_SANS }}>
				パラメータ設定
			</h2>
			{expression ? (
				<div
					style={{
						...panelStyle,
						display: "flex",
						flexDirection: "column",
						gap: "16px",
					}}
				>
					<div style={{ marginBottom: "4px" }}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: "8px",
								marginBottom: "8px",
							}}
						>
							<h3
								style={{
									margin: 0,
									fontSize: "1.125rem",
									fontWeight: 500,
									display: "flex",
									alignItems: "center",
									gap: "8px",
								}}
							>
								{expression.name}
								{expression.isFavorite && (
									<Star size={ICON_SIZE} style={{ color: COLORS.accent }} />
								)}
							</h3>
							<div style={{ display: "flex", gap: "8px" }}>
								<button
									type="button"
									onClick={() => onToggleFavorite(expression.id)}
									style={{
										padding: "8px",
										display: "inline-flex",
										alignItems: "center",
										background: "none",
										border: "none",
										cursor: "pointer",
										color: expression.isFavorite ? COLORS.danger : COLORS.muted,
									}}
									aria-label={
										expression.isFavorite
											? "お気に入りから削除"
											: "お気に入りに追加"
									}
								>
									<Heart size={ICON_SIZE} />
								</button>
								<button
									type="button"
									onClick={onToggleDocumentation}
									style={{
										padding: "8px",
										display: "inline-flex",
										alignItems: "center",
										background: "none",
										border: "none",
										cursor: "pointer",
										color: COLORS.muted,
									}}
									aria-label={
										showDocumentation
											? "ドキュメントを隠す"
											: "ドキュメントを表示"
									}
								>
									<Info size={ICON_SIZE} />
								</button>
							</div>
						</div>
						<p
							style={{
								margin: "0 0 8px",
								fontSize: "0.875rem",
								lineHeight: 1.8,
								color: COLORS.muted,
							}}
						>
							{expression.description}
						</p>
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: "16px",
								fontSize: "0.75rem",
								color: COLORS.muted,
							}}
						>
							<span>難易度: {DIFFICULTY_NAMES[expression.difficulty]}</span>
							<span>カテゴリ: {CATEGORY_NAMES[expression.category]}</span>
							{!!expression.usageCount && (
								<span>使用回数: {expression.usageCount}</span>
							)}
						</div>
					</div>
					{showDocumentation && expression.documentation && (
						<div
							style={{
								...panelStyle,
								padding: "16px",
								marginBottom: "4px",
								background: COLORS.surfaceMuted,
							}}
						>
							<h4
								style={{
									margin: "0 0 8px",
									fontSize: "0.875rem",
									fontWeight: 500,
									display: "flex",
									alignItems: "center",
									gap: "8px",
								}}
							>
								<BookOpen size={ICON_SIZE} />
								詳細ドキュメント
							</h4>
							<p
								style={{
									margin: 0,
									fontSize: "0.875rem",
									lineHeight: 1.8,
									color: COLORS.muted,
								}}
							>
								{expression.documentation}
							</p>
							{expression.tags && (
								<div style={{ marginTop: "12px" }}>
									<span style={{ fontSize: "0.75rem" }}>タグ: </span>
									<div
										style={{
											display: "flex",
											flexWrap: "wrap",
											gap: "4px",
											marginTop: "4px",
										}}
									>
										{expression.tags.map((tag) => (
											<span
												key={tag}
												style={{
													fontSize: "0.75rem",
													padding: "4px 8px",
													borderRadius: "4px",
													background: COLORS.surface,
													color: COLORS.muted,
												}}
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					)}
					<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
						{expression.parameters.map((param) => (
							<div
								key={param.name}
								style={{ display: "flex", flexDirection: "column", gap: "8px" }}
							>
								<label
									style={{
										fontSize: "0.875rem",
										display: "flex",
										alignItems: "center",
										gap: "8px",
									}}
								>
									{param.name}
									{param.unit && (
										<span style={{ fontSize: "0.75rem", color: COLORS.muted }}>
											({param.unit})
										</span>
									)}
								</label>
								<p
									style={{
										margin: 0,
										fontSize: "0.75rem",
										lineHeight: 1.7,
										color: COLORS.muted,
									}}
								>
									{param.description}
								</p>
								{param.type === "number" && (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: "8px",
										}}
									>
										<input
											type="range"
											min={param.min}
											max={param.max}
											step={param.step}
											value={Number(
												values[param.name] ?? param.defaultValue,
											)}
											onChange={(e) =>
												onUpdateParameter(
													param.name,
													parseFloat(e.target.value),
												)
											}
											style={{ width: "100%" }}
											aria-label={`${param.name}（範囲）`}
										/>
										<input
											type="number"
											min={param.min}
											max={param.max}
											step={param.step}
											value={Number(
												values[param.name] ?? param.defaultValue,
											)}
											onChange={(e) =>
												onUpdateParameter(
													param.name,
													parseFloat(e.target.value),
												)
											}
											style={inputStyle}
											aria-label={`${param.name}（数値）`}
										/>
									</div>
								)}
								{param.type === "select" && (
									<select
										value={String(values[param.name] ?? param.defaultValue)}
										onChange={(e) =>
											onUpdateParameter(param.name, e.target.value)
										}
										style={inputStyle}
										aria-label={`${param.name}を選択`}
									>
										{param.options?.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</select>
								)}
								{param.type === "boolean" && (
									<label
										style={{
											display: "flex",
											alignItems: "center",
											gap: "8px",
										}}
									>
										<input
											type="checkbox"
											checked={Boolean(
												values[param.name] ?? param.defaultValue,
											)}
											onChange={(e) =>
												onUpdateParameter(param.name, e.target.checked)
											}
											style={{ width: ICON_SIZE, height: ICON_SIZE }}
											aria-label={`${param.name}を有効にする`}
										/>
										<span style={{ fontSize: "0.875rem" }}>有効</span>
									</label>
								)}
								{param.type === "string" && (
									<input
										type="text"
										value={String(values[param.name] ?? param.defaultValue)}
										onChange={(e) =>
											onUpdateParameter(param.name, e.target.value)
										}
										style={inputStyle}
										aria-label={`${param.name}を入力`}
									/>
								)}
							</div>
						))}
					</div>
				</div>
			) : (
				<div style={{ ...panelStyle, padding: "32px", textAlign: "center" }}>
					<p style={{ margin: 0, color: COLORS.muted, fontFamily: FONT_SANS }}>
						左側からエクスプレッションを選択してください
					</p>
				</div>
			)}
		</div>
	);
}
