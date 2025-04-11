<script>
import Dropzone from "./dropzone/Dropzone.svelte";

/**
 * @typedef {Object} Props
 * @property {({ file, blobURL }: { file: File, blobURL: string }) => any} onDrop
 * @property {string} [accept]
 * @property {string} [id]
 * @property {string} [class]
 * @property {string} [style]
 */

/** @type {Props} */
let { onDrop, ...restProps } = $props();

let fileOver = $state(false);

/** @type {string?} */
let previewURL = $state(null);

/** @type {(event: CustomEvent<any>) => any}*/
function handleDrop(event) {
	const { acceptedFiles } = event.detail;
	if (acceptedFiles.length === 0) {
		alert("画像ファイルを選択してください。");
		return;
	}

	const blobURL = URL.createObjectURL(acceptedFiles[0]);
	previewURL = blobURL;

	onDrop({ file: acceptedFiles[0], blobURL });

	fileOver = false;
}
</script>

<Dropzone
	{...restProps}
	accept="image/*"
	on:drop={handleDrop}
	on:dragenter={() => (fileOver = true)}
	on:dragleave={() => (fileOver = false)}
>
	<div class="container flex flex-col items-center justify-center h-full">
		<p class="overtext text-neutral-500 transition-opacity {fileOver || previewURL == null ? "opacity-100" : "opacity-0"}">ファイルをドロップ</p>
		{#if previewURL != null}
			<div class="preview transition-opacity {fileOver ? "opacity-30" : ""}">
				<img src={previewURL} alt="" class="img" />
			</div>
		{/if}
	</div>
</Dropzone>

<style lang="postcss">
	.container {
		position: relative;
	}
	.overtext {
		position: relative;
		z-index: 1;
		text-shadow: 0 0 1px rgb(248 250 252), 0 0 3px rgb(248 250 252), 0 0 5px rgb(248 250 252), 0 0 8px rgb(248 250 252);
	}
	.preview {
		position: absolute;
		inset: -0.75rem;
	}
	.preview .img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
