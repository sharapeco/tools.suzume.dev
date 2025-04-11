<script>
import { browser } from "$app/environment";
import { getPlatform } from "$lib/platform";
import { onDestroy, onMount } from "svelte";

/**
 * @typedef {Object} Props
 * @property {string} input
 */

/** @type {Props} */
let { input } = $props();

let paragraphs = $derived(
	input.split(/\n{2,}/).map((aText) => {
		const text = aText.replace(/\n+$/, "");
		const divisions = [];
		for (let pos = 0; pos < text.length; ) {
			const substr = text.substring(pos);
			let match;
			// biome-ignore lint/suspicious/noAssignInExpressions: match() の見やすさのため
			// biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を扱うため
			if ((match = substr.match(/^[\u{0}-\u{08}\u{0B}-ɏ‐-›]+/u))) {
				divisions.push({
					type: "latin",
					text: match[0],
				});
				pos += match[0].length;
				// biome-ignore lint/suspicious/noAssignInExpressions: match() の見やすさのため
				// biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を扱うため
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
	}),
);

const platform = getPlatform();
const mod = platform === "apple" ? "Meta" : "Ctrl";

/** @type {string[]} */
const handleModifiers = [mod];

/** @type {Set<string>} */
let modifiers = $state(new Set());

/** @type {boolean} コピー直後に true になる */
let copied = $state(false);

/** @type {"paragraph" | "word"} */
let mode = $state("paragraph");

if (browser) {
	onMount(() => {
		document.addEventListener("keydown", keydownHandler);
		document.addEventListener("keyup", keyupHandler);
	});

	onDestroy(() => {
		document.removeEventListener("keydown", keydownHandler);
		document.removeEventListener("keyup", keyupHandler);
	});
}

function updateMode() {
	mode = modifiers.has(mod) ? "word" : "paragraph";
}

/**
 * @param {KeyboardEvent} event
 */
function keydownHandler(event) {
	if (handleModifiers.includes(event.key)) {
		modifiers.add(event.key);
		updateMode();
	}
}

/**
 * @param {KeyboardEvent} event
 */
function keyupHandler(event) {
	if (handleModifiers.includes(event.key)) {
		modifiers.delete(event.key);
		updateMode();
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

<div class="p-4 h-full overflow-auto {copied ? 'copied' : ''}">
	{#each paragraphs as paragraph}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<pre
			class="mb-4 py-1 whitespace-pre-wrap rounded font-sans {mode === 'paragraph'
				? 'hover:bg-indigo-100 cursor-pointer'
				: ''}"
			tabindex={mode === "paragraph" ? 0 : -1}
			onclick={(event) => {
				event.preventDefault();
				copyParagraph(paragraph);
			}}
			onkeydown={(event) => {
				if (event.key === "Enter") {
					copyParagraph(paragraph);
				}
			}}><!-- svelte-ignore a11y_no_static_element_interactions -->{#each paragraph.divisions as div}<span
					class="py-1 rounded {mode === 'word'
						? 'hover:bg-yellow-200 cursor-pointer'
						: ''}"
					tabindex={mode === "word" ? 0 : -1}
					onclick={(event) => {
						event.preventDefault();
						copyDivision(div);
					}}
					onkeydown={(event) => {
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
