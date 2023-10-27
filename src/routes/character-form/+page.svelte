<script>
	import { onMount } from "svelte";
	import { getKey } from "$lib/eventUtil.js";
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
	let inputRef = null;

	/** @type {string} 入力文字列 */
	let input = "";

	let copiedName = "";

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
	$: results = encoders.map((encoder) => {
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
	<title>文字種変換</title>
</svelte:head>

<main class="pt-2 pb-1">
	<header class="mb-5">
		<h1 class="text-gray-800 text-3xl leading-7 font-bold">文字種変換</h1>
	</header>

	<textarea
		class="w-full md:text-sm bg-slate-50 rounded border px-3 py-2"
		placeholder="文字列を入力..."
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
					class="relative text-sm bg-slate-50 rounded border px-3 py-2 whitespace-pre-line break-words"
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
