<script>
import { outputDisplayClass } from "$components/inputClasses.js";

export let value = "";
export let error = null;
export let name = "";
export let breakClass = "";

let copied = false;

function copy() {
	if (value == null) {
		return;
	}
	navigator.clipboard.writeText(value);
	copied = true;
	setTimeout(() => {
		copied = false;
	}, 1200);
}

/**
 * @param {KeyboardEvent} event
 */
function onKeydown(event) {
	const key = event.key?.toLowerCase();
	if (key === "enter" || ((event.metaKey || event.ctrlKey) && key === "c")) {
		event.preventDefault();
		copy();
	}
}
</script>

<div
	class={`${outputDisplayClass} ${breakClass}`}
	class:text-red-500={error != null}
	class:cursor-pointer={value != null}
	tabindex={value != null ? 0 : -1}
	role="button"
	aria-label={name ? `${name}をコピー` : "コピー"}
	onclick={copy}
	onkeydown={onKeydown}
>
	{value ?? ""}{error ?? ""}&#8203;
	<span aria-hidden="true" class="absolute top-2 right-2 w-4 mt-1 text-indigo-500 transition opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100">
		<svg viewBox="64 64 896 896" focusable="false" data-icon="copy" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.2c3.5 1.3 7.2 2 11 2H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM664 888H414V746c0-22.1-17.9-40-40-40H232V264h432v624z"></path></svg>
	</span>
	{#if copied}
		<span class="copied absolute block top-2 right-2 bg-indigo-500 text-white text-xs leading-5 px-1 rounded">
			コピーしました
		</span>
	{/if}
</div>

<style>
	.copied {
		transform-origin: 100% 50%;
		animation: copy-animation 1200ms ease; /* copy-animation は app.css に定義済み */
		animation-fill-mode: both;
	}
</style>
