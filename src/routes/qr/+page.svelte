<script>
import NavPills from "$components/NavPills.svelte";
import SimpleToolLayout from "$components/SimpleToolLayout.svelte";
import { QRCode } from "$lib/qrcode.js";

/** @typedef {{ content: string, ecl: string, svg: string, url: string }} Result */

/** @type {string} 入力文字列 */
let input = $state("");

/** @type {{ to: string, subject: string, body: string }} */
let mailto = $state({ to: "", subject: "", body: "" });

/** @type {{ ssid: string, password: string }} */
let ssid = $state({ ssid: "", password: "" });

/** @type {"string" | "mailto" | "ssid"} モード */
let mode = $state("string");

const modes = [
	{ value: "string", label: "文字列" },
	{ value: "mailto", label: "メール" },
	{ value: "ssid", label: "Wi-Fi SSID" },
];

/** @type {"CRLF" | "LF" | "CR"} 改行コード */
let newline = $state("CRLF");

const newlines = [
	{ value: "CRLF", label: "CRLF" },
	{ value: "LF", label: "LF" },
	{ value: "CR", label: "CR" },
];

/** @type {"normal" | "predefined"} predefined: <def> と <use> を使う */
let drawMethod = $state("normal");

const drawMethods = [
	{ value: "normal", label: "通常（Illustratorで使用する場合）" },
	{ value: "predefined", label: "<def> を使用" },
];

const ECLs = ["L", "M", "Q", "H"];

const svgSize = 256;

/** @type {string} */
let copiedECL = $state("");

/**
 * @typedef {object} InputProps
 * @property {string} mode
 * @property {string} input
 * @property {{ to: string, subject: string, body: string }} mailto
 * @property {{ ssid: string, password: string }} ssid
 */
/**
 * @param {InputProps} props
 */
function getInput(props) {
	const { mode, input, mailto, ssid } = props;
	switch (mode) {
		case "string":
			return convertNewline(input);
		case "mailto":
			if (mailto.to === "") {
				return "";
			}
			if (mailto.subject === "" && mailto.body === "") {
				return `mailto:${mailto.to}`;
			}
			return `mailto:${mailto.to}?subject=${mailto.subject}&body=${mailto.body.replace(/\r\n|\r|\n/g, "\r\n")}`;
		case "ssid":
			if (ssid.ssid === "" || ssid.password === "") {
				return "";
			}
			return `WIFI:T:WPA;S:${ssid.ssid};P:${ssid.password};;`;
		default:
			return "";
	}
}

const newlinesMap = {
	CRLF: "\r\n",
	LF: "\n",
	CR: "\r",
};

/**
 * @param {string} input 入力文字列
 * @returns {string} 改行コードを変換した文字列
 */
function convertNewline(input) {
	return input.replace(/\r\n|\r|\n/g, newlinesMap[newline]);
}

/**
 * @param {string} content
 * @param {string} ecl
 * @param {string} drawMethod
 * @returns {string}
 */
function buildQRCode(content, ecl, drawMethod) {
	return new QRCode({
		content,
		ecl,
		container: "svg-viewbox",
		swap: true,
		join: false,
		predefined: drawMethod === "predefined",
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
let content = $derived(getInput({ mode, input, mailto, ssid }));
let results = $derived(
	content !== ""
		? ECLs.map((ecl) => {
				const svg = buildQRCode(content, ecl, drawMethod);
				return {
					content,
					ecl,
					svg,
					url: URL.createObjectURL(
						new Blob([svg], {
							type: "image/svg+xml",
						}),
					),
				};
			})
		: null,
);
</script>

<svelte:head>
	<title>QRコード生成</title>
</svelte:head>

<SimpleToolLayout title="QRコード生成">
	{#snippet description()}
		<p class="mt-2">
			4種のエラー訂正レベルのQRコードを生成し、SVG形式でダウンロードできます。
		</p>
		<p class="mt-2">
			SVGコードをコピーし、Adobe
			Illustratorなどのグラフィックソフトに直接貼り付けることもできます。
		</p>
	{/snippet}

	<div class="mb-3">
		<NavPills items={modes} value={mode} on:change={(e) => (mode = e.detail)} />
	</div>

	{#if mode === "string"}
		<textarea
			class="w-full bg-slate-50 rounded border px-3 py-2"
			placeholder="内容を入力..."
			bind:value={input}
		></textarea>
		<div class="mt-2">
			<NavPills
				title="改行コード"
				items={newlines}
				value={newline}
				on:change={(e) => (newline = e.detail)}
			/>
		</div>
	{:else if mode === "mailto"}
		<div>
			<input
				class="w-full bg-slate-50 rounded border px-3 py-2"
				placeholder="宛先"
				bind:value={mailto.to}
			/>
		</div>
		<div class="mt-2">
			<input
				class="w-full bg-slate-50 rounded border px-3 py-2"
				placeholder="件名"
				bind:value={mailto.subject}
			/>
		</div>
		<div class="mt-2">
			<textarea
				class="w-full bg-slate-50 rounded border px-3 py-2"
				placeholder="本文"
				bind:value={mailto.body}
				rows="7"
			></textarea>
		</div>
	{:else if mode === "ssid"}
		<div>
			<input
				class="w-full bg-slate-50 rounded border px-3 py-2"
				placeholder="SSID"
				bind:value={ssid.ssid}
			/>
		</div>
		<div class="mt-2">
			<input
				class="w-full bg-slate-50 rounded border px-3 py-2"
				placeholder="パスワード"
				bind:value={ssid.password}
			/>
		</div>
		<p class="mt-2 text-xs text-slate-500">
			Webサービスに本当にパスワードを入力しても大丈夫？　
			自身で判断できないならやめておきましょう。
		</p>
	{/if}
	<div class="mt-2">
		<NavPills
			title="出力方法"
			items={drawMethods}
			value={drawMethod}
			on:change={(e) => (drawMethod = e.detail)}
		/>
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
								<span
									class="copied bg-indigo-500 text-white text-xs leading-5 px-1 rounded"
								>
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
								onclick={() => download(result)}
							>
								保存
							</button>
						</div>
						<div class="flex-1">
							<button
								type="button"
								class="w-full text-sm py-2 px-1 text-center rounded-lg bg-white transition duration-100 hover:text-white hover:bg-indigo-600 active:text-white active:bg-indigo-700"
								onclick={() => copy(result)}
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
