<script>
	import { onMount } from "svelte";

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

		const pInput = input.replaceAll(
			/ *(?:\bU\+([0-9A-Fa-f]{4,6})\b|\\u([0-9A-Fa-f]{4})|\\u\{([0-9A-Fa-f]{1,6})\})/g,
			(_, c1, c2, c3) => {
				console.log('matched', c1, c2,c3);
				const hex = c1 ?? c2 ?? c3;
				const codePoint = parseInt(hex, 16);
				try {
					return String.fromCodePoint(codePoint);
				} catch {
					return '?';
				}
			}
		);
		for (const letter of pInput) {
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
		class="w-full bg-slate-50 rounded border px-3 py-2"
		placeholder="文字 / U+XXXX / &#92;uXXXX / &#92;u&#123;XXXXX&#125;"
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
