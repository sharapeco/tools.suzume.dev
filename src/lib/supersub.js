class Replacer {
	/**
	 * @param {string} fromCharList
	 * @param {string|string[]} toCharList
	 */
	constructor(fromCharList, toCharList) {
		if (fromCharList.length !== toCharList.length) {
			throw new Error('Length of fromCharList and toCharList must be same.')
		}
		this.fr = fromCharList
		this.to = toCharList
		this.re = new RegExp('[' + fromCharList + ']', 'g')
	}

	/**
	 * @param {string} str
	 * @returns  {string}
	 */
	replace(str) {
		return str.replace(this.re, match => {
			const index = this.fr.indexOf(match)
			if (index < 0) return match
			return this.to[index]
		})
	}
}

const supReplacer = new Replacer(
	'0123456789+-−=()abcdefghijklmnoprstuvwxyzABDEGHIJKLMNOPRTUWいえイエセツト',
	[
		'⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁺', '⁻', '⁻', '⁼', '⁽', '⁾',
		'ᵃ', 'ᵇ', 'ᶜ', 'ᵈ', 'ᵉ', 'ᶠ', 'ᵍ', 'ʰ', 'ⁱ', 'ʲ', 'ᵏ', 'ˡ', 'ᵐ', 'ⁿ', 'ᵒ', 'ᵖ', 'ʳ', 'ˢ', 'ᵗ', 'ᵘ', 'ᵛ', 'ʷ', 'ˣ', 'ʸ', 'ᶻ',
		'ᴬ', 'ᴮ', 'ᴰ', 'ᴱ', 'ᴳ', 'ᴴ', 'ᴵ', 'ᴶ', 'ᴷ', 'ᴸ', 'ᴹ', 'ᴺ', 'ᴼ', 'ᴾ', 'ᴿ', 'ᵀ', 'ᵁ', 'ᵂ',
		'ゐ', 'ゑ', 'ヰ', 'ヱ', 'セ゚', 'ツ゚', 'ト゚',
	])

const subReplacer = new Replacer(
	'0123456789+-−=()aehijklmnoprstuvxあいうえおかけつやゆよわアイウエオカケツヤユヨワクシストヌハヒフヘホプムラリルレロ',
	[
		'₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉', '₊', '₋', '₋', '₌', '₍', '₎',
		'ₐ', 'ₑ', 'ₕ', 'ᵢ', 'ⱼ', 'ₖ', 'ₗ', 'ₘ', 'ₙ', 'ₒ', 'ₚ', 'ᵣ', 'ₛ', 'ₜ', 'ᵤ', 'ᵥ', 'ₓ',
		'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゕ', 'ゖ', 'っ', 'ゃ', 'ゅ', 'ょ', 'ゎ',
		'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ヵ', 'ヶ', 'ッ', 'ャ', 'ュ', 'ョ', 'ヮ',
		'ㇰ', 'ㇱ', 'ㇲ', 'ㇳ', 'ㇴ', 'ㇵ', 'ㇶ', 'ㇷ', 'ㇸ', 'ㇹ', 'ㇷ゚', 'ㇺ', 'ㇻ', 'ㇼ', 'ㇽ', 'ㇾ', 'ㇿ',
	])

/**
 * 上付き・下付き文字に変換する
 *
 * 入力は a^2 + b_{12} のような文字列で、この場合出力は a² + b₁₂ となる。
 *
 * @param {string} str
 * @returns {string}
 */
export function supersub(str) {
	const tokens = tokenize(str.normalize())
	const result = []
	let isSup = false
	let isSub = false
	for (const token of tokens) {
		if (token === '^') {
			isSup = true
		} else if (token === '_') {
			isSub = true
		} else {
			if (isSup) {
				result.push(supReplacer.replace(token))
			} else if (isSub) {
				result.push(subReplacer.replace(token))
			} else {
				result.push(token)
			}
			isSup = false
			isSub = false
		}
	}
	return result.join('');
}

/**
 * @param {string} str
 * @returns {string[]}
 */
function tokenize(str) {
	const tokens = []
	let token = ''
	let isEscape = false
	let inBrace = false
	for (let i = 0, len = str.length; i < len; i++) {
		const ch = str.charAt(i)
		if (isEscape) {
			token += ch
			isEscape = false
			continue
		}
		if (inBrace) {
			if (ch === '}') {
				inBrace = false
				if (token.length > 0) {
					tokens.push(token)
					token = ''
				}
				continue
			}
			if (ch === '{' || ch === '^' || ch === '_') {
				throw new Error('Unexpected ' + ch)
			}
		}
		if (ch === '\\') {
			isEscape = true
			continue
		}
		if (ch === '^' || ch === '_') {
			if (token.length > 0) {
				tokens.push(token)
				token = ''
			}
			tokens.push(ch)
			if (i + 1 >= len) {
				throw new Error('Unexpected end of string')
			}
			const next = str.charAt(i + 1)
			if (next === '{') {
				inBrace = true
				i++
			} else if (next === '^' || next === '_') {
				throw new Error('Unexpected ' + next)
			} else {
				tokens.push(next)
				i++
			}
			continue
		}
		token += ch
	}
	if (token.length > 0) {
		tokens.push(token)
	}
	if (inBrace || isEscape) {
		throw new Error('Unexpected end of string')
	}
	return tokens
}
