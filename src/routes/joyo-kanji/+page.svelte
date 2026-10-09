<script>
import { inputBaseClass } from "$components/inputClasses.js";
import SimpleToolLayout from "$components/SimpleToolLayout.svelte";
import { classifyKanji } from "$lib/joyo-kanji/joyoKanji";

/** @type {HTMLTextAreaElement|null} */
let inputRef = $state(null);

/** @type {Array<import("$lib/joyo-kanji/joyoKanji").KanjiInfo>} */
let results = $state([]);

/**
 * @param {string} input
 */
function update(input) {
	results = Array.from(input).map(classifyKanji);
}
</script>

<svelte:head>
	<title>常用漢字チェッカー</title>
</svelte:head>

<SimpleToolLayout title="常用漢字チェッカー">
	{#snippet description()}
		<div class="flex flex-col gap-2">
			<p>
				テキストに常用漢字表にない漢字・人名用漢字が含まれているか調べます。教育漢字の配当学年も分かります。
			</p>
			<p>
				凡例：<span class="kanji">常用外漢字</span>　<span class="kanji jinmei">人名用漢字</span>　<span class="kanji joyo kyoiku y2">教</span><span class="kanji joyo kyoiku y3">育</span><span class="kanji joyo kyoiku y3">漢</span><span class="kanji joyo kyoiku y1">字</span><small>（数字は配当学年）</small>
			</p>
			<p>
				2010年（平成22年）11月30日付の内閣告示による変更：<span class="kanji joyo added">常用漢字に追加</span>　<span class="kanji added joyo jinmei">人名用漢字から常用漢字へ</span>　<span class="kanji removed">常用漢字から削除</span>
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
		{#each results as result}
			{#if result.char === "\n"}
				<div class="w-full"></div>
			{:else}
				<span
					class="letter"
					class:kanji={result.isKanji}
					class:joyo={result.isJoyo}
					class:jinmei={result.isJinmei}
					class:added={result.isAdded2010}
					class:removed={result.isRemoved2010}
					class:kyoiku={result.kyoikuYear > 0}
					class:y1={result.kyoikuYear === 1}
					class:y2={result.kyoikuYear === 2}
					class:y3={result.kyoikuYear === 3}
					class:y4={result.kyoikuYear === 4}
					class:y5={result.kyoikuYear === 5}
					class:y6={result.kyoikuYear === 6}
				>
					{result.char}
				</span>
			{/if}
		{/each}
	</div>
</SimpleToolLayout>

<style lang="postcss">
	.results {
		font-family: "YuMincho", "游明朝", "Hiragino Mincho ProN", serif;
	}

	.letter {
		font-size: 180%;
		line-height: 1;
		margin-bottom: 0.75em;
	}

	.kanji {
		position: relative;
		background: yellow;
	}

	.kanji.joyo {
		background: transparent;
	}

	.kanji.joyo.added {
		background: #dfd;
	}

	.kanji.removed {
		background: #fc0;
	}

	.kanji.jinmei {
		background: #faa;
	}

	.kanji.joyo.jinmei {
		border-bottom: solid 3px #faa;
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
