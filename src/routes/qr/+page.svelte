<script>
	import { QRCode } from "$lib/qrcode.js";

	/** @type {string} 入力文字列 */
	let input = "";

	const ECLs = ["L", "M", "Q"];

	const svgSize = 256;

	$: results =
		input !== ""
			? ECLs.map((ecl) => ({
					content: input,
					ecl,
					svg: URL.createObjectURL(
						new Blob([buildQRCode(input, ecl)], {
							type: "image/svg+xml",
						})
					),
			  }))
			: null;

	/**
	 * @param {string} content
	 * @param {string} ecl
	 * @returns {string}
	 */
	function buildQRCode(content, ecl) {
		return new QRCode({
			content,
			ecl,
			swap: true,
			join: false,
			predefined: true,
			pretty: true,
			width: svgSize,
			height: svgSize,
		}).svg();
	}

	/**
	 * @param {{ content: string, ecl: string, svg: string }} result
	 */
	function download(result) {
		const link = document.createElement('a');
		link.href = result.svg;
		link.download = `${result.content}.svg`;
		link.click()
	}
</script>

<svelte:head>
	<title>QRコード生成</title>
</svelte:head>

<main class="pt-2 pb-4">
	<header class="mb-5">
		<h1 class="text-gray-800 text-3xl leading-7 font-bold">QRコード生成</h1>
		<p class="mt-4 text-gray-500">3種のエラー訂正レベルのQRコードを生成し、SVG形式でダウンロードできます</p>
	</header>

	<input
		class="w-full bg-slate-50 rounded border px-3 py-2"
		placeholder="内容を入力..."
		autofocus
		bind:value={input}
	/>

	{#if results}
		<div class="mt-5 grid gap-4 grid-cols-3 md:gap-6">
			{#each results as result}
				<button
					type="button"
					class="group relative flex flex-col items-center overflow-hidden rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors p-4 shadow-lg"
					on:click={() => download(result)}
				>
					<div class="text-center">
						<img
							alt="エラー訂正レベル{result.ecl}のQRコード"
							src={result.svg}
							class="w-full rounded-lg"
						/>
					</div>
					<div class="mt-2 -mb-1 text-sm text-gray-500 font-bold">
						{result.ecl}
					</div>
				</button>
			{/each}
		</div>
	{/if}
</main>
