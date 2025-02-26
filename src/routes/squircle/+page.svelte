<script>
	import SquircleControls from "./SquircleControls.svelte";
	import SquirclePreview from "./SquirclePreview.svelte";
	import { tools } from "../../tool-list";
	import SimpleToolLayout from "../../components/SimpleToolLayout.svelte";

	const tool = tools.find((t) => t.route === "/squircle");

	/** @typedef {import("./params").Params} Params */
	/** @type {Params} */
	let params = {
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
	};
</script>

<svelte:head>
	<title>{tool.title}</title>
</svelte:head>

<SimpleToolLayout title={tool.title}>
	<svelte:fragment slot="description">
		<p class="mt-2">
			クロソイド曲線や、スーパー楕円を用いた角丸図形のSVGを生成します。
		</p>
	</svelte:fragment>

	<div class="layout">
		<div class="controls">
			<SquircleControls bind:params />
		</div>
		<div class="preview bg-slate-50 rounded-lg p-4">
			<SquirclePreview {params} />
		</div>
	</div>
</SimpleToolLayout>

<style>
	.layout {
		display: grid;
		grid-template-columns: 300px 1fr;
		grid-template-rows: 1fr;
		gap: 2rem;
	}

	.preview {
		position: sticky;
		top: 2rem;
		height: calc(100vh - 232px);
		flex: 1;
		overflow: hidden;
	}
</style>
