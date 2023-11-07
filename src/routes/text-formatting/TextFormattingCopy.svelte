<script>
	import { browser } from "$app/environment";
	import { onDestroy, onMount } from "svelte";

	/** @type {string} */
	export let input;

	$: paragraphs = input.split(/\n{2,}/).map((text) => {
		const divisions = [];
		for (let pos = 0; pos < text.length; ) {
			const substr = text.substring(pos);
			let match;
			if ((match = substr.match(/^[\u{0}-\u{08}\u{0B}-ɏ‐-›]+/u))) {
				divisions.push({
					type: "latin",
					text: match[0],
				});
				pos += match[0].length;
			} else if ((match = substr.match(/^[^\u{0}-ɏ‐-›]+/u))) {
				divisions.push({
					type: "cjk",
					text: match[0],
				});
				pos += match[0].length;
			} else {
				divisions.push({
					type: "control",
					text: text.substring(pos, pos + 1),
				});
				pos++;
			}
		}
		return {
			divisions,
			text,
		};
	});

	/** @type {string[]} */
	const handleModifiers = ["Shift"];

	/** @type {Set<string>} */
	let modifiers = new Set();

	/** @type {boolean} コピー直後に true になる */
	let copied = false;

	/** @type {"paragraph" | "word"} */
	$: mode = modifiers.has("Shift") ? "word" : "paragraph";

	if (browser) {
		onMount(() => {
			window.addEventListener("keydown", keydownHandler);
			window.addEventListener("keyup", keyupHandler);
		});

		onDestroy(() => {
			window.removeEventListener("keydown", keydownHandler);
			window.removeEventListener("keyup", keyupHandler);
		});
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function keydownHandler(event) {
		if (handleModifiers.includes(event.key)) {
			modifiers.add(event.key);
			modifiers = modifiers;
		}
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	function keyupHandler(event) {
		if (handleModifiers.includes(event.key)) {
			modifiers.delete(event.key);
			modifiers = modifiers;
		}
	}

	/**
	 * @param {{ text: string }} paragraph
	 */
	function copyParagraph(paragraph) {
		if (mode !== "paragraph") {
			return;
		}
		copyText(paragraph.text);
	}

	/**
	 * @param {{ type: string, text: string }} div
	 */
	function copyDivision(div) {
		if (mode !== "word") {
			return;
		}
		copyText(div.text);
	}

	/**
	 * @param {string} text
	 */
	function copyText(text) {
		navigator.clipboard.writeText(text);

		copied = true;
		setTimeout(() => {
			copied = false;
		}, 200);
	}
</script>

<div class="p-4 {copied ? 'copied' : ''}">
	{#each paragraphs as paragraph}
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<pre
			class="mb-4 py-1 rounded font-sans {mode === 'paragraph'
				? 'hover:bg-indigo-100 cursor-pointer'
				: ''}"
			tabindex={mode === "paragraph" ? 0 : -1}
			on:click={(event) => {
				event.preventDefault();
				copyParagraph(paragraph);
			}}
			on:keydown={(event) => {
				if (event.key === "Enter") {
					copyParagraph(paragraph);
				}
			}}><!-- svelte-ignore a11y-no-static-element-interactions -->{#each paragraph.divisions as div}<span
					class="py-1 rounded {mode === 'word'
						? 'hover:bg-yellow-200 cursor-pointer'
						: ''}"
					tabindex={mode === "word" ? 0 : -1}
					on:click={(event) => {
						event.preventDefault();
						copyDivision(div);
					}}
					on:keydown={(event) => {
						if (event.key === "Enter") {
							copyDivision(div);
						}
					}}>{div.text}</span
				>{/each}</pre>
	{/each}
</div>

<style lang="postcss">
	.copied {
		animation: flush 200ms linear;
		animation-fill-mode: both;
	}
</style>
