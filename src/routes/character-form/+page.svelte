<script>
import { onMount } from "svelte";
import { inputBaseClass } from "$components/inputClasses.js";
import ResultCopyableBox from "$components/ResultCopyableBox.svelte";
import ResultLabel from "$components/ResultLabel.svelte";
import SimpleToolLayout from "$components/SimpleToolLayout.svelte";
import { supersub } from "$lib/supersub";
import {
	hiraganaToKatakana,
	katakanaToHiragana,
	stripFullwidthForm,
	stripJISX0201Kana,
	toFullwidthForm,
	toJISX0201Kana,
} from "$lib/zenkaku";

/** @type {HTMLTextAreaElement|null} */
let inputRef = $state(null);

/** @type {string} 入力文字列 */
let input = $state("");

/**
 * @typedef {Object} Encoder
 * @property {string} name
 * @property {(input: string) => string|null} fn
 * @property {string} [description]
 */

/**
 * @typedef {Object} Result
 * @property {string} name
 * @property {(input: string) => string|null} fn
 * @property {string|null} output
 * @property {string|null} error
 *  @property {string} [description]
 */

/** @type {Encoder[]} */
const encoders = [
	{
		name: "上付き・下付き・ゐ・ゑ・小書きカナ",
		description:
			"^2 → ² / H_2O → H₂O​ / ^{235}U → ²³⁵U / ^い → ゐ / ^セ → セ゚ / _リ → ㇼ",
		fn: supersub,
	},
	{
		name: "カタカナに変換",
		fn: hiraganaToKatakana,
	},
	{
		name: "ひらがなに変換",
		fn: katakanaToHiragana,
	},
	{
		name: "JIS X 0201 カタカナの正規化",
		fn: stripJISX0201Kana,
	},
	{
		name: "JIS X 0201 カタカナ化",
		fn: toJISX0201Kana,
	},
	{
		name: "全角形を正規化",
		fn: stripFullwidthForm,
	},
	{
		name: "全角形に変換",
		fn: toFullwidthForm,
	},
	{
		name: "大文字に変換",
		fn: (input) => input.toLocaleUpperCase(),
	},
	{
		name: "小文字に変換",
		fn: (input) => input.toLocaleLowerCase(),
	},
];

/** @type {Result[]} */
let results = $derived(
	encoders.map((encoder) => {
		try {
			return {
				...encoder,
				output: encoder.fn(input),
				error: null,
			};
		} catch (error) {
			return {
				...encoder,
				output: null,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}),
);

onMount(() => {
	if (!inputRef) {
		return;
	}
	inputRef.value = localStorage.getItem("character-form.input") ?? "";
	update();
});

function update() {
	if (!inputRef) {
		return;
	}
	input = inputRef.value;
	localStorage.setItem("character-form.input", input);
}
</script>

<svelte:head>
	<title>文字種変換</title>
</svelte:head>

<SimpleToolLayout title="文字種変換">
	<textarea
		class={inputBaseClass}
		placeholder="文字列を入力..."
		oninput={update}
		bind:this={inputRef}
	></textarea>

	<div class="mt-5 md:columns-2 md:gap-8">
		{#each results as result, index}
			<section
				class="mb-3 break-inside-avoid"
				class:break-after-column={index === Math.ceil(results.length / 2) - 1}
			>
				<ResultLabel text={result.name} />
				<ResultCopyableBox
					name={result.name}
					value={result.output}
					error={result.error}
					breakClass="break-words"
				/>
				{#if result.description != null}
					<p class="mt-1 text-xs text-gray-500">{result.description}</p>
				{/if}
			</section>
		{/each}
	</div>
</SimpleToolLayout>
