/**
 * 実体参照をデコードする
 *
 * @param {string} str
 * @returns {string}
 */
export function decodeHTMLEntities(str) {
	const el = document.createElement("div");
	el.innerHTML = str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	return el.textContent ?? "";
}
