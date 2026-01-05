<script>
import { browser } from "$app/environment";
import { clickOutside } from "$lib/clickOutside.js";
import { getKey } from "$lib/eventUtil.js";
import { getPlatform } from "$lib/platform.js";
import { katakanaToHiragana } from "$lib/zenkaku.js";

/**
 * @typedef {Object} Props
 * @property {import('../$types.d.ts').ToolDef[]} tools
 */

/** @type {Props} */
let { tools } = $props();

/** @type {string} */
const platform = getPlatform();

/** @type {HTMLInputElement|null} */
let inputRef = $state(null);

let open = $state(false);

let selectedIndex = $state(0);

/** @type {string} */
let q = $state("");

let results = $derived(
	tools.filter(
		(tool) => !tool.disabled && (match(tool.route, q) || match(tool.title, q)),
	),
);

if (browser) {
	$effect(() => {
		document.addEventListener("keydown", globalKeydownHandler);

		return () => {
			document.removeEventListener("keydown", globalKeydownHandler);
		};
	});
}

/**
 * @param {KeyboardEvent} event
 */
function globalKeydownHandler(event) {
	const key = getKey(event);
	if (
		(platform !== "apple" && key === "ctrl+/") ||
		(platform === "apple" && key === "meta+/")
	) {
		event.preventDefault();
		inputRef?.focus();
	}
}

/**
 * @param {KeyboardEvent} event
 */
function keydownHandler(event) {
	const key = getKey(event);
	switch (key) {
		case "ArrowDown":
			event.preventDefault();
			if (!open) {
				open = true;
				selectedIndex = 0;
			} else {
				if (selectedIndex >= results.length - 1) {
					selectedIndex = 0;
				} else {
					selectedIndex = selectedIndex + 1;
				}
			}
			break;
		case "ArrowUp":
			event.preventDefault();
			if (!open) {
				open = true;
				selectedIndex = results.length - 1;
			} else {
				if (selectedIndex <= 0) {
					selectedIndex = results.length - 1;
				} else {
					selectedIndex = selectedIndex - 1;
				}
			}
			break;
		case "Enter":
			event.preventDefault();
			if (open && results[selectedIndex]) {
				location.href = results[selectedIndex].route;
			}
			break;
		case "Escape":
			event.preventDefault();
			open = false;
			break;
	}
}

function inputHandler() {
	// Esc キーでプルダウンを閉じたあと、入力があればプルダウンを開く
	if (!open) {
		open = true;
	}
	if (selectedIndex >= results.length) {
		selectedIndex = 0;
	}
}

/**
 * テキストがクエリにマッチするかどうかを判定する
 *
 * @param {string} aText
 * @param {string} aQuery
 * @returns {boolean} マッチするかどうか
 */
function match(aText, aQuery) {
	const text = filterQuery(aText);
	const query = filterQuery(aQuery);
	if (query === "") {
		return true;
	}
	let p = 0;
	for (const c of query) {
		const mp = text.indexOf(c, p);
		if (mp === -1) {
			return false;
		}
		p = mp + 1;
	}
	return true;
}

/**
 * @param {string} query
 * @returns {string} 無視する文字を除去した文字列
 */
function filterQuery(query) {
	return katakanaToHiragana(query).toLocaleLowerCase();
}

/**
 * 入力文字列部分をHTMLハイライトする
 *
 * @param {string} text ハイライトする文字列
 * @param {string} query 入力文字列
 * @returns {string} ハイライトしたHTML
 */
function highlight(text, query) {
	if (query === "") {
		return text;
	}
	const fText = filterQuery(text);
	const fQuery = filterQuery(query);
	let html = "";
	let p = 0;
	for (const char of fQuery) {
		const mp = fText.indexOf(char, p);
		if (mp === -1) {
			html += escapeHtml(text.slice(p));
			return html;
		}
		html += escapeHtml(text.slice(p, mp));
		html += `<span class="font-bold">${escapeHtml(text.slice(mp, mp + 1))}</span>`;
		p = mp + 1;
	}
	html += escapeHtml(text.slice(p));
	return html;
}

/**
 * HTMLエスケープする
 *
 * @param {string} text
 * @returns {string} エスケープしたHTML
 */
function escapeHtml(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}
</script>

<div class="relative" use:clickOutside onclick_outside={() => (open = false)}>
	<input
		type="text"
		class="text-sm rounded border px-3 py-2 bg-slate-50 w-full"
		placeholder="ツールを検索{platform === "server"
			? ''
			: `（${platform === 'apple' ? '⌘' : 'Ctrl'}+/）`}"
		bind:value={q}
		bind:this={inputRef}
		onfocus={() => (open = true)}
		onblur={() => (open = false)}
		onkeydown={keydownHandler}
		oninput={inputHandler}
	/>
	{#if open}
		<div
			class="dropdown absolute z-40 top-full left-0 right-0 mt-1 p-1 bg-white rounded border shadow-md"
		>
			{#each results as tool, index}
				<a
					href={tool.route}
					class="block px-3 py-2 rounded text-sm leading-4
						{index === selectedIndex ? 'text-white bg-indigo-500' : 'text-gray-700 hover:bg-gray-100'}
					"
					onmouseenter={() => (selectedIndex = index)}
					onclick={() => (open = false)}
					tabindex="-1"
				>
					<div class="">{@html highlight(tool.title, q)}</div>
					<div class="mt-1 font-mono text-xs opacity-70">
						{@html highlight(tool.route, q)}
					</div>
				</a>
			{/each}
			{#if results.length === 0}
				<div class="px-3 py-2 text-sm text-gray-400">見つかりません</div>
			{/if}
		</div>
	{/if}
</div>

<style>
.dropdown {
	overflow-y: auto;
	max-height: calc(100vh - 7rem);
}
</style>
