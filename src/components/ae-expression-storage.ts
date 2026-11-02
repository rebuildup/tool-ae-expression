import type { SavedExpression } from "./ae-expression-types";

const STORAGE_KEY = "ae-expressions-saved:v1";

/**
 * In-memory fallback store.
 *
 * The tool is embedded by the host in an iframe whose sandbox does NOT
 * include `allow-same-origin`, so the framed document runs in an opaque
 * origin and every storage access throws a `SecurityError`. The fallback
 * keeps the saved-expressions feature usable for the lifetime of the
 * frame instead of failing the whole interaction.
 */
const memoryFallback = new Map<string, string>();

function getStore(): Storage | null {
	try {
		if (typeof window === "undefined") return null;
		return window.localStorage;
	} catch {
		return null;
	}
}

/**
 * Reads the persisted expressions.
 *
 * Never throws: a missing value, an unreadable store and a malformed
 * payload all resolve to an empty list.
 */
export function readSavedExpressions(): SavedExpression[] {
	const store = getStore();
	if (!store) {
		return parseSavedExpressions(memoryFallback.get(STORAGE_KEY) ?? null);
	}

	try {
		const raw = store.getItem(STORAGE_KEY);
		if (raw === null) {
			return parseSavedExpressions(memoryFallback.get(STORAGE_KEY) ?? null);
		}
		return parseSavedExpressions(raw);
	} catch (error) {
		console.error("Failed to read saved expressions:", error);
		return parseSavedExpressions(memoryFallback.get(STORAGE_KEY) ?? null);
	}
}

/**
 * Persists the expressions.
 *
 * Writes to `localStorage` when it is reachable and always mirrors the
 * value into the in-memory fallback, so a later read in the same frame
 * still sees it when the store is unavailable.
 */
export function writeSavedExpressions(expressions: SavedExpression[]): void {
	const payload = JSON.stringify(expressions);
	memoryFallback.set(STORAGE_KEY, payload);

	const store = getStore();
	if (!store) return;

	try {
		store.setItem(STORAGE_KEY, payload);
	} catch (error) {
		console.error("Failed to persist saved expressions:", error);
	}
}

function parseSavedExpressions(raw: string | null): SavedExpression[] {
	if (!raw) return [];

	try {
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed as SavedExpression[];
	} catch (error) {
		console.error("Failed to parse saved expressions:", error);
		return [];
	}
}
