import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: [
			"codemirror",
			"@codemirror/basic-setup",
			"@codemirror/lint",
			"@textlint/kernel",
			"@textlint/textlint-plugin-text",
		],
	},
	define: {
		"process.env.TIMING": false,
	},
});
