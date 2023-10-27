<script>
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { Base64 } from "js-base64";
	import { getKey } from "$lib/eventUtil.js";
	import {
		decodeHTMLEntities,
		encodeHTMLEntities as escapeHTMLReservedCharacters,
	} from "$lib/htmlEntity";
	import { NaiveTextEncoder } from "$lib/naiveTextEncoder";

	/** @type {HTMLTextAreaElement|null} */
	let inputRef = null;

	/** @type {string} 入力文字列 */
	let input = "";

	let copiedName = "";

	const sjisEncoder = new NaiveTextEncoder("Shift_JIS", 2);
	const sjisDecoder = new TextDecoder("Shift_JIS");

	const eucjpEncoder = new NaiveTextEncoder("EUC-JP", 2);
	const eucjpDecoder = new TextDecoder("EUC-JP");

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
			fn: (input) => Base64.encode(input.normalize()),
		},
		{
			name: "Base64 decode (UTF-8)",
			fn: Base64.decode,
		},
		{
			name: "URL encode (UTF-8)",
			fn: (input) => encodeURIComponent(input.normalize()),
		},
		{
			name: "URL decode (UTF-8)",
			fn: (input) => decodeURIComponent(input.normalize()),
		},
		{
			name: "URL encode (Shift_JIS)",
			fn: (input) =>
				Array.from(sjisEncoder.encode(input.normalize()))
					.map((c) => `%${c.toString(16)}`)
					.join(""),
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
			name: "URL encode (EUC-JP)",
			fn: (input) =>
				Array.from(eucjpEncoder.encode(input.normalize()))
					.map((c) => `%${c.toString(16)}`)
					.join(""),
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
			name: "HTML予約文字をエスケープ",
			fn: escapeHTMLReservedCharacters,
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
		}, 1000);
	}
</script>

<svelte:head>
	<title>エンコード・デコード</title>
</svelte:head>

<main class="pt-2 pb-1">
	<header class="mb-5">
		<h1 class="text-gray-800 text-3xl leading-7 font-bold">エンコード・デコード</h1>
	</header>

	<textarea
		class="w-full text-sm bg-slate-50 rounded border px-3 py-2"
		placeholder="エンコード／デコードする文字列を入力..."
		autofocus
		on:input={update}
		bind:this={inputRef}
	/>

	<div class="mt-5">
		{#each results as result, index}
			<section class="mb-3 break-inside-avoid">
				<h2 class="inline-block text-gray-700 mb-1 text-sm font-bold">
					{result.name}
				</h2>
				<div
					class="relative w-full text-sm bg-slate-50 rounded border px-3 py-2 whitespace-pre-line break-words"
					class:text-red-500={result.error != null}
					class:cursor-pointer={result.error != null}
					tabindex={result.error != null ? 0 : -1}
					role="button"
					on:click={(event) => clickHandler(event, result)}
					on:keydown={(event) => keydownHandler(event, result)}
				>
					{result.output ?? ""}{result.error ?? ""}&#8203;
					<span
						class="absolute block top-2 right-3 bg-blue-500 text-white text-xs leading-5 px-1 rounded transition"
						class:opacity-0={copiedName !== result.name}
					>
						コピーしました
					</span>
				</div>
				{#if result.description != null}
					<p class="mt-1 text-xs text-gray-500">{result.description}</p>
				{/if}
			</section>
		{/each}
	</div>
</main>
