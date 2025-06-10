<script>
import SimpleToolLayout from "../../components/SimpleToolLayout.svelte";
import { isJoyoKanji, isJinmeiKanji, isAddedJoyoKanji2010, isRemovedJoyoKanji2010, getYearOfKyoikuKanji } from "../../lib/kanji";

/**
 * @typedef {Object} Result
 * @property {string} char - 文字
 * @property {boolean} isKanji - 漢字かどうか
 * @property {boolean} isJoyo - 常用漢字かどうか
 * @property {boolean} isJinmei - 人名用漢字かどうか
 * @property {number} kyoikuYear - 教育漢字の場合の学年（0は教育漢字でない）
 * @property {boolean} isAdded2010 - 2010年に追加された常用漢字かどうか
 * @property {boolean} isRemoved2010 - 2010年に削除された常用漢字かどうか
 */

/** @type {HTMLTextAreaElement|null} */
let inputRef = $state(null);

/** @type {Array<Result>} */
let results = $state([]);

/**
 * @param {string} input
 */
function update(input) {
	results = Array.from(input).map(char => {
		const isKanji = /^[一-龥朗-鶴]+$/.test(char);
		if (!isKanji) {
			return {
				char,
				isKanji: false,
				isJoyo: false,
				isJinmei: false,
				kyoikuYear: 0,
				isAdded2010: false,
				isRemoved2010: false
			};
		}

		const kyoikuYear = getYearOfKyoikuKanji(char);
		const isJoyo = isJoyoKanji(char);
		const isJinmei = isJinmeiKanji(char);
		const isAdded2010 = isAddedJoyoKanji2010(char);
		const isRemoved2010 = isRemovedJoyoKanji2010(char);

		return {
			char,
			isKanji,
			isJoyo,
			isJinmei,
			kyoikuYear,
			isAdded2010,
			isRemoved2010
		};
	});
}

</script>

<svelte:head>
	<title>常用漢字チェッカー</title>
</svelte:head>

<SimpleToolLayout title="常用漢字チェッカー">
	{#snippet description()}
		<p class="mt-2">
			テキストに常用漢字表にない漢字・人名用漢字が含まれているか調べます。教育漢字の配当学年も分かります。
		</p>
		<p class="mt-2">
			凡例：<span class="kanji">常用外漢字</span>　<span class="kanji jinmei">人名用漢字</span>　<span class="kanji joyo kyoiku y2">教</span><span class="kanji joyo kyoiku y3">育</span><span class="kanji joyo kyoiku y3">漢</span><span class="kanji joyo kyoiku y1">字</span><small>（数字は学年）</small>
		</p>
		<p class="mt-2">
			2010年（平成22年）11月30日付の内閣告示による変更：<span class="kanji joyo added">追加</span>　<span class="kanji added joyo jinmei">もと人名用漢字</span>　<span class="kanji removed">削除</span>
		</p>
	{/snippet}

	<textarea
		name="input"
		class="w-full bg-slate-50 rounded border px-3 py-2"
		placeholder="ここに文章を入力..."
		autofocus
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
		padding-bottom: 0.75em;
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
