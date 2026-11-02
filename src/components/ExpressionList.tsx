import { Heart, Search, Star } from "lucide-react";
import { CATEGORY_NAMES, DIFFICULTY_NAMES } from "./ae-expression-data";
import {
	COLORS,
	DIFFICULTY_COLORS,
	FONT_SANS,
	ICON_SIZE,
	panelStyle,
} from "./ae-expression-theme";
import type { AEExpression } from "./ae-expression-types";

interface ExpressionListProps {
	expressions: AEExpression[];
	selectedExpression: AEExpression | null;
	onSelect: (expression: AEExpression) => void;
	onToggleFavorite: (id: string) => void;
}

export function ExpressionList({
	expressions,
	selectedExpression,
	onSelect,
	onToggleFavorite,
}: ExpressionListProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<h2 style={{ margin: 0, fontSize: "1.25rem", fontFamily: FONT_SANS }}>
				エクスプレッション一覧
			</h2>
			<div
				style={{
					...panelStyle,
					display: "flex",
					flexDirection: "column",
					gap: "12px",
					maxHeight: "24rem",
					overflowY: "auto",
				}}
			>
				{expressions.map((expr) => {
					const isSelected = selectedExpression?.id === expr.id;

					return (
						<div
							key={expr.id}
							style={{
								padding: "12px",
								borderRadius: "8px",
								cursor: "pointer",
								transition: "background-color 200ms ease",
								background: isSelected ? COLORS.surfaceMuted : "transparent",
								border: `1px solid ${isSelected ? COLORS.borderStrong : "transparent"}`,
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "flex-start",
									justifyContent: "space-between",
									gap: "8px",
									marginBottom: "8px",
								}}
							>
								<div
									style={{ flex: 1, minWidth: 0 }}
									tabIndex={0}
									role="button"
									onClick={() => onSelect(expr)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											onSelect(expr);
										}
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											flexWrap: "wrap",
											gap: "8px",
											marginBottom: "4px",
										}}
									>
										<span
											style={{
												fontSize: "0.75rem",
												borderRadius: "8px",
												padding: "4px 8px",
												background: COLORS.surfaceMuted,
												color: COLORS.muted,
											}}
										>
											{CATEGORY_NAMES[expr.category]}
										</span>
										<span
											style={{
												fontSize: "0.75rem",
												padding: "4px 8px",
												borderRadius: "8px",
												...DIFFICULTY_COLORS[expr.difficulty],
											}}
										>
											{DIFFICULTY_NAMES[expr.difficulty]}
										</span>
										{!!expr.usageCount && (
											<span style={{ fontSize: "0.75rem", color: COLORS.muted }}>
												使用回数: {expr.usageCount}
											</span>
										)}
									</div>
									<h3
										style={{
											margin: 0,
											fontSize: "0.875rem",
											fontWeight: 500,
											display: "flex",
											alignItems: "center",
											gap: "8px",
										}}
									>
										{expr.name}
										{expr.isFavorite && (
											<Star size={12} style={{ color: COLORS.accent }} />
										)}
									</h3>
									<p
										style={{
											margin: "4px 0 0",
											fontSize: "0.75rem",
											lineHeight: 1.7,
											color: COLORS.muted,
										}}
									>
										{expr.description}
									</p>
									{expr.tags && (
										<div
											style={{
												display: "flex",
												flexWrap: "wrap",
												gap: "4px",
												marginTop: "8px",
											}}
										>
											{expr.tags.slice(0, 3).map((tag) => (
												<span
													key={tag}
													style={{
														fontSize: "0.75rem",
														padding: "2px 4px",
														borderRadius: "4px",
														background: COLORS.surfaceMuted,
														color: COLORS.muted,
													}}
												>
													{tag}
												</span>
											))}
											{expr.tags.length > 3 && (
												<span style={{ fontSize: "0.75rem", color: COLORS.subtle }}>
													+{expr.tags.length - 3}
												</span>
											)}
										</div>
									)}
								</div>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										onToggleFavorite(expr.id);
									}}
									style={{
										marginLeft: "8px",
										padding: "4px",
										display: "inline-flex",
										alignItems: "center",
										background: "none",
										border: "none",
										cursor: "pointer",
										color: expr.isFavorite ? COLORS.danger : COLORS.muted,
									}}
									aria-label={
										expr.isFavorite ? "お気に入りから削除" : "お気に入りに追加"
									}
								>
									<Heart size={ICON_SIZE} />
								</button>
							</div>
						</div>
					);
				})}
				{expressions.length === 0 && (
					<div
						style={{
							textAlign: "center",
							padding: "32px 0",
							color: COLORS.muted,
						}}
					>
						<Search
							size={32}
							style={{ display: "block", margin: "0 auto 8px", color: COLORS.subtle }}
						/>
						<p style={{ margin: 0, fontSize: "0.875rem" }}>
							条件に一致するエクスプレッションが見つかりません
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
