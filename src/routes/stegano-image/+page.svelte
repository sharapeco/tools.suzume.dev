<script>
import DropImage from "../../components/DropImage.svelte";
import NavPills from "../../components/NavPills.svelte";
import SimpleToolLayout from "../../components/SimpleToolLayout.svelte";

/** @type {"encode" | "decode"} モード */
let mode = $state("encode");

const modes = [
	{ value: "encode", label: "埋め込む" },
	{ value: "decode", label: "復元" },
];

/** @type {string?} 隠れ蓑画像のURL */
let minoImage = $state(null);

/** @type {string?} 埋め込む画像のURL */
let srcImage = $state(null);

/** @type {string?} 出力画像のURL */
let encodedImage = $state(null);

/** @type {string?} 復元の入力画像URL */
let restoreInputImage = $state(null);

/** @type {string?} 復元された画像のURL */
let restoreOutputImage = $state(null);

/**
 * @param {string} url
 * @returns {Promise<HTMLCanvasElement>}
 */
function readImageAsCanvas(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext("2d");
			if (ctx == null) {
				reject(new Error("2D コンテキストの取得に失敗しました。"));
				return;
			}
			ctx.drawImage(img, 0, 0);
			resolve(canvas);
		};
		img.onerror = () => {
			reject(new Error("画像の読み込みに失敗しました。"));
		};
		img.src = url;
	});
}

async function encode() {
	if (minoImage == null || srcImage == null) {
		return;
	}

	try {
		const [minoCanvas, srcCanvas] = await Promise.all([
			readImageAsCanvas(minoImage),
			readImageAsCanvas(srcImage),
		]);

		const w = srcCanvas.width;
		const h = srcCanvas.height;

		const destCanvas = document.createElement("canvas");
		destCanvas.width = w;
		destCanvas.height = h;

		const destCtx = destCanvas.getContext("2d");
		if (destCtx == null) {
			throw new Error("2D コンテキストの取得に失敗しました。");
		}

		const [pw, ph, px, py] = ((mw, mh, sw, sh) => {
			const scale = Math.max(sw / mw, sh / mh);
			const pw = mw * scale;
			const ph = mh * scale;
			return [pw, ph, (sw - pw) / 2, (sh - ph) / 2];
		})(minoCanvas.width, minoCanvas.height, w, h);
		destCtx.drawImage(
			minoCanvas,
			0,
			0,
			minoCanvas.width,
			minoCanvas.height,
			px,
			py,
			pw,
			ph,
		);

		const srcCtx = srcCanvas.getContext("2d");
		if (srcCtx == null) {
			throw new Error("2D コンテキストの取得に失敗しました。");
		}

		const srcData = srcCtx.getImageData(0, 0, w, h).data;
		const imageData = destCtx.getImageData(0, 0, w, h).data;
		for (let i = 0; i < imageData.length; i += 4) {
			const [sr, sg, sb, sa] = srcData.slice(i, i + 4);
			const [mr, mg, mb, ma] = imageData.slice(i, i + 4);
			imageData[i + 0] = (mr & 0b11100000) | (sr >>> 3);
			imageData[i + 1] = (mg & 0b11110000) | (sb >>> 4);
			imageData[i + 2] = (mb & 0b11100000) | (sg >>> 3);
			imageData[i + 3] = (ma & 0b11100000) | (sa >>> 3);
		}

		// Twitterでできるだけ透過PNGにする
		imageData[3] &= 0b11111110;

		destCtx.putImageData(new ImageData(imageData, w, h), 0, 0);

		encodedImage = destCanvas.toDataURL("image/png");
	} catch (e) {
		console.error(e);
	}
}

async function decode() {
	if (restoreInputImage == null) {
		return;
	}

	try {
		const srcCanvas = await readImageAsCanvas(restoreInputImage);

		const w = srcCanvas.width;
		const h = srcCanvas.height;

		const destCanvas = document.createElement("canvas");
		destCanvas.width = w;
		destCanvas.height = h;

		const srcCtx = srcCanvas.getContext("2d");
		if (srcCtx == null) {
			throw new Error("2D コンテキストの取得に失敗しました。");
		}

		const destCtx = destCanvas.getContext("2d");
		if (destCtx == null) {
			throw new Error("2D コンテキストの取得に失敗しました。");
		}

		const srcData = srcCtx.getImageData(0, 0, w, h).data;
		const imageData = destCtx.getImageData(0, 0, w, h);
		const data = imageData.data;
		for (let i = 0; i < data.length; i += 4) {
			const [sr, sg, sb, sa] = srcData.slice(i, i + 4);
			data[i + 0] = ((sr << 3) & 0xff) | (sr >>> 5);
			data[i + 1] = ((sb << 3) & 0xff) | (sb >>> 5);
			data[i + 2] = ((sg << 4) & 0xff) | (sg >>> 4);
			data[i + 3] = ((sa << 3) & 0xff) | (sa >>> 5);
		}

		destCtx.putImageData(imageData, 0, 0);

		restoreOutputImage = destCanvas.toDataURL("image/png");
	} catch (e) {
		console.error(e);
	}
}
</script>

<svelte:head>
	<title>画像中画像</title>
</svelte:head>

<SimpleToolLayout title="画像中画像" height100percent>
	{#snippet description()}
		<p class="mt-2">
			画像に画像を埋め込むことができます（ステガノグラフィー）。非可逆変換ですが、リサイズや圧縮にも（ある程度）耐えます。
		</p>
	{/snippet}

	<div class="flex-1 flex flex-col">
		<div class="mb-3">
			<NavPills items={modes} value={mode} on:change={(e) => (mode = e.detail)} />
		</div>

		{#if mode === "encode"}
			<div class="flex-1 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
				<div class="group flex flex-col gap-3 border p-2 md:p-6">
					<label class="text-sm text-neutral-600" for="mino-image">隠れ蓑画像</label>
					<DropImage
						id="mino-image"
						onDrop={({ blobURL }) => {
							minoImage = blobURL;
							encode();
						}}
					/>
				</div>
				<div class="group flex flex-col gap-3 border p-2 md:p-6">
					<label class="text-sm text-neutral-600" for="src-image">隠す画像</label>
					<DropImage
						id="src-image"
						onDrop={({ blobURL }) => {
							srcImage = blobURL;
							encode();
						}}
					/>
				</div>
				<div class="group flex flex-col gap-3 border p-2 md:p-6">
					<label class="text-sm text-neutral-600" for="output-encoded-image">埋め込まれた画像</label>
					{#if encodedImage != null}
						<div class="output-image">
							<img src={encodedImage} alt="出力" class="max-w-full" />
						</div>
					{/if}
				</div>
			</div>
		{:else if mode === "decode"}
			<div class="flex-1 grid gap-4 sm:grid-cols-2">
				<div class="group flex flex-col gap-3 border p-2 md:p-6">
					<label class="text-sm text-neutral-600" for="encoded-image">埋め込まれた画像</label>
					<DropImage
						onDrop={({ blobURL }) => {
							restoreInputImage = blobURL;
							decode();
						}}
					/>
				</div>
				<div class="group flex flex-col gap-3 border p-2 md:p-6">
					<label class="text-sm text-neutral-600" for="output-decoded-image">復元された画像</label>
					{#if restoreOutputImage != null}
						<div class="output-image">
							<img src={restoreOutputImage} alt="出力" class="max-w-full" />
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</SimpleToolLayout>

<style lang="postcss">
.output-image {
	flex: 1;
}
.output-image img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}
</style>
