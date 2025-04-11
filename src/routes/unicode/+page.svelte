<script>
import { browser } from "$app/environment";
import { getKey } from "$lib/eventUtil";
import { getPlatform } from "$lib/platform";
import { onMount, onDestroy } from "svelte";
import { specialChars } from "../text-formatting/specialChars";
import SimpleToolLayout from "../../components/SimpleToolLayout.svelte";

/** @typedef {{letter: string, sp?: [string, string], code: string, link: string, copied: boolean}} Result */

const platform = getPlatform();

/** @type {HTMLInputElement|null} */
let inputRef = $state(null);

/** @type {Array<Result>} */
let results = $state([]);

/** @type {number} */
let hoveredIndex = $state(-1);

/**
 * @param {string} input
 */
function update(input) {
	const newResults = [];

	const pInput = input.replaceAll(
		/ *(?:\bU\+([0-9A-Fa-f]{4,6})\b|\\u([0-9A-Fa-f]{4})|\\u\{([0-9A-Fa-f]{1,6})\})/g,
		(_, c1, c2, c3) => {
			const hex = c1 ?? c2 ?? c3;
			const codePoint = Number.parseInt(hex, 16);
			try {
				return String.fromCodePoint(codePoint);
			} catch {
				return "?";
			}
		},
	);
	for (const letter of pInput) {
		const codePoint = letter.codePointAt(0);
		if (codePoint === undefined) {
			continue;
		}
		const hex = codePoint.toString(16).padStart(4, "0").toUpperCase();
		newResults.push({
			letter,
			sp: specialChars[codePoint],
			code: `U+${hex}`,
			link: `https://www.compart.com/en/unicode/U+${hex}`,
			copied: false,
		});
	}

	results = newResults;
}

/**
 * @param {KeyboardEvent} event
 */
function keydownHandler(event) {
	const key = getKey(event);
	if (
		(platform !== "apple" && key === "ctrl+c") ||
		(platform === "apple" && key === "meta+c")
	) {
		const hovered = results[hoveredIndex];
		if (hovered) {
			event.preventDefault();
			navigator.clipboard.writeText(hovered.letter);

			results = results.map((result, index) => ({
				...result,
				copied: index === hoveredIndex,
			}));

			setTimeout(() => {
				results = results.map((result, index) => ({
					...result,
					copied: false,
				}));
			}, 1200);
		}
	}
}

onMount(() => {
	if (browser) {
		inputRef && update(inputRef.value);
		document.addEventListener("keydown", keydownHandler);
	}
});

onDestroy(() => {
	if (browser) {
		document.removeEventListener("keydown", keydownHandler);
	}
});
</script>

<svelte:head>
	<title>Unicode文字情報</title>
</svelte:head>

<SimpleToolLayout title="Unicode文字情報">
	{#snippet description()}

			<p class="mt-2">
				入力した文字のUnicodeコードポイントや、その文字の情報へのリンクを提供します。
			</p>
			<p class="mt-2">
				文字のかわりに <code class="bg-slate-50 border border-slate-300 rounded p-1"
					>U+XXXX</code
				> <code class="bg-slate-50 border border-slate-300 rounded p-1">&#92;uXXXX</code>
				<code class="bg-slate-50 border border-slate-300 rounded p-1"
					>&#92;u&#123;XXXXX&#125;</code
				>
				の形式でコードポイントを入力することもできます。
			</p>
			<p class="mt-2">
				結果の文字にマウスポインタを合わせた状態で
				{platform === "apple" ? "⌘" : "Ctrl"}+C
				を押すと、その文字をクリップボードにコピーできます。
			</p>

	{/snippet}

	<input
		name="input"
		type="text"
		class="w-full bg-slate-50 rounded border px-3 py-2"
		placeholder="調べたい文字またはコードを入力..."
		autofocus
		oninput={() => inputRef && update(inputRef.value)}
		bind:this={inputRef}
	/>

	<div class="mt-3 flex flex-wrap gap-1">
		{#each results as result, index}
			<a
				href={result.link}
				class="flex flex-col p-2 rounded hover:bg-blue-50 relative"
				onmouseenter={() => (hoveredIndex = index)}
				onmouseleave={() => (hoveredIndex = -1)}
			>
				<div class="font-hiragino letter text-4xl text-center">
					{#if result.sp != null}
						<span class="sp sp-{result.sp[0]}">{result.sp[1]}</span>
					{:else}
						{result.letter}
					{/if}
				</div>
				<div class="mt-2 font-mono text-xs text-center text-gray-500">
					{result.code}
				</div>
				{#if result.copied}
					<div
						class="absolute top-full left-0 right-0 -mt-2 -mx-4 flex justify-center"
					>
						<div
							class="copied p-1 rounded-sm bg-indigo-500 text-white text-xs palt"
						>
							Copied!
						</div>
					</div>
				{/if}
			</a>
		{/each}
	</div>
</SimpleToolLayout>

<style lang="postcss">
	.copied {
		animation: copy-animation 1200ms ease;
		animation-fill-mode: both;
	}

	.letter {
		line-height: 1;
		min-height: 1.1em;
	}

	.sp {
		display: inline-block;
		vertical-align: middle;
		line-height: 1;
		opacity: 0.5;
	}

	.sp-control {
		padding: 0.2em;
		font-family: monospace;
		font-size: 40%;
		color: theme(colors.slate.700);
		border: dashed 1px;
	}

	.sp-undefined {
		padding: 0.2em;
		font-family: monospace;
		font-size: 40%;
		color: theme(colors.red.500);
		border: dashed 1px;
	}

	.sp-fullwidth {
		color: theme(colors.amber.300);
	}
</style>
