<script>
let { data } = $props();
</script>

<svelte:head>
	<title>スズメツールズ</title>
	<meta property="og:type" content="website">
	<meta property="og:title" content="スズメツールズ">
	<meta property="og:description" content="小ぶりで、チュンとしたツール">
	<meta property="og:image" content="%sveltekit.assets%/ogp.jpg">
</svelte:head>

<div class="mb-5 py-5 md:py-10 bg-slate-100 rounded-lg">
	<div class="flex justify-center items-center max-w-screen-2xl px-4 md:px-8">
		<div class="mr-3 w-20 md:mr-5 md:w-24">
			<img alt="" src="https://images.unsplash.com/photo-1507477338202-487281e6c27e?auto=format&fit=crop&q=90&w=192&h=192" width="96" height="96" class="rounded-full" />
		</div>
		<div>
			<h1 class="text-2xl md:text-3xl leading-7 font-bold">スズメツールズ</h1>
			<p class="palt text-sm md:text-md text-gray-500">小ぶりで、チュンとしたツール</p>
		</div>
	</div>
</div>

<div class="grid gap-4 pb-4 lg:pb-7 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
	{#each data.tools as tool}
		{#if !tool.disabled}
			<a
				href={tool.route}
				class="group flex gap-4 md:gap-6 rounded-lg border p-4 md:p-6"
			>
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg md:h-14 md:w-14 md:rounded-xl
						bg-indigo-500 transition duration-100 group-hover:bg-indigo-600
					 text-2xl text-white shadow-lg"
				>
					{@html tool.icon}
				</div>

				<div>
					<h3 class="mb-1 text-lg leading-6 font-semibold md:text-xl">{tool.title}</h3>
					<p class="mb-2 text-sm font-mono text-gray-500">{tool.route}</p>
					<p class="text-gray-500">{tool.description ?? ""}</p>
				</div>
			</a>
		{/if}
	{/each}
</div>
