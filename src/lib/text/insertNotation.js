/**
 * value の [start, end) を prefix + 選択文字列 + suffix で置き換える。
 * カーソル位置は suffix の直前を返す。
 *
 * 例: wrapSelection("abc", 2, 2, "\\u{", "}") → { value: "ab\\u{}c", cursor: 5 }
 *
 * @param {string} value
 * @param {number} start
 * @param {number} end
 * @param {string} prefix
 * @param {string} suffix
 * @returns {{ value: string, cursor: number }}
 */
export function wrapSelection(value, start, end, prefix, suffix) {
	const s = Math.max(0, Math.min(start, value.length));
	const e = Math.max(s, Math.min(end, value.length));
	const selected = value.slice(s, e);
	return {
		value: value.slice(0, s) + prefix + selected + suffix + value.slice(e),
		cursor: s + prefix.length + selected.length,
	};
}
