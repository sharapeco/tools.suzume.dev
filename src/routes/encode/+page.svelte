<script>
	import { Base64 } from "js-base64";
	import { getKey } from "$lib/eventUtil.js";

	/** @type {HTMLTextAreaElement|null} */
	let inputRef = null;

	/** @type {string} 入力文字列 */
	let input = "";

	let copiedName = "";

	/**
	 * @type {Array<{name: string, fn: (input: string) => string|null}>}
	 */
	const encoders = [
		{
			name: "Base64 encode (UTF-8)",
			fn(input) {
				return Base64.encode(input);
			},
		},
		{
			name: "Base64 decode (UTF-8)",
			fn(input) {
				try {
					return Base64.decode(input);
				} catch {
					return null;
				}
			},
		},
		{
			name: "URL encode",
			fn(input) {
				return encodeURIComponent(input);
			},
		},
		{
			name: "URL decode",
			fn(input) {
				try {
					return decodeURIComponent(input);
				} catch {
					return null;
				}
			},
		}
	];

	/**
	 * @typedef {Object} Result
	 * @property {string} name
	 * @property {(input: string) => string|null} fn
	 * @property {string|null} output
	 */

	/** @type {Result[]} */
	$: results = encoders
		.map((encoder) => ({
			...encoder,
			output: encoder.fn(input),
		}))
		.filter((encoder) => encoder.output != null);

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

<main>
	<h1 class="text-gray-800 mb-4 text-3xl font-bold">エンコード・デコード</h1>

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
				class="relative w-full text-sm bg-slate-50 rounded border px-3 py-2 whitespace-pre-line cursor-pointer"
				tabindex="0"
				role="button"
				on:click={(event) => clickHandler(event, result)}
				on:keydown={(event) => keydownHandler(event, result)}
			>
				{result.output}&#8203;
				<span
					class="absolute block top-2 right-3 bg-blue-500 text-white text-xs px-1 rounded transition"
					class:opacity-0={copiedName !== result.name}
				>
					コピーしました
				</span>
			</div>
		</section>
	{/each}
</main>
