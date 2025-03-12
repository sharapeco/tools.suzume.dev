<script>
import { getClothoidSquircle } from "./clothoid";
import { getSuperEllipse } from "./superellipse";

/** @typedef {import("./params").Params} Params */

/** @type {Params} */
export let params;

/** @type {boolean} 「コピーしました」と表示する間 true */
let copied = false;

/** @type {number?} 「コピーしました」タイマー */
let copiedTimer;

$: svgContent = generate(params);

/**
 * @param {Params} params
 * @returns {string}
 */
function generate(params) {
	switch (params.type) {
		case "clothoid":
			return generateClothoid(params);
		case "super-ellipse":
			return generateSuperEllipse(params);
		default:
			return "";
	}
}

/**
 * @param {Params} params
 * @returns {string}
 */
function generateClothoid(params) {
	const width = length(params.width, params.unit, params.dpi);
	const height = length(params.height, params.unit, params.dpi);
	const radius = length(params.radius, params.unit, params.dpi);
	const borderOffset = params.borderOffset;
	const tension = params.tension;

	// 緩和係数が1より大きい場合は角が辺をはみ出すので、viewBoxを大きくして角を表示する
	const sizeRatio = tension > 1 ? 1.2 : 1;
	const viewBox = `${(width * (1 - sizeRatio)) / 2} ${(height * (1 - sizeRatio)) / 2} ${width * sizeRatio} ${height * sizeRatio}`;

	// xmlns をつけることで macOS のアイコンおよび Quick Look で表示される
	return `<svg width="${width * sizeRatio}" height="${height * sizeRatio}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
	<path d="${getClothoidSquircle(width, height, radius, borderOffset, tension, 3)}" fill="${params.color}" />
</svg>`;
}

/**
 * @param {Params} params
 * @returns {string}
 */
function generateSuperEllipse(params) {
	const width = length(params.width, params.unit, params.dpi);
	const height = length(params.height, params.unit, params.dpi);
	const power = params.power;

	// xmlns をつけることで macOS のアイコンおよび Quick Look で表示される
	return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
	<path d="${getSuperEllipse(width, height, power, 3)}" fill="${params.color}" />
</svg>`;
}

/**
 * 単位をピクセルに変換する
 * @param {number} value 値
 * @param {string} unit 単位
 * @param {number} dpi 解像度
 * @returns {number} ピクセル
 */
function length(value, unit, dpi) {
	switch (unit) {
		case "px":
			return value;
		case "mm":
			return (value * dpi) / 25.4;
		case "cm":
			return (value * dpi) / 2.54;
		case "inch":
			return value * dpi;
		default:
			return value;
	}
}

/**
 * SVGをダウンロードする
 */
function downloadSVG() {
	const blob = new Blob([svgContent], { type: "image/svg+xml" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${createFileName(params)}.svg`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * ファイル名を作成する
 * @param {Params} params
 * @returns {string}
 */
function createFileName(params) {
	const unit = params.unit !== "px" ? params.unit : "";
	const size = `${params.width}x${params.height}${unit}`;
	const dpi = params.unit !== "px" ? `@${params.dpi}dpi` : "";

	switch (params.type) {
		case "clothoid": {
			return `clothoid-squirecle-${size}${dpi}-r${params.radius}${unit}-o${params.borderOffset}-t${params.tension}`;
		}
		case "super-ellipse":
			return `super-ellipse-${size}${dpi}-n${params.power}`;
		default:
			return "squircle";
	}
}

/**
 * SVGをクリップボードにコピーする
 */
function copySVG() {
	navigator.clipboard.writeText(svgContent);

	if (copiedTimer) clearTimeout(copiedTimer);
	copied = true;
	copiedTimer = setTimeout(() => {
		copied = false;
	}, 1200);
}
</script>

<div class="panel">
	<div class="preview">
		{@html svgContent}
	</div>
	<div class="mt-3 flex gap-2">
		<div class="flex-1">
			<button
				type="button"
				class="w-full text-sm py-2 px-1 text-center rounded-lg bg-white transition duration-100 hover:text-white hover:bg-indigo-600 active:text-white active:bg-indigo-700"
				on:click={downloadSVG}
			>
				保存
			</button>
		</div>
		<div class="flex-1 relative">
			<button
				type="button"
				class="w-full text-sm py-2 px-1 text-center rounded-lg bg-white transition duration-100 hover:text-white hover:bg-indigo-600 active:text-white active:bg-indigo-700"
				on:click={copySVG}
			>
				コピー
			</button>
			{#if copied}
				<div
					class="absolute flex justify-center bottom-full mb-2 left-0 right-0"
				>
					<span
						class="copied bg-indigo-500 text-white text-xs leading-5 px-1 rounded"
					>
						コピーしました
					</span>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;
	}

	.preview {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	}

	.preview :global(svg) {
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;
	}
</style>
