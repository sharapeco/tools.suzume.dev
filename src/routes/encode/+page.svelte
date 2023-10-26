<script>
	import { Base64 } from "js-base64";
	import { getKey } from "$lib/eventUtil.js";
	import { supersub } from "$lib/supersub";

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
			description: "^2 → ² / H_2O → H₂O​ / ^{235}U → ²³⁵U / ^い → ゐ / ^セ → セ゚ / _リ → ㇼ",
			fn: supersub,
		},
		{
			name: "Base64 encode (UTF-8)",
			fn: Base64.encode,
		},
		{
			name: "Base64 decode (UTF-8)",
			fn: Base64.decode,
		},
		{
			name: "URL encode",
			fn: encodeURIComponent,
		},
		{
			name: "URL decode",
			fn: decodeURIComponent,
		},
	];

	/** @type {Result[]} */
	$: results = encoders
		.map((encoder) => {
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
	<title>エンコード・デコード・文字種変換</title>
</svelte:head>

<main>
	<h1 class="text-gray-800 mb-4 text-3xl font-bold">エンコード・デコード・文字種変換</h1>

	<textarea
		name="input"
		class="w-full text-sm bg-slate-50 rounded border px-3 py-2"
		placeholder="エンコード／デコードする文字列を入力..."
		autofocus
		on:input={() => inputRef && (input = inputRef.value)}
		bind:this={inputRef}
	/>

	{#each results as result}
		<section class="mt-3">
			<h2 class="inline-block text-gray-700 mb-1 text-sm font-bold">
				{result.name}
			</h2>
			<div
				class="relative w-full text-sm bg-slate-50 rounded border px-3 py-2 whitespace-pre-line"
				class:text-red-500={result.error != null}
				class:cursor-pointer={result.error != null}
				tabindex={result.error != null ? 0 : -1}
				role="button"
				on:click={(event) => clickHandler(event, result)}
				on:keydown={(event) => keydownHandler(event, result)}
			>
				{result.output ?? ''}{result.error ?? ''}&#8203;
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
</main>
