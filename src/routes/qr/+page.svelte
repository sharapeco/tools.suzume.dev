<script>
	import { QRCode } from "$lib/qrcode.js";
	import SimpleToolLayout from "../../components/SimpleToolLayout.svelte";

	/** @typedef {{ content: string, ecl: string, svg: string, url: string }} Result */

	/** @type {string} 入力文字列 */
	let input = "";

	/** @type {string} 改行コード */
	let newline = "CRLF";

	function onNewlineChange(event) {
		newline = event.target.value;
	}

	const ECLs = ["L", "M", "Q", "H"];

	const svgSize = 256;

	/** @type {string} */
	let copiedECL = "";

	$: results =
		input !== ""
			? ECLs.map((ecl) => {
				const svg = buildQRCode(convertNewline(input), ecl)
				return {
					content: input,
					ecl,
					svg,
					url: URL.createObjectURL(
						new Blob([svg], {
							type: "image/svg+xml",
						})
					),
			  }
			})
			: null;

	const newlines = {
		CRLF: "\r\n",
		LF: "\n",
		CR: "\r",
	};
	function convertNewline(input) {
		return input.replace(/\r\n|\r|\n/g, newlines[newline]);
	}

	/**
	 * @param {string} content
	 * @param {string} ecl
	 * @returns {string}
	 */
	function buildQRCode(content, ecl) {
		return new QRCode({
			content,
			ecl,
			container: "svg-viewbox",
			swap: true,
			join: false,
			predefined: true,
			pretty: true,
			width: svgSize,
			height: svgSize,
		}).svg();
	}

	/**
	 * @param {Result} result
	 */
	function download(result) {
		const link = document.createElement("a");
		link.href = result.url;
		link.download = `${result.content}.svg`;
		link.click();
	}

	/**
	 * @param {Result} result
	 */
	 function copy(result) {
		navigator.clipboard.writeText(result.svg);
		copiedECL = result.ecl;
		setTimeout(() => {
			copiedECL = "";
		}, 1200);
	}
</script>

<svelte:head>
	<title>QRコード生成</title>
</svelte:head>

<SimpleToolLayout title="QRコード生成">
	<svelte:fragment slot="description">
		<p class="mt-2">
			4種のエラー訂正レベルのQRコードを生成し、SVG形式でダウンロードできます。
		</p>
		<p class="mt-2">
			SVGコードをコピーし、Adobe Illustratorなどのグラフィックソフトに直接貼り付けることもできます。
		</p>
	</svelte:fragment>

	<textarea
		class="w-full bg-slate-50 rounded border px-3 py-2"
		placeholder="内容を入力..."
		autofocus
		bind:value={input}
	/>

	<div class="mt-2 flex gap-4">
		<span>改行コード</span>
		<label>
			<input checked={newline === "CRLF"} on:change={onNewlineChange} type="radio" name="newline" value="CRLF" />
			CRLF
		</label>
		<label>
			<input checked={newline === "LF"} on:change={onNewlineChange} type="radio" name="newline" value="LF" />
			LF
		</label>
		<label>
			<input checked={newline === "CR"} on:change={onNewlineChange} type="radio" name="newline" value="CR" />
			CR
		</label>
	</div>

	{#if results}
		<div class="mt-5 grid gap-4 grid-cols-2 md:grid-cols-4 md:gap-6">
			{#each results as result}
				<div
					class="relative flex flex-col items-stretch overflow-hidden rounded-lg bg-slate-100 p-4 shadow-lg"
				>
					<div class="mb-2 -mt-1 text-sm text-gray-500 font-bold text-center">
						{result.ecl}
					</div>
					<div class="relative text-center">
						<img
							alt="エラー訂正レベル{result.ecl}のQRコード"
							src={result.url}
							class="w-full rounded-lg"
						/>
						{#if copiedECL === result.ecl}
						<div
							class="absolute flex justify-center top-full -mt-6 left-0 right-0"
						>
							<span class="copied bg-indigo-500 text-white text-xs leading-5 px-1 rounded">
								コピーしました
							</span>
						</div>
					{/if}
					</div>
					<div class="mt-3 flex gap-2">
						<div class="flex-1">
							<button
								type="button"
								class="w-full text-sm py-2 px-1 text-center rounded-lg bg-white transition duration-100 hover:text-white hover:bg-indigo-600 active:text-white active:bg-indigo-700"
								on:click={() => download(result)}
							>
								保存
							</button>
						</div>
						<div class="flex-1">
							<button
								type="button"
								class="w-full text-sm py-2 px-1 text-center rounded-lg bg-white transition duration-100 hover:text-white hover:bg-indigo-600 active:text-white active:bg-indigo-700"
								on:click={() => copy(result)}
							>
								コピー
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</SimpleToolLayout>

<style lang="postcss">
	.copied {
		animation: copy-animation 1200ms ease;
		animation-fill-mode: both;
	}
</style>
