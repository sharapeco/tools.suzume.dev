<script>
	import TextFormattingCopy from "./TextFormattingCopy.svelte";
	import TextFormattingEditor from "./TextFormattingEditor.svelte";

	/*
	私用領域 [\u{E000}-\u{F8FF}\u{FFF80}-\u{FFFFF}\u{10FF80}-\u{10FFFF}]
	*/

	let input = "";

	/** @type {"edit" | "copy"} */
	let mode = "edit";

	function format() {}
</script>

<svelte:head>
	<title>テキスト整形</title>
	<meta name="description" content="DTPやWebページ向けのテキスト整形を行います" />
</svelte:head>

<main class="pt-2 pb-4 flex-1 flex flex-col">
	<header class="mb-4 sm:flex sm:items-baseline">
		<h1 class="text-gray-800 text-3xl leading-7 font-bold">テキスト整形</h1>
		<p class="mt-4 sm:my-0 sm:ml-4 text-gray-500">
			DTPやWebページ向けのテキスト整形を行います
		</p>
	</header>

	<div class="flex justify-end lg:-mt-12 mb-4">
		<div class="inline-flex rounded-md shadow-sm" role="group">
			<button
				type="button"
				class="
					px-4 py-2 text-sm font-medium border rounded-l-lg
					focus:z-10 focus:ring-2 focus:ring-blue-700
					{mode === 'edit'
					? 'text-white bg-indigo-500 border-indigo-600 hover:bg-indigo-500 hover:text-white'
					: 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:text-blue-700'}
				"
				on:click={() => (mode = "edit")}
			>
				入力
			</button>
			<button
				type="button"
				class="
					px-4 py-2 text-sm font-medium border rounded-r-lg
					focus:z-10 focus:ring-2 focus:ring-blue-700
					{mode === 'copy'
					? 'text-white bg-indigo-500 border-indigo-600 hover:bg-indigo-500 hover:text-white'
					: 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:text-blue-700'}
				"
				on:click={() => {
					format();
					mode = "copy";
				}}
			>
				整形結果
			</button>
		</div>
	</div>

	<div class="content border border-slate-200 rounded-lg flex">
		<div class="flex-1 flex flex-col">
			{#if mode === "edit"}
				<TextFormattingEditor {input} />
			{:else}
				<TextFormattingCopy {input} />
			{/if}
		</div>
		<div class="w-64 p-4 border-l border-slate-200 bg-slate-50">Options</div>
	</div>
</main>

<style lang="postcss">
	.content {
		height: calc(100vh - 248px);
		overflow: auto;
	}
</style>
