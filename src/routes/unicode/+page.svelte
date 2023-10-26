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

		if (/^\s*(U\+[0-9a-f]{4}\s+)*U\+[0-9a-f]{4}\s*$/i.test(input)) {
			for (const codeString of input.replace(/^\s+|\s+$/g, "").split(/\s+/)) {
				const hex = codeString.replace(/^U\+/i, "").toUpperCase();
				const codePoint = parseInt(hex, 16);
				const letter = String.fromCodePoint(codePoint);
				newResults.push({
					letter,
					code: `U+${hex}`,
					link: `https://www.compart.com/en/unicode/U+${hex}`,
				});
			}
		} else {
			for (const letter of input.split("")) {
				const codePoint = letter.charCodeAt(0);
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

<main>
	<h1 class="text-gray-800 mb-4 text-3xl font-bold">Unicode文字情報</h1>

	<input
		name="input"
		type="text"
		class="w-full text-sm bg-slate-50 rounded border px-3 py-2"
		placeholder="文字やコードポイントを入力..."
		autofocus
		on:input={() => inputRef && update(inputRef.value)}
		bind:this={inputRef}
	/>

	<div class="mt-3 flex flex-wrap gap-1">
		{#each results as result}
			<a href={result.link} class="flex flex-col p-2 rounded hover:bg-blue-50">
				<div class="font-serif text-4xl text-center">{result.letter}</div>
				<div class="mt-2 font-mono text-xs text-center text-gray-500">
					{result.code}
				</div>
			</a>
		{/each}
	</div>
</main>