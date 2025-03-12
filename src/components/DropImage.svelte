<script>
import Dropzone from "svelte-file-dropzone";

/** @type {({ file, blobURL }: { file: File, blobURL: string }) => any} */
export let onDrop;

let fileOver = false;

/** @type {string?} */
let previewURL = null;

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
	on:drop={handleDrop}
	accept="image/*"
	on:dragenter={() => (fileOver = true)}
	on:dragleave={() => (fileOver = false)}
>
	<div class="flex flex-col items-center justify-center h-full">
		{#if fileOver}
			<p class="text-neutral-500">ここにファイルをドロップ</p>
		{:else}
			<p class="text-neutral-500">ファイルをドロップ</p>
		{/if}
		{#if previewURL != null}
			<img src={previewURL} alt="プレビュー" class="max-w-full" />
		{/if}
	</div>
</Dropzone>
