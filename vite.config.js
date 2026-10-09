import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ["codemirror", "@codemirror/basic-setup"],
	},
	define: {
		"process.env.TIMING": false,
	},
	test: {
		include: ["src/**/*.test.js"],
		environment: "node",
	},
});
