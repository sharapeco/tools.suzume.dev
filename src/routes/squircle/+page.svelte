<script>
import SquircleControls from "./SquircleControls.svelte";
import SquirclePreview from "./SquirclePreview.svelte";
import { tools } from "../../tool-list";
import SimpleToolLayout from "../../components/SimpleToolLayout.svelte";

/** @typedef {import("../../tool-list").Tool} Tool */

/** @type {Tool|undefined} */
const tool = tools.find((t) => t.route === "/squircle");
if (!tool) {
	throw new Error("Tool not found");
}

/** @typedef {import("./params").Params} Params */
/** @type {Params} */
let params = $state({
	type: "clothoid",
	dpi: 300,
	unit: "px",
	width: 200,
	height: 200,
	color: "#000000",
	// クロソイド用
	radius: 40,
	borderOffset: 1.5,
	tension: 0.8,
	// スーパー楕円用
	power: 3,
});
</script>

<svelte:head>
	<title>{tool.title}</title>
</svelte:head>

<SimpleToolLayout title={tool.title} minHeight100percent>
	{#snippet description()}
		<p class="mt-2">
			クロソイド曲線や、スーパー楕円を用いた（3次ベジエ曲線による近似）角丸図形のSVGを生成します。
		</p>
	{/snippet}

	<div class="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
		<div class="controls">
			<SquircleControls bind:params />
		</div>
		<div
			class="preview bg-slate-50 rounded-lg p-4 sticky top-8 overflow-hidden"
		>
			<SquirclePreview {params} />
		</div>
	</div>
</SimpleToolLayout>
