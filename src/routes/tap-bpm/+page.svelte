<script>
import { onMount } from "svelte";
import SimpleToolLayout from "../../components/SimpleToolLayout.svelte";

let bpm = "--";
let startTime = -1;
let prevTime = -1;
let count = 0;
let active = false;

function calculateBpm() {
	const now = Date.now();
	if (startTime === -1 || now - prevTime > 5000) {
		startTime = now;
		count = 0;
		active = true;
		bpm = "--";
	} else {
		count++;
		const elapsed = now - startTime;
		bpm = ((count / elapsed) * 60000).toFixed(1);
	}
	prevTime = now;
}

// @ts-ignore
function handleKeydown(event) {
	const target = event.target;
	const tag = target?.tagName?.toLowerCase();
	const isTapButton = target?.classList.contains("js-tap-button");
	if (
		!isTapButton &&
		(tag === "input" ||
			tag === "textarea" ||
			tag === "select" ||
			tag === "button" ||
			tag === "a")
	) {
		return;
	}

	if (event.key === " " || event.key === "Enter") {
		event.preventDefault();
		calculateBpm();
	}
}

function handleTap() {
	calculateBpm();
}

function resetBpm() {
	bpm = "--";
	startTime = -1;
	prevTime = -1;
	count = 0;
	active = false;
}

onMount(() => {
	window.addEventListener("keydown", handleKeydown);

	return () => {
		window.removeEventListener("keydown", handleKeydown);
	};
});
</script>

<svelte:head>
	<title>BPM計測</title>
</svelte:head>

<SimpleToolLayout title="BPM計測">
	<svelte:fragment slot="description">
		<p class="mt-2">
			ボタンのタップまたはキーボードの <kbd>Space</kbd> <kbd>Enter</kbd> を押すことで、BPMを計測します。
		</p>
		<p class="mt-2">5秒以上間隔が空くとBPMがリセットされます</p>
	</svelte:fragment>

	<div class="flex flex-col items-center justify-center gap-6 py-8">
		<div
			class="text-2xl md:text-4xl font-bold mb-8 min-h-16 {active
				? 'text-indigo-600'
				: ''}"
		>
			<span class="text-4xl md:text-6xl">{bpm}</span> BPM
		</div>

		<button
			type="button"
			on:click={handleTap}
			class="js-tap-button bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-8 px-12 rounded-lg text-2xl shadow-lg w-full max-w-md h-48 transition duration-100 active:bg-indigo-700"
		>
			Tap!
		</button>

		<button
			type="button"
			on:click={resetBpm}
			class="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition duration-100 active:bg-slate-300"
		>
			リセット
		</button>
	</div>
</SimpleToolLayout>

<style>
	/* タップしたときの一瞬のフラッシュを防ぐ */
	button {
		-webkit-tap-highlight-color: transparent;
	}

	kbd {
		display: inline-block;
		padding: 0.125rem 0.375rem;
		font-size: 0.75em;
		line-height: 1;
		text-align: center;
		color: #2d3748;
		background-color: #f7fafc;
		border: 1px solid #e2e8f0;
		border-bottom-width: 3px;
		border-radius: 0.375rem;
	}
</style>
