<script>
	import "../app.css";
	import ToolSearch from "../components/ToolSearch.svelte";

	/** @type {import('../$types.d.ts').PageData} */
	export let data;
</script>

<svelte:head />

<div class="bg-white lg:pb-12">
	<div class="mx-auto max-w-screen-2xl px-4 md:px-8">
		<header class="md:flex items-center justify-between py-4 md:py-8">
			<a href="/" class="group inline-flex items-center gap-1 text-base md:text-lg font-bold text-black palt" aria-label="logo">
				<div class="inline-block w-6 h-6 text-indigo-500 group-hover:text-indigo-600 transition-colors">
					<svg width="24" height="24" viewBox="0 0 24 24" class="w-full">
						<circle cx="12" cy="12" r="12" fill="currentColor" />
					</svg>
				</div>
				スズメツールズ
			</a>

			<nav class="gap-4 md:flex">
				<ToolSearch tools={data.tools} />

				<a
					href="/tos"
					class="inline-flex items-center gap-1 -mr-2 py-1 px-2 text-sm font-semibold text-indigo-500 hover:text-indigo-600"
				>
					利用規約
				</a>
			</nav>
		</header>

		<slot />
	</div>
</div>
