import { katakanaToHiragana } from "./zenkaku";

/**
 * @typedef {Object} MatchSegment
 * @property {string} text
 * @property {boolean} matched クエリの文字にマッチした部分かどうか
 */

/**
 * テキストがクエリにマッチするかどうかを判定する
 *
 * クエリの各文字がテキスト中にこの順序で現れればマッチとみなす。
 * カタカナとひらがな、大文字と小文字は区別しない。
 *
 * @param {string} text
 * @param {string} query
 * @returns {boolean} マッチするかどうか
 */
export function fuzzyMatch(text, query) {
	const fText = filterQuery(text);
	const fQuery = filterQuery(query);
	if (fQuery === "") {
		return true;
	}
	let p = 0;
	for (const c of fQuery) {
		const mp = fText.indexOf(c, p);
		if (mp === -1) {
			return false;
		}
		p = mp + 1;
	}
	return true;
}

/**
 * テキストをクエリにマッチした部分とそれ以外に分割する
 *
 * @param {string} text
 * @param {string} query
 * @returns {MatchSegment[]}
 */
export function matchSegments(text, query) {
	if (query === "") {
		return [{ text, matched: false }];
	}
	const fText = filterQuery(text);
	const fQuery = filterQuery(query);
	/** @type {MatchSegment[]} */
	const segments = [];
	let p = 0;
	for (const char of fQuery) {
		const mp = fText.indexOf(char, p);
		if (mp === -1) {
			break;
		}
		if (mp > p) {
			segments.push({ text: text.slice(p, mp), matched: false });
		}
		segments.push({ text: text.slice(mp, mp + 1), matched: true });
		p = mp + 1;
	}
	if (p < text.length) {
		segments.push({ text: text.slice(p), matched: false });
	}
	return segments;
}

/**
 * @param {string} query
 * @returns {string} 無視する文字を除去した文字列
 */
function filterQuery(query) {
	return katakanaToHiragana(query).toLocaleLowerCase();
}
