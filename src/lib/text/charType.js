/**
 * @param {string} c
 * @returns {boolean}
 */
export function isHiragana(c) {
	return "ぁ" <= c && c <= "ん";
}

/**
 * @param {string} c
 * @returns {boolean}
 */
export function isKatakana(c) {
	return "ァ" <= c && c <= "ン";
}

/**
 * @param {string} c
 * @returns {boolean}
 */
export function isKanji(c) {
	return /^[一-龥朗-鶴]+$/.test(c);
}
