/**
 * 予約済み文字を実体参照に変換する
 *
 * @param {string} str
 * @returns {string}
 */
export function encodeHTMLEntities(str) {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

/**
 * 数値文字参照に変換する
 *
 * @param {string} str
 * @returns {string}
 */
export function convertToNumericCharacterReference(str) {
	let result = "";
	for (const ch of str) {
		result += `&#${ch.codePointAt(0)};`;
	}
	return result;
}
