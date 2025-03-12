<script>
	import { onDestroy, onMount } from "svelte";
	import { clickOutside } from "$lib/clickOutside.js";
	import { getKey } from "$lib/eventUtil.js";
	import { getPlatform } from "$lib/platform.js";
	import { browser } from "$app/environment";

	/** @type {import('../$types.d.ts').ToolDef[]} */
	export let tools;

	/** @type {string} */
	const platform = getPlatform();

	/** @type {HTMLInputElement|null} */
	// biome-ignore lint/style/useConst: Svelte で書き込みに用いるため
	let inputRef = null;

	// biome-ignore lint/style/useConst: Svelte で書き込みに用いるため
	let open = false;

	let selectedIndex = 0;

	/** @type {string} */
	// biome-ignore lint/style/useConst: Svelte で書き込みに用いるため
	let q = "";
	$: results = tools.filter(
		(tool) => !tool.disabled && (q === "" || tool.route.toLocaleLowerCase().includes(q))
	);

	if (browser) {
		onMount(() => {
			document.addEventListener("keydown", globalKeydownHandler);
		});
		onDestroy(() => {
			document.removeEventListener("keydown", globalKeydownHandler);
		});
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function globalKeydownHandler(event) {
		const key = getKey(event);
		if (
			(platform !== "apple" && key === "ctrl+/") ||
			(platform === "apple" && key === "meta+/")
		) {
			event.preventDefault();
			inputRef?.focus();
		}
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function keydownHandler(event) {
		const key = getKey(event);
		switch (key) {
			case "ArrowDown":
				event.preventDefault();
				if (selectedIndex >= results.length - 1) {
					selectedIndex = 0;
				} else {
					selectedIndex = selectedIndex + 1;
				}
				break;
			case "ArrowUp":
				event.preventDefault();
				if (selectedIndex <= 0) {
					selectedIndex = results.length - 1;
				} else {
					selectedIndex = selectedIndex - 1;
				}
				break;
			case "Enter":
				event.preventDefault();
				if (results[selectedIndex]) {
					location.href = results[selectedIndex].route;
				}
				break;
		}
	}

	/**
	 * 入力文字列部分をHTMLハイライトする
	 *
	 * @param {string} text
	 * @param {string} q
	 */
	function highlight(text, q) {
		if (q === "") {
			return text;
		}
		const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(escaped, "gi");
		return text.replace(regex, (match) => `<span class="font-bold">${match}</span>`);
	}
</script>

<div class="relative" use:clickOutside on:click_outside={() => (open = false)}>
	<input
		type="text"
		class="text-sm rounded border px-3 py-2 bg-slate-50 w-full"
		placeholder="ツールを検索{platform == null
			? ''
			: `（${platform === 'apple' ? '⌘' : 'Ctrl'}+/）`}"
		bind:value={q}
		bind:this={inputRef}
		on:focus={() => (open = true)}
		on:keydown={keydownHandler}
	/>
	{#if open}
		<div
			class="absolute z-40 top-full left-0 right-0 mt-1 p-1 bg-white rounded border shadow-md"
		>
			{#each results as tool, index}
				<a
					href={tool.route}
					class="block px-3 py-2 rounded text-sm leading-4
						{index === selectedIndex ? 'text-white bg-indigo-500' : 'text-gray-700 hover:bg-gray-100'}
					"
					on:mouseenter={() => (selectedIndex = index)}
					on:click={() => (open = false)}
				>
					<div class="">{tool.title}</div>
					<div class="mt-1 font-mono text-xs opacity-70">
						{@html highlight(tool.route, q)}
					</div>
				</a>
			{/each}
			{#if results.length === 0}
				<div class="px-3 py-2 text-sm text-gray-400">見つかりません</div>
			{/if}
		</div>
	{/if}
</div>
