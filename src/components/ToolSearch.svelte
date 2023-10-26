<script>
	import { onMount } from "svelte";
	import { clickOutside } from "$lib/clickOutside.js";
	import { getKey } from "$lib/eventUtil.js";

	/** @type {import('../$types.d.ts').ToolDef[]} */
	export let tools;

	const isMac = true;

	/** @type {HTMLInputElement|null} */
	let inputRef = null;

	let open = false;

	let selectedIndex = 0;

	let q = "";
	$: results = tools.filter(
		(tool) => !tool.disabled && (q === "" || tool.route.toLocaleLowerCase().includes(q))
	);

	onMount(() => {
		document.addEventListener("keydown", (event) => {
			const key = getKey(event);
			if ((!isMac && key === "ctrl+/") || (isMac && key === "meta+/")) {
				event.preventDefault();
				inputRef && inputRef.focus();
			}
		});
	});

	/**
	 * @param {KeyboardEvent} event
	 */
	function keydownHandler(event) {
		const key = getKey(event);
		switch (key) {
			case 'ArrowDown':
				event.preventDefault();
				if (selectedIndex === results.length - 1) {
					selectedIndex = 0;
				} else {
					selectedIndex = selectedIndex + 1;
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (selectedIndex === 0) {
					selectedIndex = results.length - 1;
				} else {
					selectedIndex = selectedIndex - 1;
				}
				break;
			case 'Enter':
				event.preventDefault();
				if (results[selectedIndex]) {
					location.href = results[selectedIndex].route;
				}
				break;
		}
	}
</script>

<div class="relative" use:clickOutside on:click_outside={() => (open = false)}>
	<input
		type="text"
		class="text-sm rounded border px-3 py-2 bg-slate-50"
		placeholder="ツールを検索（{isMac ? '⌘' : 'Ctrl'}+/）"
		on:focus={() => (open = true)}
		on:input={() => inputRef && (q = inputRef.value)}
		on:keydown={keydownHandler}
		bind:this={inputRef}
	/>
	{#if open}
		<div
			class="absolute top-full left-0 right-0 mt-1 p-1 bg-white rounded border shadow-md"
		>
			{#each results as tool, index}
				<a
					href={tool.route}
					class="block px-3 py-2 rounded text-sm
						{index === selectedIndex ? 'text-white bg-blue-500' : 'text-gray-500 hover:bg-gray-100'}
					"
					on:mouseenter={() => (selectedIndex = index)}
					on:click={() => (open = false)}
				>
					{tool.title}
				</a>
			{/each}
			{#if results.length === 0}
				<div class="px-3 py-2 text-sm text-gray-400">見つかりません</div>
			{/if}
		</div>
	{/if}
</div>
