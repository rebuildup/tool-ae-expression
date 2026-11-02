import { BookOpen, Heart, Search, Settings, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { writeSavedExpressions } from "./ae-expression-storage";
import {
	COLORS,
	FONT_SANS,
	ICON_SIZE,
	activeButtonStyle,
	buttonStyle,
	inputStyle,
	panelStyle,
	selectStyle,
} from "./ae-expression-theme";
import type { ExportFormat, SavedExpression } from "./ae-expression-types";

interface ExpressionControlsProps {
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	selectedCategory: string;
	setSelectedCategory: (value: string) => void;
	selectedDifficulty: string;
	setSelectedDifficulty: (value: string) => void;
	showFavoritesOnly: boolean;
	setShowFavoritesOnly: (value: boolean) => void;
	showAdvancedSettings: boolean;
	setShowAdvancedSettings: (value: boolean) => void;
	exportFormat: ExportFormat;
	setExportFormat: (value: ExportFormat) => void;
	showDocumentation: boolean;
	setShowDocumentation: (value: boolean) => void;
	savedExpressions: SavedExpression[];
	setSavedExpressions: Dispatch<SetStateAction<SavedExpression[]>>;
}

export function ExpressionControls(props: ExpressionControlsProps) {
	const deleteSaved = (id: string) => {
		const updated = props.savedExpressions.filter((saved) => saved.id !== id);
		props.setSavedExpressions(updated);
		writeSavedExpressions(updated);
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "16px",
					alignItems: "center",
				}}
			>
				<div style={{ position: "relative", flex: 1, minWidth: "16rem" }}>
					<Search
						size={ICON_SIZE}
						style={{
							position: "absolute",
							left: "12px",
							top: "50%",
							transform: "translateY(-50%)",
							color: COLORS.subtle,
							pointerEvents: "none",
						}}
					/>
					<input
						type="text"
						placeholder="エクスプレッション、タグ、テンプレートを検索..."
						value={props.searchTerm}
						onChange={(e) => props.setSearchTerm(e.target.value)}
						aria-label="エクスプレッション、タグ、テンプレートを検索"
						style={{ ...inputStyle, paddingLeft: "40px", paddingRight: "16px" }}
					/>
				</div>
				<select
					value={props.selectedCategory}
					onChange={(e) => props.setSelectedCategory(e.target.value)}
					style={selectStyle}
					aria-label="カテゴリで絞り込み"
				>
					<option value="all">全カテゴリ</option>
					<option value="animation">アニメーション</option>
					<option value="effect">エフェクト</option>
					<option value="transform">変形</option>
					<option value="utility">ユーティリティ</option>
				</select>
				<select
					value={props.selectedDifficulty}
					onChange={(e) => props.setSelectedDifficulty(e.target.value)}
					style={selectStyle}
					aria-label="難易度で絞り込み"
				>
					<option value="all">全難易度</option>
					<option value="beginner">初級</option>
					<option value="intermediate">中級</option>
					<option value="advanced">上級</option>
				</select>
				<button
					type="button"
					onClick={() => props.setShowFavoritesOnly(!props.showFavoritesOnly)}
					style={props.showFavoritesOnly ? activeButtonStyle : buttonStyle}
					aria-pressed={props.showFavoritesOnly}
				>
					<Heart size={ICON_SIZE} />
					お気に入りのみ
				</button>
				<button
					type="button"
					onClick={() =>
						props.setShowAdvancedSettings(!props.showAdvancedSettings)
					}
					style={buttonStyle}
					aria-pressed={props.showAdvancedSettings}
				>
					<Settings size={ICON_SIZE} />
					詳細設定
				</button>
			</div>
			{props.showAdvancedSettings && (
				<div
					style={{
						...panelStyle,
						display: "flex",
						flexDirection: "column",
						gap: "16px",
					}}
				>
					<h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 500 }}>
						詳細設定
					</h3>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
							gap: "16px",
						}}
					>
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<label
								htmlFor="export-format"
								style={{ fontSize: "0.875rem", fontFamily: FONT_SANS }}
							>
								エクスポート形式
							</label>
							<select
								id="export-format"
								value={props.exportFormat}
								onChange={(e) =>
									props.setExportFormat(e.target.value as ExportFormat)
								}
								style={inputStyle}
							>
								<option value="txt">テキスト (.txt)</option>
								<option value="jsx">JSX (.jsx)</option>
								<option value="json">JSON (.json)</option>
							</select>
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<h4 style={{ margin: 0, fontSize: "0.875rem", fontFamily: FONT_SANS }}>
								表示オプション
							</h4>
							<button
								type="button"
								onClick={() =>
									props.setShowDocumentation(!props.showDocumentation)
								}
								style={props.showDocumentation ? activeButtonStyle : buttonStyle}
								aria-pressed={props.showDocumentation}
							>
								<BookOpen size={ICON_SIZE} />
								ドキュメント
							</button>
						</div>
					</div>
					{props.savedExpressions.length > 0 && (
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<h4 style={{ margin: 0, fontSize: "0.875rem", fontFamily: FONT_SANS }}>
								保存済みエクスプレッション
							</h4>
							<div
								style={{
									maxHeight: "8rem",
									overflowY: "auto",
									borderRadius: "8px",
									padding: "8px",
									display: "flex",
									flexDirection: "column",
									gap: "4px",
									background: COLORS.surfaceMuted,
								}}
							>
								{props.savedExpressions.map((saved) => (
									<div
										key={saved.id}
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											gap: "8px",
											padding: "8px",
											borderRadius: "8px",
										}}
									>
										<span
											style={{
												fontSize: "0.875rem",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{saved.name}
										</span>
										<button
											type="button"
											onClick={() => deleteSaved(saved.id)}
											style={{
												display: "inline-flex",
												alignItems: "center",
												background: "none",
												border: "none",
												padding: "4px",
												cursor: "pointer",
												color: COLORS.muted,
											}}
											aria-label={`保存済み「${saved.name}」を削除`}
										>
											<Trash2 size={ICON_SIZE} />
										</button>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
