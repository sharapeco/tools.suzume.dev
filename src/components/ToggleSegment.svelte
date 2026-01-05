<script>
import { createEventDispatcher } from "svelte";

let { items = [], value, title = null } = $props();

const dispatch = createEventDispatcher();

/**
 * @param {string} newValue
 */
function onChange(newValue) {
	dispatch("change", newValue);
}
</script>

<div class="flex items-center gap-2 flex-wrap">
	{#if title != null}
		<span class="text-sm text-slate-600">{title}</span>
	{/if}
	<div class="inline-flex rounded-lg border border-slate-300 bg-white shadow-sm">
		{#each items as item, index}
			<button
				type="button"
				class={`px-3.5 py-2 text-sm font-medium focus:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 ${
					item.value === value
						? "bg-indigo-100 text-indigo-700"
						: "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
				} ${index !== 0 ? "-ml-px border-l border-slate-300" : ""} ${
					index === 0 ? "rounded-l-lg" : ""
				} ${index === items.length - 1 ? "rounded-r-lg" : ""}`}
				aria-pressed={item.value === value}
				onclick={() => onChange(item.value)}
			>
				{item.label}
			</button>
		{/each}
	</div>
</div>
