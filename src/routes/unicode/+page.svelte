<script>
	import { onMount } from 'svelte';

	/** @type {HTMLInputElement|null} */
	let inputRef = null;

	/**
	 * @type {Array<{letter: string, code: string, link: string}>}
	 */
	let results = [];

	/**
	 * @param {string} input
	 */
	function update(input) {
		const newResults = [];

		if (/^\s*(?:(?:U\+|\\u)[0-9a-f]{4}\b[\s-]*)+\s*$/i.test(input)) {
			for (const codeString of input.replace(/^\s+|\s+$/g, "").split(/\s+|(?=U\+|\\u)/)) {
				const hex = codeString.replace(/^(?:U\+|\\u)|[\s-]*$/ig, "").toUpperCase();
				const codePoint = parseInt(hex, 16);
				const letter = String.fromCodePoint(codePoint);
				newResults.push({
					letter,
					code: `U+${hex}`,
					link: `https://www.compart.com/en/unicode/U+${hex}`,
				});
			}
		} else {
			for (const letter of input) {
				const codePoint = letter.codePointAt(0);
				if (codePoint === undefined) {
					continue;
				}
				const hex = codePoint.toString(16).padStart(4, "0").toUpperCase();
				newResults.push({
					letter,
					code: `U+${hex}`,
					link: `https://www.compart.com/en/unicode/U+${hex}`,
				});
			}
		}

		results = newResults;
	}

	onMount(() => {
		inputRef && update(inputRef.value);
	});
</script>

<svelte:head>
	<title>Unicode文字情報</title>
</svelte:head>

<main class="pt-2 pb-3">
	<header class="mb-5">
		<h1 class="text-gray-800 text-3xl leading-7 font-bold">Unicode文字情報</h1>
	</header>

	<input
		name="input"
		type="text"
		class="w-full text-sm bg-slate-50 rounded border px-3 py-2"
		placeholder="文字や符号位置を入力..."
		autofocus
		on:input={() => inputRef && update(inputRef.value)}
		bind:this={inputRef}
	/>

	<div class="mt-3 flex flex-wrap gap-1">
		{#each results as result}
			<a href={result.link} class="flex flex-col p-2 rounded hover:bg-blue-50">
				<div class="font-hiragino text-4xl text-center">
					{result.letter}&#8203;
				</div>
				<div class="mt-2 font-mono text-xs text-center text-gray-500">
					{result.code}
				</div>
			</a>
		{/each}
	</div>
</main>
