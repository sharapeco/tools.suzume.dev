import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ["codemirror", "@codemirror/basic-setup"],
	},
	define: {
		"process.env.TIMING": false,
	},
});
