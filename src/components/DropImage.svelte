<script>
	import DropFile from "@svelte-parts/drop-file";

	/** @type {({ file, blobURL }: { file: File, blobURL: string }) => any} */
	export let onDrop;

	let fileOver = false;

	/** @type {string?} */
	let previewURL = null;

	/** @type {(files: File[]) => any}*/
	function handleDrop(files) {
		const imageFiles = files.filter((file) => file.type.startsWith("image/"));
		if (imageFiles.length === 0) {
			alert("画像ファイルを選択してください。");
			return;
		}

		const blobURL = URL.createObjectURL(imageFiles[0]);
		previewURL = blobURL;

		onDrop({ file: imageFiles[0], blobURL });

		fileOver = false;
	}
</script>

<DropFile onDrop={handleDrop} onEnter={() => (fileOver = true)} onLeave={() => (fileOver = false)}>
	<div class="flex flex-col items-center justify-center h-full">
		{#if fileOver}
			<p class="text-neutral-500">ここにファイルをドロップ</p>
		{:else}
			<p class="text-neutral-500">ファイルをドロップ</p>
		{/if}
		{#if previewURL != null}
			<img src={previewURL} alt="プレビュー" class="max-w-full">
		{/if}
	</div>
</DropFile>
