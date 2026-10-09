<script>
/**
 * @typedef {Object} Props
 * @property {string} id
 * @property {string} char - 対象の字
 * @property {Array<import("$lib/joyo-kanji/joyoKanji").KanjiChangeDescription>} history
 * @property {{ left: number, top: number } | null} position - null の間は表示しない（大きさを測るため描画はする）
 * @property {HTMLElement | null} [element]
 * @property {(event: PointerEvent) => void} [onpointerenter]
 * @property {(event: PointerEvent) => void} [onpointerleave]
 */

/** @type {Props} */
let {
	id,
	char,
	history,
	position,
	element = $bindable(null),
	onpointerenter,
	onpointerleave,
} = $props();
</script>

<div
	{id}
	role="tooltip"
	class="fixed z-10 max-w-xs rounded bg-gray-800 px-3 py-2 text-sm text-white shadow-lg"
	class:invisible={!position}
	style:left="{position?.left ?? 0}px"
	style:top="{position?.top ?? 0}px"
	bind:this={element}
	{onpointerenter}
	{onpointerleave}
>
	<p class="mb-1 font-bold">「{char}」の変遷</p>
	<ul>
		{#each history as { date, text }}
			<li><span class="text-gray-300">{date}</span>　{text}</li>
		{/each}
	</ul>
</div>
