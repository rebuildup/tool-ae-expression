/**
 * Clipboard access for the standalone build.
 *
 * The host frames the tool with `sandbox="allow-scripts"` and without
 * `allow-same-origin`. In that configuration `navigator.clipboard` is
 * either missing or rejects the write, so the tool needs a fallback that
 * does not depend on the async Clipboard API.
 */

/**
 * Copies `text` to the clipboard.
 *
 * Tries the async Clipboard API first and falls back to the synchronous
 * `document.execCommand("copy")` path. Resolves to `false` when neither
 * path succeeded, so the caller can report the failure instead of
 * pretending the copy worked.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
	try {
		if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch (error) {
		console.error("Failed to copy to clipboard:", error);
	}

	return copyWithExecCommand(text);
}

function copyWithExecCommand(text: string): boolean {
	if (typeof document === "undefined") return false;

	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.setAttribute("readonly", "");
	textarea.style.position = "fixed";
	textarea.style.top = "0";
	textarea.style.left = "0";
	textarea.style.width = "1px";
	textarea.style.height = "1px";
	textarea.style.padding = "0";
	textarea.style.border = "none";
	textarea.style.opacity = "0";

	document.body.appendChild(textarea);
	textarea.select();

	let copied = false;
	try {
		copied = document.execCommand("copy");
	} catch (error) {
		console.error("Failed to copy to clipboard:", error);
		copied = false;
	}

	document.body.removeChild(textarea);
	return copied;
}
