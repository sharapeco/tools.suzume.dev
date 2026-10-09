<script>
import { tick } from "svelte";
import { inputBaseClass } from "$components/inputClasses.js";
import SimpleToolLayout from "$components/SimpleToolLayout.svelte";
import { classifyKanji } from "$lib/joyo-kanji/joyoKanji";
import { placeTooltip } from "$lib/ui/tooltipPlacement";
import KanjiHistoryTooltip from "./KanjiHistoryTooltip.svelte";

const TOOLTIP_ID = "kanji-history-tooltip";

/** @type {HTMLTextAreaElement|null} */
let inputRef = $state(null);

/** @type {Array<import("$lib/joyo-kanji/joyoKanji").KanjiInfo>} */
let results = $state([]);

/** ツールチップを表示している字の位置 */
let activeIndex = /** @type {number | null} */ ($state(null));
/** クリック・タップで開いたときは、ポインターが離れたりフォーカスが外れたりしても閉じない */
let pinned = $state(false);
/** @type {HTMLElement | null} */
let anchor = null;
/** @type {HTMLElement | null} */
let tooltipRef = $state(null);
/** @type {{ left: number, top: number } | null} */
let tooltipPosition = $state(null);
/** @type {ReturnType<typeof setTimeout> | undefined} */
let closeTimer;

let activeResult = $derived(
	activeIndex === null ? null : (results[activeIndex] ?? null),
);

/**
 * @param {string} input
 */
function update(input) {
	closeTooltip();
	results = Array.from(input).map(classifyKanji);
}

/**
 * @param {number} index
 * @param {HTMLElement} element
 * @param {boolean} pin
 */
async function openTooltip(index, element, pin) {
	clearTimeout(closeTimer);
	pinned = pin;
	if (activeIndex === index) return;
	activeIndex = index;
	anchor = element;
	tooltipPosition = null;
	await tick();
	positionTooltip();
}

function closeTooltip() {
	clearTimeout(closeTimer);
	activeIndex = null;
	pinned = false;
	anchor = null;
	tooltipPosition = null;
}

function closeTooltipLater() {
	clearTimeout(closeTimer);
	closeTimer = setTimeout(closeTooltip, 100);
}

function positionTooltip() {
	if (!anchor || !tooltipRef) return;
	const { left, top } = placeTooltip(
		anchor.getBoundingClientRect(),
		tooltipRef.getBoundingClientRect(),
		{ width: window.innerWidth, height: window.innerHeight },
	);
	tooltipPosition = { left, top };
}

/**
 * @param {number} index
 * @returns {Record<string, (event: any) => void>}
 */
function triggerHandlers(index) {
	return {
		/** @param {PointerEvent & { currentTarget: HTMLElement }} event */
		onpointerenter(event) {
			if (event.pointerType === "mouse") {
				openTooltip(
					index,
					event.currentTarget,
					pinned && activeIndex === index,
				);
			}
		},
		/** @param {PointerEvent} event */
		onpointerleave(event) {
			if (event.pointerType === "mouse" && !pinned) closeTooltipLater();
		},
		/** @param {FocusEvent & { currentTarget: HTMLElement }} event */
		onfocus(event) {
			openTooltip(index, event.currentTarget, pinned && activeIndex === index);
		},
		/** @param {FocusEvent} event */
		onblur(event) {
			// ツールチップの中を押したときは閉じない
			if (tooltipRef?.matches(":hover")) return;
			// Tab キーで別の要素に移ったときは、クリックで開いていても閉じる
			if (!pinned || event.relatedTarget) closeTooltip();
		},
		/** @param {MouseEvent & { currentTarget: HTMLElement }} event */
		onclick(event) {
			if (activeIndex === index && pinned) {
				closeTooltip();
			} else {
				openTooltip(index, event.currentTarget, true);
			}
		},
	};
}

/**
 * ツールチップと字の外を押したら閉じる
 *
 * @param {PointerEvent} event
 */
function handleDocumentPointerDown(event) {
	if (activeIndex === null) return;
	const target = /** @type {Element} */ (event.target);
	if (target.closest?.(`[data-kanji-trigger], #${TOOLTIP_ID}`)) return;
	closeTooltip();
}

/**
 * @param {KeyboardEvent} event
 */
function handleWindowKeyDown(event) {
	if (event.key === "Escape" && activeIndex !== null) closeTooltip();
}

/**
 * @param {import("$lib/joyo-kanji/joyoKanji").KanjiInfo} result
 */
