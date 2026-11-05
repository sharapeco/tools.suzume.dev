<script>
import {
	buttonResultClass,
	buttonSizeClass,
} from "$components/inputClasses.js";
import { isControlCodePoint } from "$lib/unicode/charInfo";
import { toHex } from "$lib/unicode/namesList";

/**
 * @typedef {object} Props
 * @property {string} letter
 * @property {number} cp
 * @property {import("$lib/text/specialChars").SpecialChar|undefined} sp
 * @property {import("$lib/unicode/charInfo").CharInfo|undefined} info 未取得なら undefined
 * @property {boolean} error
 * @property {boolean} pinned
 * @property {() => void} onUnpin
 */

/** @type {Props} */
let { letter, cp, sp, info, error, pinned, onUnpin } = $props();

/** @type {Record<import("$lib/unicode/charInfo").Annotation["type"], string>} */
const typeLabels = {
	alias: "別名",
	formalAlias: "正式な別名",
	note: "注記",
	xref: "関連文字",
	variation: "異体字",
	decomposition: "分解",
};

/** @type {Record<import("$lib/unicode/charInfo").CharStatus, string>} */
const statusMessages = {
	assigned: "",
	unassigned: "未割り当てのコードポイントです",
	unlisted: "このブロックの文字名は収録されていません",
	private: "私用領域の文字です",
	surrogate: "サロゲートです（単独では文字になりません）",
};

let copied = $state(false);

const hex = $derived(toHex(cp));

/**
 * @param {number} c
 */
function u(c) {
	return `U+${toHex(c)}`;
}

/**
 * @param {number[]} seq
 */
function render(seq) {
	return String.fromCodePoint(...seq);
}

/**
 * @param {import("$lib/unicode/charInfo").Annotation} ann
 */
function labelOf(ann) {
	if (ann.type === "decomposition" && ann.canonical) {
		return "正準分解";
	}
	return typeLabels[ann.type];
}

function copy() {
	navigator.clipboard.writeText(letter);
	copied = true;
	setTimeout(() => {
		copied = false;
	}, 1200);
}
</script>

<section
	class="relative mt-4 rounded-lg border bg-slate-50 p-4"
	aria-live="polite"
	aria-label="文字の詳細"
