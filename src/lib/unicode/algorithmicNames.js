import { toHex } from "./namesList";

const S_BASE = 0xac00;
const L_COUNT = 19;
const V_COUNT = 21;
const T_COUNT = 28;
const N_COUNT = V_COUNT * T_COUNT;
const S_COUNT = L_COUNT * N_COUNT;

// biome-ignore format: 表として読みやすくする
const JAMO_L = ["G", "GG", "N", "D", "DD", "R", "M", "B", "BB", "S", "SS", "", "J", "JJ", "C", "K", "T", "P", "H"];
// biome-ignore format: 表として読みやすくする
const JAMO_V = ["A", "AE", "YA", "YAE", "EO", "E", "YEO", "YE", "O", "WA", "WAE", "OE", "YO", "U", "WEO", "WE", "WI", "YU", "EU", "YI", "I"];
// biome-ignore format: 表として読みやすくする
const JAMO_T = ["", "G", "GG", "GS", "N", "NJ", "NH", "D", "L", "LG", "LM", "LB", "LS", "LT", "LP", "LH", "M", "B", "BS", "S", "SS", "NG", "J", "C", "K", "T", "P", "H"];

/**
 * ハングル音節の文字名を計算する (Unicode 3.12 Conjoining Jamo Behavior)
 * @param {number} cp
 * @returns {string|null}
 */
export function hangulSyllableName(cp) {
	const s = cp - S_BASE;
	if (s < 0 || s >= S_COUNT) {
		return null;
	}
	const l = Math.floor(s / N_COUNT);
	const v = Math.floor((s % N_COUNT) / T_COUNT);
	const t = s % T_COUNT;
	return `HANGUL SYLLABLE ${JAMO_L[l]}${JAMO_V[v]}${JAMO_T[t]}`;
}

/**
 * NamesList に個別の行がないブロックの文字名を、ブロック名から計算する。
 * 計算方法がわからないブロックは null
 * @param {number} cp
 * @param {string} blockName
 * @returns {string|null}
 */
export function algorithmicName(cp, blockName) {
	if (blockName.startsWith("CJK Unified Ideographs")) {
		return `CJK UNIFIED IDEOGRAPH-${toHex(cp)}`;
	}
	if (blockName === "Tangut" || blockName === "Tangut Supplement") {
		return `TANGUT IDEOGRAPH-${toHex(cp)}`;
	}
	if (blockName === "Hangul Syllables") {
		return hangulSyllableName(cp);
	}
	return null;
}
