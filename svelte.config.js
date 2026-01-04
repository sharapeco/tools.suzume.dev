import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$lib: path.resolve("./src/lib"),
			$components: path.resolve("./src/components"),
		},
	},
	preprocess: vitePreprocess(),
};

export default config;
