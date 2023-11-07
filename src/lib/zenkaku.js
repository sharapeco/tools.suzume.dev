/**
 * 結合文字を合成
 *
 * @param {string} value
 * @returns {string}
 */
export function normalize(value) {
	return value.replaceAll(/[^\u{212B}\u{F900}-\u{FAD9}]+/gu, (match) => match.normalize("NFC"));
}

/**
 * @param {string} value
 * @returns {string}
 */
export function hiraganaToKatakana(value) {
	return normalize(value).replace(/[\u3041-\u3096\u309D\u309E]/g, (match) =>
		String.fromCharCode(match.charCodeAt(0) + 0x60)
	)
}

/**
 * @param {string} value
 * @returns {string}
 */
export function katakanaToHiragana(value) {
	return normalize(value).replace(/[\u30A1-\u30F6\u30FD\u30FE]/g, (match) =>
		String.fromCharCode(match.charCodeAt(0) - 0x60)
	)
}

/**
 * @param {string} value
 * @returns {string}
 */
export function stripFullwidthForm(value) {
	return normalize(value).replace(/[！-｝]/gu, (match) =>
		String.fromCharCode(match.charCodeAt(0) - 0xfee0)
	)
}

/**
 * @param {string} value
 * @returns {string}
 */
export function toFullwidthForm(value) {
	return normalize(value).replace(/[!-}]/gu, (match) =>
		String.fromCharCode(match.charCodeAt(0) + 0xfee0)
	)
}

/**
 * 日本語組版用に全角形文字を正規化する
 *
 * @param {string} value
 * @returns {string}
 */
export function stripFullwidthFormJP(value) {
	return normalize(value).replace(/[＂-＇＊-／０-９＠Ａ-Ｚ＾-｀ａ-ｚ]/gu, (match) =>
		String.fromCharCode(match.charCodeAt(0) - 0xfee0)
	)
}

const jisx0201Kana = {
	re: /([\uff66-\uff9c]\uff9e)|([\uff8a-\uff8e]\uff9f)|([\uff61-\uff9f])/g,
	chars: [
		'｡',
		'｢',
		'｣',
		'､',
		'･',
		'ｦ',
		'ｧ',
		'ｨ',
		'ｩ',
		'ｪ',
		'ｫ',
		'ｬ',
		'ｭ',
		'ｮ',
		'ｯ',
		'ｰ',
		'ｱ',
		'ｲ',
		'ｳ',
		'ｴ',
		'ｵ',
		'ｶ',
		'ｷ',
		'ｸ',
		'ｹ',
		'ｺ',
		'ｻ',
		'ｼ',
		'ｽ',
		'ｾ',
		'ｿ',
		'ﾀ',
		'ﾁ',
		'ﾂ',
		'ﾃ',
		'ﾄ',
		'ﾅ',
		'ﾆ',
		'ﾇ',
		'ﾈ',
		'ﾉ',
		'ﾊ',
		'ﾋ',
		'ﾌ',
		'ﾍ',
		'ﾎ',
		'ﾏ',
		'ﾐ',
		'ﾑ',
		'ﾒ',
		'ﾓ',
		'ﾔ',
		'ﾕ',
		'ﾖ',
		'ﾗ',
		'ﾘ',
		'ﾙ',
		'ﾚ',
		'ﾛ',
		'ﾜ',
		'ﾝ',
		'ﾞ',
		'ﾟ',
		'ｦﾞ',
		'ｳﾞ',
		'ｶﾞ',
		'ｷﾞ',
		'ｸﾞ',
		'ｹﾞ',
		'ｺﾞ',
		'ｻﾞ',
		'ｼﾞ',
		'ｽﾞ',
		'ｾﾞ',
		'ｿﾞ',
		'ﾀﾞ',
		'ﾁﾞ',
		'ﾂﾞ',
		'ﾃﾞ',
		'ﾄﾞ',
		'ﾊﾞ',
		'ﾊﾟ',
		'ﾋﾞ',
		'ﾋﾟ',
		'ﾌﾞ',
		'ﾌﾟ',
		'ﾍﾞ',
		'ﾍﾟ',
		'ﾎﾞ',
		'ﾎﾟ',
		'ﾜﾞ',
	],
}

const regularKana = {
	re: /([ァ​-ヶ、。「」゛゜・ー])/ug,
	chars: [
		'。',
		'「',
		'」',
		'、',
		'・',
		'ヲ',
		'ァ',
		'ィ',
		'ゥ',
		'ェ',
		'ォ',
		'ャ',
		'ュ',
		'ョ',
		'ッ',
		'ー',
		'ア',
		'イ',
		'ウ',
		'エ',
		'オ',
		'カ',
		'キ',
		'ク',
		'ケ',
		'コ',
		'サ',
		'シ',
		'ス',
		'セ',
		'ソ',
		'タ',
		'チ',
		'ツ',
		'テ',
		'ト',
		'ナ',
		'ニ',
		'ヌ',
		'ネ',
		'ノ',
		'ハ',
		'ヒ',
		'フ',
		'ヘ',
		'ホ',
		'マ',
		'ミ',
		'ム',
		'メ',
		'モ',
		'ヤ',
		'ユ',
		'ヨ',
		'ラ',
		'リ',
		'ル',
		'レ',
		'ロ',
		'ワ',
		'ン',
		'゛',
		'゜',
		'ヺ',
		'ヴ',
		'ガ',
		'ギ',
		'グ',
		'ゲ',
		'ゴ',
		'ザ',
		'ジ',
		'ズ',
		'ゼ',
		'ゾ',
		'ダ',
		'ヂ',
		'ヅ',
		'デ',
		'ド',
		'バ',
		'パ',
		'ビ',
		'ピ',
		'ブ',
		'プ',
		'ベ',
		'ペ',
		'ボ',
		'ポ',
		'ヷ',
	],
}

/**
 * @param {string} value
 * @returns {string}
 */
export function stripJISX0201Kana(value) {
	return normalize(value).replace(jisx0201Kana.re, (match) => {
		const index = jisx0201Kana.chars.indexOf(match)
		if (index < 0) return match
		return regularKana.chars[index]
	})
}

/**
 * @param {string} value
 * @returns {string}
 */
export function toJISX0201Kana(value) {
	return normalize(value).replace(regularKana.re, (match) => {
		const index = regularKana.chars.indexOf(match)
		if (index < 0) return match
		return jisx0201Kana.chars[index]
	})
}

const verticalForms = "︐︑︒︓︔︕︖︗︘︙︰︱︲︳︴︵︶︷︸︹︺︻︼︽︾︿﹀﹁﹂﹃﹄﹇﹈";
const regularForms = "，、。：；！？〖〗…‥―‐＿﹏（）｛｝〔〕【】《》〈〉「」『』［］";

/**
 * @param {string} value
 * @returns {string}
 */
export function stripVerticalForms(value) {
	return value.replace(new RegExp(`[${verticalForms}]`, "g"), (match) =>
		regularForms[verticalForms.indexOf(match)]
	);
}
