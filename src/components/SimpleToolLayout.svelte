<script>
	/** @type string */
	export let title;
</script>

<main class="pt-2 pb-4">
	<header class="mb-5">
		<h1 class="text-gray-800 text-3xl leading-7 font-bold">{title}</h1>
		<div class="mt-4 text-gray-500">
			<slot name="description" />
		</div>
	</header>

	<slot />
</main>
