<script>
	import "../app.css";
	import ToolSearch from "../components/ToolSearch.svelte";

	/** @type {import('../$types.d.ts').PageData} */
	export let data;
</script>

<svelte:head>
</svelte:head>

<div class="bg-white lg:pb-12">
	<div class="mx-auto max-w-screen-2xl px-4 md:px-8">
		<header class="flex items-center justify-between py-4 md:py-8">
			<a
				href="/"
				class="text-base md:text-lg font-bold text-black"
				aria-label="logo"
			>
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
