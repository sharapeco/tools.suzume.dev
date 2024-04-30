<script>
	import { createEventDispatcher } from 'svelte'

	/** @typedef {{ value: string, label: string }} Item */

	/** @type {string} */
	export let value;

	/** @type {Item[]} */
	export let items;

	/** @type {string | null}*/
	export let title = null;

	const dispatch = createEventDispatcher()

	/**
	 * @param {string} newValue
	 */
	function onChange(newValue) {
		dispatch("change", newValue);
	}
</script>

<ul
	class="list-none flex flex-row flex-wrap items-center ps-0 gap-1"
	role="tablist"
>
	{#if title != null}
	<span class="text-neutral-500 text-sm mr-2">{title}</span>
	{/if}
	{#each items as item}
		<li role="presentation">
			<button
				type="button"
				class="block rounded px-4 pt-3.5 pb-3 text-sm leading-tight
					{item.value === value ? 'text-indigo-700' : 'text-neutral-500 hover:text-neutral-700'}
					{item.value === value ? 'bg-indigo-100' : 'bg-slate-50 hover:bg-slate-100'}
				"
				role="tab"
				aria-selected={item.value === value}
				on:click={() => onChange(item.value)}
			>
				{item.label}
			</button>
		</li>
	{/each}
</ul>
