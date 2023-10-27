/**
 * TextDecoderを利用したテキストエンコーダ
 */
export class NaiveTextEncoder {
	/**
	 * @param {string} encoding
	 * @param {number} maxCodeLength
	 */
	constructor(encoding, maxCodeLength) {
		this.encoding = encoding.toLocaleLowerCase();
		this.maxCodeLength = maxCodeLength;
		this.map = createMap(encoding, maxCodeLength);
	}

	/**
	 * @param {string} str
	 * @returns {Uint8Array}
	 */
	encode(str) {
		const preprocessed = this.preprocess(str);

		const bytesList = [];
		for (const ch of preprocessed) {
			const bytes = this.map.get(ch);
			if (bytes) {
				bytesList.push(bytes);
			}
		}

		const encoded = new Uint8Array(bytesList.reduce((acc, bytes) => acc + bytes.length, 0));
		let pos = 0;
		for (const bytes of bytesList) {
			encoded.set(bytes, pos);
			pos += bytes.length;
		}

		return encoded;
	}

	/**
	 * 各エンコーディングに固有の前処理を行う
	 *
	 * @param {string} str
	 * @returns {string}
	 */
	preprocess(str) {
		switch (this.encoding) {
			case "shift_jis":
			case "euc-jp":
				return str
				.replace(/\u301c/g, "\uFF5E") // Wave Dash → Fullwidth Tilde
				.replace(/\u2212/g, "\uFF0D"); // Minus Sign → Fullwidth Hyphen-Minus
			default:
				return str;
		}
	}
}

/**
 * 符号の対応表を作成する
 *
 * @param {string} encoding
 * @param {number} maxCodeLength
 * @returns {Map<string, Uint8Array>}
 */
function createMap(encoding, maxCodeLength) {
	const map = new Map();
	const decoder = new TextDecoder(encoding);
	for (let len = 1; len <= maxCodeLength; len++) {
		for (const code of range(0, 2 ** (8 * len) - 1)) {
			const bytes = new Uint8Array(
				range(0, len - 1).map((b) => (code >> (8 * b)) & 0xff)
			);
			const ch = decoder.decode(bytes);
			if (ch.length === 1) {
				map.set(ch, bytes);
			}
		}
	}
	return map;
}

/**
 * [start, end] の範囲の数の配列を返す
 *
 * @param {number} start
 * @param {number} end
 * @returns {number[]}
 */
function range(start, end) {
	const result = [];
	for (let i = start; i <= end; i++) {
		result.push(i);
	}
	return result;
}
