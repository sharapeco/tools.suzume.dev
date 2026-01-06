<script>
import { onMount } from "svelte";
import {
	buttonPrimaryClass,
	buttonSecondaryClass,
	buttonSizeClass,
} from "$components/inputClasses.js";
import SimpleToolLayout from "$components/SimpleToolLayout.svelte";

let bpm = $state("--");
let bps = $state("--");
let msec = $state("--");
let startTime = -1;
let count = 0;
let active = $state(false);
let inactivateTid = 0;

function beat() {
	const now = Date.now();
	if (startTime === -1) {
		startTime = now;
		count = 0;
		active = true;
		bpm = "--";
		bps = "--";
	} else {
		count++;
		const elapsed = now - startTime;
		const bpmValue = (count / elapsed) * 60000;
		bpm = bpmValue.toFixed(1);
		bps = (bpmValue / 60).toFixed(2);
		msec = (60000 / bpmValue).toFixed(1);
	}

	beatEffect();

	if (inactivateTid) {
		clearTimeout(inactivateTid);
	}
	inactivateTid = setTimeout(() => inactivate(), 5000);
}

function inactivate() {
	startTime = -1;
	active = false;
}

// @ts-expect-error
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
		beat();
	}
	if (event.key === "R" || event.key === "r") {
		resetBpm();
	}
}

function resetBpm() {
	bpm = "--";
	startTime = -1;
	count = 0;
	active = false;

	/** @type {HTMLButtonElement?} */
	const button = document.querySelector(".js-tap-button");
	if (button) {
		button.focus();
	}
}

onMount(() => {
	window.addEventListener("keydown", handleKeydown);

	return () => {
		window.removeEventListener("keydown", handleKeydown);
	};
});

/**
 * タップしたときにボタンに ripple effect を追加
 */
function beatEffect() {
	const button = document.querySelector(".js-tap-button");
	if (!button) return;

	const ripple = document.createElement("div");
	ripple.classList.add("ripple");
	button.appendChild(ripple);

	setTimeout(() => {
		ripple.remove();
	}, 1000);
}
</script>

<svelte:head>
	<title>BPM計測</title>
</svelte:head>

<SimpleToolLayout title="BPM計測">
	{#snippet description()}
		<div class="flex flex-col gap-2">
			<p>
				ボタンのタップまたはキーボードの <kbd>Space</kbd> <kbd>Enter</kbd> を押すことで、BPMを計測します。
			</p>
			<p><kbd>R</kbd> キーを押すか、5秒以上間隔が空くとBPMがリセットされます</p>
		</div>
	{/snippet}

	<div class="flex flex-col items-center justify-center gap-6 py-8">
		<div class="mb-8 min-h-16 text-center {active ? 'text-indigo-600' : 'text-neutral-600'}">
			<div class="text-2xl md:text-4xl font-bold">
				<span class="text-4xl md:text-6xl">{bpm}</span> BPM
			</div>
			<div class="mt-2">
				<span>{bps}</span> Hz ({msec} ms)
			</div>
		</div>

		<button
			type="button"
			onclick={beat}
			class={`js-tap-button ${buttonPrimaryClass} py-8 px-12 text-2xl rounded-lg shadow-lg w-full max-w-md h-48 active:bg-indigo-700`}
		>
			Tap!
		</button>

		<button
			type="button"
			onclick={resetBpm}
			class={`mt-4 ${buttonSizeClass} ${buttonSecondaryClass}`}
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

	.js-tap-button {
		position: relative;
	}

	:global(.ripple) {
		--ripple-size: 600px;
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--ripple-size);
		height: var(--ripple-size);
		margin: calc(var(--ripple-size) / -2);
		background-color: rgba(255, 255, 255, 0.15);
		border-radius: 50%;
		transform: scale(0);
		animation: ripple-animation 1s ease-out 1;
		pointer-events: none;
	}

	@keyframes ripple-animation {
		0% {
			transform: scale(0);
		}
		100% {
			transform: scale(1);
			opacity: 0;
		}
	}
</style>
