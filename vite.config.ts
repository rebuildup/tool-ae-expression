import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Standalone build configuration.
 *
 * The host (`my-web-2026`) serves the built artefact from its own origin
 * under `/tools/ae-expression/app/` and frames it with
 * `sandbox="allow-scripts"`. With Vite's default base (`/`) every asset
 * reference in `dist/index.html` is root-absolute, so the document would
 * ask the host root for `/assets/index-<hash>.js` instead of the
 * artefact's own directory and the embedded app would never boot.
 *
 * `base: "./"` keeps every reference relative to the document URL, which
 * resolves correctly under the Tool's own path.
 */
export default defineConfig({
	base: "./",
	plugins: [react()],
	build: {
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: false,
	},
});
