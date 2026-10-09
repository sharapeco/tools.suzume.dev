/**
 * U+XXXX、\uXXXX、\u{XXXXXX} の形式で書かれた符号位置を文字に置き換える
 *
 * U+XXXX の前の空白は取り除く。不正な符号位置は "?" にする。
 *
 * @param {string} input
 * @returns {string}
 */
export function decodeUnicodeNotation(input) {
	return input.replaceAll(
		/ *(?:\bU\+([0-9A-Fa-f]{4,6})\b|\\u([0-9A-Fa-f]{4})|\\u\{([0-9A-Fa-f]{1,6})\})/g,
		(_, c1, c2, c3) => {
			const hex = c1 ?? c2 ?? c3;
			const codePoint = Number.parseInt(hex, 16);
			try {
				return String.fromCodePoint(codePoint);
			} catch {
				return "?";
			}
		},
	);
}
