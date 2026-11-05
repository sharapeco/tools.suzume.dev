<script>
import { onDestroy, onMount } from "svelte";
import { browser } from "$app/environment";
import { codeInlineClass, inputBaseClass } from "$components/inputClasses.js";
import SimpleToolLayout from "$components/SimpleToolLayout.svelte";
import { getKey } from "$lib/keyboard";
import { specialChars } from "$lib/text/specialChars";
import { decodeUnicodeNotation } from "$lib/text/unicodeNotation";
import { focusOnToolSelect } from "$utils/focusOnToolSelect";
import { getPlatform } from "$utils/platform";
import { charInfoLoader } from "$utils/unicodeCharInfo";
import CharInfoPanel from "./CharInfoPanel.svelte";

/** @typedef {{letter: string, cp: number, sp?: import("$lib/text/specialChars").SpecialChar, code: string, copied: boolean}} Result */

const platform = getPlatform();

/** @type {HTMLInputElement|null} */
let inputRef = $state(null);

focusOnToolSelect(() => inputRef);

/** @type {Array<Result>} */
let results = $state([]);

/** マウスポインタが乗っている文字。⌘/Ctrl+C の対象 */
let hoveredIndex = $state(-1);

/** 最後にポインタが乗った文字。固定していなければこれを詳細に表示する */
let previewIndex = $state(-1);

/** クリック／タップで固定した文字 */
let selectedIndex = $state(-1);

const panelIndex = $derived(selectedIndex >= 0 ? selectedIndex : previewIndex);
const panelResult = $derived(results[panelIndex]);

/** @type {import("$lib/unicode/charInfo").CharInfo|undefined} */
let info = $state(undefined);
let infoError = $state(false);

$effect(() => {
	const cp = panelResult?.cp;
	if (cp == null) {
		info = undefined;
		infoError = false;
		return;
	}

	infoError = false;
	// info を読むと依存関係になってしまうので、ローカル変数で判定する
	const cached = charInfoLoader.peek(cp);
	info = cached;
	if (cached) {
		return;
	}

	let cancelled = false;
	charInfoLoader
		.get(cp)
		.then((r) => {
			if (!cancelled) {
				info = r;
			}
		})
		.catch(() => {
			if (!cancelled) {
				infoError = true;
			}
		});
	return () => {
		cancelled = true;
	};
});

/**
 * @param {string} input
 */
function update(input) {
	/** @type {Result[]} */
	const newResults = [];

	const pInput = decodeUnicodeNotation(input);
	for (const letter of pInput) {
		const codePoint = letter.codePointAt(0);
		if (codePoint === undefined) {
			continue;
		}
		const hex = codePoint.toString(16).padStart(4, "0").toUpperCase();
		newResults.push({
			letter,
			cp: codePoint,
			sp: specialChars[codePoint],
			code: `U+${hex}`,
			copied: false,
		});
	}

	// 同じ位置に同じ文字が残っていれば、固定・プレビューを維持する
	const keep = (/** @type {number} */ index) =>
		index >= 0 && newResults[index]?.letter === results[index]?.letter
			? index
			: -1;
	selectedIndex = keep(selectedIndex);
	previewIndex = keep(previewIndex);
	hoveredIndex = keep(hoveredIndex);

	results = newResults;
	charInfoLoader.prefetch(newResults.map((r) => r.cp));
}

/**
 * @param {number} index
 */
function toggleSelect(index) {
	selectedIndex = selectedIndex === index ? -1 : index;
	previewIndex = index;
}

/**
 * @param {KeyboardEvent} event
 */
function keydownHandler(event) {
	const key = getKey(event);
	const isCopy =
		(platform !== "apple" && key === "ctrl+c") ||
		(platform === "apple" && key === "meta+c");

	if (isCopy) {
		handleKeyboardCopy(event);
	} else if (key === "Escape" && selectedIndex >= 0) {
		selectedIndex = -1;
	}
}

/**
 * @param {KeyboardEvent} event
 */
function handleKeyboardCopy(event) {
	const hovered = results[hoveredIndex];
	if (!hovered) {
		return;
	}

	event.preventDefault();
	navigator.clipboard.writeText(hovered.letter);

	results = results.map((result, index) => ({
		...result,
		copied: index === hoveredIndex,
	}));

	setTimeout(() => {
		results = results.map((result) => ({
			...result,
			copied: false,
		}));
	}, 1200);
}

onMount(() => {
	if (browser) {
		if (inputRef) {
			update(inputRef.value);
		}
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
		<div class="flex flex-col gap-2">
			<p>
				入力した文字のUnicodeコードポイントや、文字名・ブロック・注釈などの情報を表示します。
			</p>
			<p>
					文字のかわりに <code class={codeInlineClass}>U+XXXX</code>
					<code class={codeInlineClass}>\uXXXX</code>
					<code class={codeInlineClass}>\u&#123;XXXXX&#125;</code>
				の形式でコードポイントを入力することもできます。
			</p>
			<p>
				結果の文字にマウスポインタを合わせた状態で
				{platform === "apple" ? "⌘" : "Ctrl"}+C
				を押すと、その文字をクリップボードにコピーできます。
			</p>
		</div>
	{/snippet}

	<input
		name="input"
		type="text"
		class={inputBaseClass}
		placeholder="調べたい文字またはコードを入力..."
		aria-label="調べたい文字またはコード"
		oninput={() => inputRef && update(inputRef.value)}
		bind:this={inputRef}
	/>

	<div class="mt-3 flex flex-wrap gap-1">
		{#each results as result, index}
			<button
				type="button"
				class="flex flex-col p-2 rounded hover:bg-blue-50 relative"
				class:selected={index === selectedIndex}
				aria-pressed={index === selectedIndex}
				aria-label={result.code}
				onmouseenter={() => {
					hoveredIndex = index;
					previewIndex = index;
				}}
				onmouseleave={() => (hoveredIndex = -1)}
				onclick={() => toggleSelect(index)}
			>
				<div class="font-hiragino letter text-4xl text-center">
					{#if result.sp != null}
						<span class="sp sp-{result.sp.type}">{result.sp.label}</span>
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
			</button>
		{/each}
	</div>

	{#if panelResult}
		<CharInfoPanel
			letter={panelResult.letter}
			cp={panelResult.cp}
			sp={panelResult.sp}
			{info}
			error={infoError}
			pinned={selectedIndex >= 0}
			onUnpin={() => (selectedIndex = -1)}
		/>
	{:else if results.length > 0}
		<p class="mt-4 text-sm text-gray-500">
			マウスポインタを合わせるか、タップで詳細を表示
		</p>
	{/if}
</SimpleToolLayout>

<style lang="postcss">
	.copied {
		animation: copy-animation 1200ms ease;
		animation-fill-mode: both;
	}

	.selected {
		background-color: theme(colors.indigo.50);
		box-shadow: inset 0 0 0 2px theme(colors.indigo.400);
	}

	.letter {
		display: flex;
		justify-content: center;
		align-items: center;
		line-height: 1;
		min-height: 1.1em;
	}

	.sp {
		display: inline-flex;
		min-height: 2rem;
		min-width: 2rem;
		justify-content: center;
		align-items: center;
		line-height: 1;
		text-align: center;
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

	.sp-invisible,
	.sp-nbsp {
		padding: 0.2em;
		font-family: monospace;
		font-size: 35%;
		white-space: pre-line;
		border: dashed 1px;
	}

	.sp-invisible {
		color: theme(colors.amber.600);
	}

	.sp-nbsp {
		color: theme(colors.fuchsia.500);
	}
</style>
