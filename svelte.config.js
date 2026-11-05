import fs from "node:fs";
import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import path from "path";

/**
 * static/ の直下にあるものを Cloudflare Pages Functions の対象外にする。
 * ディレクトリは "/<dir>/*" の1ルールにまとめる。
 * （既定の "<files>" はファイルごとに1ルールになり、unicode-names の数百ファイルで
 *   _routes.json の上限 100 件を超えてしまうため）
 */
const staticExcludes = fs
	.readdirSync("static", { withFileTypes: true })
	.filter((entry) => !entry.name.startsWith("."))
	.map((entry) =>
		entry.isDirectory() ? `/${entry.name}/*` : `/${entry.name}`,
	);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			routes: {
				include: ["/*"],
				exclude: ["<build>", "<prerendered>", ...staticExcludes],
			},
		}),
		alias: {
			$lib: path.resolve("./src/lib"),
			$components: path.resolve("./src/components"),
			$assets: path.resolve("./src/assets"),
			$actions: path.resolve("./src/actions"),
			$utils: path.resolve("./src/utils"),
		},
	},
	preprocess: vitePreprocess(),
};

export default config;
