<script>
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { Base64 } from "js-base64";
	import { getKey } from "$lib/eventUtil.js";
	import {
		convertToNumericCharacterReference,
		decodeHTMLEntities,
		encodeHTMLEntities as escapeHTMLReservedCharacters,
	} from "$lib/htmlEntity";
	import { NaiveTextEncoder } from "$lib/naiveTextEncoder/NaiveTextEncoder";
	import { normalize } from "$lib/zenkaku";
	import SimpleToolLayout from "../../components/SimpleToolLayout.svelte";

	/** @type {HTMLTextAreaElement|null} */
	let inputRef = null;

	/** @type {string} 入力文字列 */
	let input = "";

	let copiedName = "";

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
				Array.from(sjisEncoder.encode(normalize(input)))
					.map((c) => `%${c.toString(16).toUpperCase()}`)
					.join(""),
		},
		{
			name: "URL encode (EUC-JP)",
			fn: (input) =>
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
				sjisDecoder.decode(
					new Uint8Array(
						Array.from(input.matchAll(/%([0-9a-f]{2})/gi))
							.map((m) => parseInt(m[1], 16))
							.filter((n) => !isNaN(n))
					)
				),
		},
		{
			name: "URL decode (EUC-JP)",
			fn: (input) =>
				eucjpDecoder.decode(
					new Uint8Array(
						Array.from(input.matchAll(/%([0-9a-f]{2})/gi))
							.map((m) => parseInt(m[1], 16))
							.filter((n) => !isNaN(n))
					)
				),
		},
		{
			name: "HTMLエンティティをデコード",
			fn: decodeHTMLEntities,
		},
	];

	/** @type {Result[]} */
	$: results = encoders.map((encoder) => {
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
	});

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

	/**
	 * @param {MouseEvent} event
	 * @param {Result} result
	 */
	function clickHandler(event, result) {
		if (result.output == null) {
			return;
		}
		copyText(result.output);
		setCopiedName(result.name);
	}

	/**
	 * @param {KeyboardEvent} event
	 * @param {Result} result
	 */
	function keydownHandler(event, result) {
		const key = getKey(event);
		switch (key) {
			case "Enter":
			case "meta+c":
			case "ctrl+c":
				if (result.output == null) {
					return;
				}
				copyText(result.output);
				setCopiedName(result.name);
				break;
		}
	}

	/**
	 * @param {string} str
	 */
	function copyText(str) {
		navigator.clipboard.writeText(str);
	}

	/**
	 * @param {string} name
	 */
	function setCopiedName(name) {
		copiedName = name;
		setTimeout(() => {
			copiedName = "";
		}, 1200);
	}
</script>

<svelte:head>
	<title>エンコード・デコード</title>
</svelte:head>

<SimpleToolLayout title="エンコード・デコード">
	<textarea
		class="w-full bg-slate-50 rounded border px-3 py-2"
		placeholder="エンコード／デコードする文字列を入力..."
		autofocus
		on:input={update}
		bind:this={inputRef}
	/>

	<div class="mt-5 md:columns-2 md:gap-8">
		{#each results as result, index}
			<section
				class="mb-3 break-inside-avoid"
				class:break-after-column={index === Math.ceil(results.length / 2) - 1}
			>
				<h2 class="inline-block text-gray-700 mb-1 text-sm font-bold">
					{result.name}
				</h2>
				<div
					class="group relative text-sm bg-slate-50 rounded border px-3 py-2 whitespace-pre-line break-words"
					class:text-red-500={result.error != null}
					class:cursor-pointer={result.error != null}
					tabindex={result.error != null ? 0 : -1}
					role="button"
					on:click={(event) => clickHandler(event, result)}
					on:keydown={(event) => keydownHandler(event, result)}
				>
					{result.output ?? ""}{result.error ?? ""}&#8203;
					<span aria-hidden="true" class="absolute top-2 right-2 w-4 mt-1 text-indigo-500 transition opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100">
						<svg viewBox="64 64 896 896" focusable="false" data-icon="copy" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.2c3.5 1.3 7.2 2 11 2H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM664 888H414V746c0-22.1-17.9-40-40-40H232V264h432v624z"></path></svg>
					</span>
					{#if copiedName === result.name}
						<span
							class="copied absolute block top-2 right-3 bg-indigo-500 text-white text-xs leading-5 px-1 rounded"
						>
							コピーしました
						</span>
					{/if}
				</div>
				{#if result.description != null}
					<p class="mt-1 text-xs text-gray-500">{result.description}</p>
				{/if}
			</section>
		{/each}
	</div>
</SimpleToolLayout>

<style lang="postcss">
	.copied {
		transform-origin: 100% 50%;
		animation: copy-animation 1200ms ease;
		animation-fill-mode: both;
	}
</style>
