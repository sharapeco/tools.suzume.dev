<script>
	export let data;
</script>

<svelte:head>
	<title>スズメツールズ</title>
</svelte:head>

<div class="mb-5 py-5 md:py-10 bg-slate-100 rounded-lg">
	<div class="flex justify-center items-center max-w-screen-2xl px-4 md:px-8">
		<div class="mr-3 w-20 md:mr-5 md:w-24">
			<img alt="" src="https://images.unsplash.com/photo-1507477338202-487281e6c27e?auto=format&fit=crop&q=90&w=192&h=192" width="96" height="96" class="rounded-full" />
		</div>
		<div>
			<h1 class="text-2xl md:text-3xl font-bold">スズメツールズ</h1>
			<p class="palt text-sm md:text-md text-gray-500">小ぶりで、チュンとしたツール</p>
		</div>
	</div>
</div>

<div class="grid gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
	{#each data.tools as tool}
		{#if !tool.disabled}
			<a
				href={tool.route}
				class="group flex gap-4 md:gap-6 rounded-lg border p-4 md:p-6"
			>
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg md:h-14 md:w-14 md:rounded-xl
						bg-indigo-500 transition duration-100 group-hover:bg-indigo-600
					 text-white shadow-lg"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
						/>
					</svg>
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
