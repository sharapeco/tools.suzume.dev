<script>
import { Base64 } from "js-base64";
import { onMount } from "svelte";
import { browser } from "$app/environment";
import { inputBaseClass } from "$components/inputClasses.js";
import ResultCopyableBox from "$components/ResultCopyableBox.svelte";
import ResultLabel from "$components/ResultLabel.svelte";
import SimpleToolLayout from "$components/SimpleToolLayout.svelte";
import {
	convertToNumericCharacterReference,
	decodeHTMLEntities,
	encodeHTMLEntities as escapeHTMLReservedCharacters,
} from "$lib/htmlEntity";
import { NaiveTextEncoder } from "$lib/naiveTextEncoder/NaiveTextEncoder";
import { normalize } from "$lib/zenkaku";

/** @type {HTMLTextAreaElement|null} */
let inputRef = $state(null);

/** @type {string} 入力文字列 */
let input = $state("");

const sjisEncoder = browser && new NaiveTextEncoder("Shift_JIS", 2);
const sjisDecoder = browser && new TextDecoder("Shift_JIS");

const eucjpEncoder = browser && new NaiveTextEncoder("EUC-JP", 3);
const eucjpDecoder = browser && new TextDecoder("EUC-JP");

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
		name: "Base64 encode (UTF-8)",
		fn: (input) => Base64.encode(normalize(input)),
	},
	{
		name: "URL encode (UTF-8)",
		fn: (input) => encodeURIComponent(normalize(input)),
	},
	{
		name: "URL encode (Shift_JIS)",
		fn: (input) =>
			// @ts-expect-error ブラウザ前提のコード
			Array.from(sjisEncoder.encode(normalize(input)))
				.map((c) => `%${c.toString(16).toUpperCase()}`)
				.join(""),
	},
	{
		name: "URL encode (EUC-JP)",
		fn: (input) =>
			// @ts-expect-error ブラウザ前提のコード
			Array.from(eucjpEncoder.encode(normalize(input)))
				.map((c) => `%${c.toString(16).toUpperCase()}`)
				.join(""),
	},
	{
		name: "HTML予約文字をエスケープ",
		fn: escapeHTMLReservedCharacters,
	},
	{
		name: "数値実体参照に変換",
		fn: convertToNumericCharacterReference,
	},
	{
		name: "Base64 decode (UTF-8)",
		fn: Base64.decode,
	},
	{
		name: "URL decode (UTF-8)",
		fn: (input) => decodeURIComponent(normalize(input)),
	},
	{
		name: "URL decode (Shift_JIS)",
		fn: (input) =>
			// @ts-expect-error ブラウザ前提のコード
			sjisDecoder.decode(
				new Uint8Array(
					Array.from(input.matchAll(/%([0-9a-f]{2})/gi))
						.map((m) => Number.parseInt(m[1], 16))
						.filter((n) => !Number.isNaN(n)),
				),
			),
	},
	{
		name: "URL decode (EUC-JP)",
		fn: (input) =>
			// @ts-expect-error ブラウザ前提のコード
			eucjpDecoder.decode(
				new Uint8Array(
					Array.from(input.matchAll(/%([0-9a-f]{2})/gi))
						.map((m) => Number.parseInt(m[1], 16))
						.filter((n) => !Number.isNaN(n)),
				),
			),
	},
	{
		name: "HTMLエンティティをデコード",
		fn: decodeHTMLEntities,
	},
];

/** @type {Result[]} */
let results = $derived(
	encoders.map((encoder) => {
		if (!browser) {
			return {
				...encoder,
				output: "",
				error: null,
			};
		}
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
	inputRef.value = localStorage.getItem("encode.input") ?? "";
	update();
});

function update() {
	if (!inputRef) {
		return;
	}
	input = inputRef.value;
	localStorage.setItem("encode.input", input);
}
</script>

<svelte:head>
	<title>エンコード・デコード</title>
</svelte:head>

<SimpleToolLayout title="エンコード・デコード">
	<textarea
		class={inputBaseClass}
		placeholder="エンコード／デコードする文字列を入力..."
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
					breakClass="break-all"
				/>
				{#if result.description != null}
					<p class="mt-1 text-xs text-gray-500">{result.description}</p>
				{/if}
			</section>
		{/each}
	</div>
</SimpleToolLayout>