function letterClasses(result) {
	return {
		letter: true,
		kanji: result.isKanji,
		joyo: result.isJoyo,
		jinmei: result.isJinmei,
		changed: result.history.length > 0,
		kyoiku: result.kyoikuYear > 0,
		[`y${result.kyoikuYear}`]: result.kyoikuYear > 0,
	};
}
</script>

<svelte:head>
	<title>常用漢字チェッカー</title>
</svelte:head>

<svelte:document onpointerdown={handleDocumentPointerDown} />
<svelte:window
	onkeydown={handleWindowKeyDown}
	onresize={positionTooltip}
	onscrollcapture={positionTooltip}
/>

<SimpleToolLayout title="常用漢字チェッカー">
	{#snippet description()}
		<div class="flex flex-col gap-2">
			<p>
				テキストに常用漢字表にない漢字・人名用漢字が含まれているか調べます。教育漢字の配当学年も分かります。
			</p>
			<!-- 背景色の高さを本文と同じにするため、見本は inline のまま span で包む -->
			<div class="flex flex-wrap items-baseline gap-x-4 gap-y-3">
				<span class="text-sm font-bold pl-3">凡例</span>
				<span><span class="kanji">常用外漢字</span></span>
				<span><span class="kanji jinmei">人名用漢字</span></span>
				<span><span class="kanji joyo kyoiku y2">教</span><span class="kanji joyo kyoiku y3">育</span><span class="kanji joyo kyoiku y3">漢</span><span class="kanji joyo kyoiku y1">字</span><small>（数字は配当学年）</small></span>
				<span><span class="changed">注釈あり</span></span>
			</div>
			<p class="text-sm">
				常用漢字表（2010年）、人名用漢字（2026年6月26日現在）、学年別漢字配当表（2017年告示）によります。
			</p>
		</div>
	{/snippet}

	<textarea
		name="input"
		class={inputBaseClass}
		placeholder="ここに文章を入力..."
		oninput={() => inputRef && update(inputRef.value)}
		bind:this={inputRef}
	></textarea>

	<div class="mt-6 flex flex-wrap results">
		{#each results as result, index}
			{#if result.char === "\n"}
				<div class="w-full"></div>
			{:else if result.history.length > 0}
				<button
					type="button"
					class={letterClasses(result)}
					data-kanji-trigger
					aria-describedby={activeIndex === index ? TOOLTIP_ID : undefined}
					{...triggerHandlers(index)}
				>
					{result.char}
				</button>
			{:else}
				<span class={letterClasses(result)}>{result.char}</span>
			{/if}
		{/each}
	</div>

	{#if activeResult}
		<KanjiHistoryTooltip
			id={TOOLTIP_ID}
			char={activeResult.char}
			history={activeResult.history}
			position={tooltipPosition}
			bind:element={tooltipRef}
			onpointerenter={(event) => {
				if (event.pointerType === "mouse") clearTimeout(closeTimer);
			}}
			onpointerleave={(event) => {
				if (event.pointerType === "mouse" && !pinned) closeTooltipLater();
			}}
		/>
	{/if}
</SimpleToolLayout>

<style lang="postcss">
	.results {
		font-family: "YuMincho", "游明朝", "Hiragino Mincho ProN", serif;
	}

	.letter {
		font-size: 180%;
		line-height: 1;
		margin-bottom: 0.75em;
		/* 点線のある字とない字で高さをそろえる */
		border-bottom: 3px solid transparent;
	}

	button.letter {
		padding: 0;
		border-top: 0;
		border-left: 0;
		border-right: 0;
		color: inherit;
		font-family: inherit;
		cursor: help;
	}

	.kanji {
		position: relative;
		background-color: yellow;
		/* 背景色を下の点線（border）にかぶせない */
		background-clip: padding-box;
	}

	.kanji.joyo {
		background-color: transparent;
	}

	.kanji.jinmei {
		background-color: #faa;
	}

	.changed {
		border-bottom: 3px dotted rgb(107 114 128);
	}

	.kyoiku:after {
		display: block;
		position: absolute;
		left: 50%;
		top: 0;
		width: 1em;
		height: 1em;
		line-height: 1;
		margin: -0.9em 0 0 -0.5em;
		font-size: 50%;
		text-align: center;
		color: #4af;
	}

	.y1:after { content: "1"; }
	.y2:after { content: "2"; }
	.y3:after { content: "3"; }
	.y4:after { content: "4"; }
	.y5:after { content: "5"; }
	.y6:after { content: "6"; }
</style>