>
	{#if pinned}
		<!-- 文字を変えて固定し直したときも刺し直す -->
		{#key cp}
			<button
				type="button"
				class="pin text-indigo-500 hover:text-indigo-600"
				title="固定を解除"
				aria-label="固定を解除"
				onclick={onUnpin}
			>
				<!-- 針の先 (12, 21) が下端の中央に来るように切り出す -->
				<!-- 水平な縁は楕円にして、斜め上から見た形にする -->
				<svg viewBox="6 2 12 19" fill="currentColor" aria-hidden="true">
					<!-- 針 -->
					<path d="M11.4 14h1.2v6.3l-0.6 0.7-0.6-0.7z" />
					<!-- 頭とつば -->
					<path d="M9 3A3 1 0 0 1 15 3l-1 6 3 3v2A5 1.3 0 0 1 7 14v-2l3-3z" />
				</svg>
			</button>
		{/key}
	{/if}
	<div class="flex items-start gap-4">
		<div class="font-hiragino glyph text-5xl shrink-0">
			{#if sp != null}
				<span class="sp-label">{sp.label}</span>
			{:else}
				{letter}
			{/if}
		</div>
		<div class="min-w-0 flex-1">
			<div class="font-mono text-sm text-gray-500">U+{hex}</div>
			<div class="mt-1 font-semibold leading-[1.1] break-words">
				{#if info?.name}
					{info.name}
				{:else if error}
					<span class="text-red-500">文字情報を読み込めませんでした</span>
				{:else if info == null}
					<span class="text-gray-400">読み込み中…</span>
				{:else}
					<span class="text-gray-500">{statusMessages[info.status]}</span>
				{/if}
			</div>
			{#if info?.block}
				<div class="mt-1 text-sm leading-[1.15] text-gray-600">
					{info.block}{#if info.subblock}
						<span class="inline-block px-1 text-lg leading-none text-gray-400">›</span>{info.subblock}
					{/if}
				</div>
			{/if}
		</div>
	</div>

	{#if info && info.annotations.length > 0}
		<dl class="annotations mt-3 max-h-64 overflow-y-auto text-sm">
			{#each info.annotations as ann, i}
				<dt class="text-xs text-gray-500 pt-0.5">
					{#if i === 0 || labelOf(info.annotations[i - 1]) !== labelOf(ann)}
						{labelOf(ann)}
					{/if}
				</dt>
				<dd class="break-words">
					{#if ann.type === "xref"}
						{#if ann.cp != null}
							<span class="font-hiragino">{String.fromCodePoint(ann.cp)}</span>
							<span class="font-mono text-xs text-gray-500">{u(ann.cp)}</span>
						{/if}
						{ann.text}
					{:else if ann.type === "variation"}
						<span class="font-hiragino">{render(ann.sequence)}</span>
						<span class="font-mono text-xs text-gray-500">
							{ann.sequence.map(u).join(" ")}
						</span>
						{ann.text}
					{:else if ann.type === "decomposition"}
						{#if ann.tag}
							<span class="font-mono text-xs text-gray-500">{ann.tag}</span>
						{/if}
						<span class="font-hiragino">{render(ann.sequence)}</span>
						<span class="font-mono text-xs text-gray-500">
							{ann.sequence.map(u).join(" ")}
						</span>
						{ann.text}
					{:else}
						{ann.text}
					{/if}
				</dd>
			{/each}
		</dl>
	{/if}

	<div class="mt-3 flex flex-wrap items-center gap-2">
		<div class="relative">
			<button
				type="button"
				class="{buttonSizeClass} {buttonResultClass}"
				onclick={copy}
			>
				文字をコピー
			</button>
			{#if copied}
				<div class="absolute flex justify-center top-full mt-1 left-0 right-0">
					<span
						class="copied bg-indigo-500 text-white text-xs leading-5 px-1 rounded"
					>
						コピーしました
					</span>
				</div>
			{/if}
		</div>
		{#if !isControlCodePoint(cp)}
			<a
				href="https://www.compart.com/en/unicode/U+{hex}"
				class="text-sm text-indigo-600 hover:underline"
				target="_blank"
				rel="noopener"
			>
				compart.com で見る ↗
			</a>
		{/if}
	</div>
</section>

<style lang="postcss">
	.copied {
		animation: copy-animation 1200ms ease; /* copy-animation は app.css に定義済み */
		animation-fill-mode: both;
	}

	/*
	 * ピン。針の先がパネル左上 (14px, 14px) に刺さり、頭は左上の外に出る。
	 * 針の先を回転の中心にして -45° 傾ける。回転後の translateY は針の向きに沿った移動になる
	 */
	.pin {
		--pin-w: 20px;
		--pin-h: 32px;
		position: absolute;
		z-index: 1;
		left: calc(14px - var(--pin-w) / 2);
		top: calc(14px - var(--pin-h));
		width: var(--pin-w);
		height: var(--pin-h);
		transform-origin: 50% 100%;
		transform: rotate(-45deg);
		animation: pin-stab 180ms ease-out both;
	}

	.pin svg {
		width: 100%;
		height: 100%;
	}

	/*
	 * 前半 (〜40%): 針の向きにまっすぐ刺さる（少し行き過ぎて戻る）
	 * 後半: 刺さった針の先を中心に、ばねのように揺れて止まる
	 */
	@keyframes pin-stab {
		0% {
			transform: rotate(-45deg) translateY(-20px);
			opacity: 0;
		}
		25% {
			transform: rotate(-45deg) translateY(2px);
			opacity: 0.5;
		}
		40% {
			transform: rotate(-45deg) translateY(0);
			opacity: 1;
		}
		55% {
			transform: rotate(-37deg) translateY(0);
		}
		70% {
			transform: rotate(-50deg) translateY(0);
		}
		85% {
			transform: rotate(-43deg) translateY(0);
		}
		100% {
			transform: rotate(-45deg) translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pin {
			animation: none;
		}
	}

	.glyph {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 1.4em;
		min-height: 1.4em;
		line-height: 1;
		border-radius: 0.25rem;
		background-color: theme(colors.white);
		border: solid 1px theme(colors.slate.200);
	}

	.sp-label {
		padding: 0.2em;
		font-family: monospace;
		font-size: 30%;
		white-space: pre-line;
		text-align: center;
		color: theme(colors.slate.500);
	}

	.annotations {
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: 0.75rem;
		row-gap: 0.25rem;
	}
</style>
