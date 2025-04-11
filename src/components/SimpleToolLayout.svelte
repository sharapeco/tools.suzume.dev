<script>
/**
 * @typedef {Object} Props
 * @property {any} title
 * @property {import('svelte').Snippet} [description]
 * @property {import('svelte').Snippet} [children]
 * @property {boolean} [height100percent]
 * @property {boolean} [minHeight100percent]
 */

/** @type {Props} */
let {
	title,
	description,
	children,
	height100percent = false,
	minHeight100percent = false,
} = $props();
</script>

<main
	class="pb-4 md:pb-7 lg:pb-7 {height100percent ? "height100percent" : ""}
	{minHeight100percent ? "minHeight100percent" : ""}"
>
	<header class="mb-5">
		<h1 class="text-gray-800 text-3xl leading-7 font-bold">{title}</h1>
		<div class="mt-4 text-gray-500">
			{@render description?.()}
		</div>
	</header>

	{@render children?.()}
</main>

<style lang="postcss">
	.height100percent {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 6.375rem);
	}

	.minHeight100percent {
		display: flex;
		flex-direction: column;
		min-height: calc(100vh - 6.375rem);
	}
</style>

