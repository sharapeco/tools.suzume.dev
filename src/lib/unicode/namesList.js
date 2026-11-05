/**
 * Unicode の NamesList.txt を解析し、コードポイント範囲ごとのチャンクに分ける。
 * 書式: https://www.unicode.org/Public/UNIDATA/NamesList.html
 */

/**
 * 注釈の生データ。先頭は注釈の記号
 * - ["=", 別名] / ["%", 正式な別名] / ["*", 注記]
 * - ["x", コードポイント(16進), 名前?] 相互参照。解析できない書式は ["x", "", 原文]
 * - ["~", シーケンス(16進をスペース区切り), 説明] 異体字シーケンス
 * - ["#", シーケンス, タグ?] 互換分解 / [":", シーケンス] 正準分解
 * @typedef {string[]} RawAnnotation
 */

/**
 * @typedef {object} ParsedChar
 * @property {string} name
 * @property {string|null} subblock
 * @property {RawAnnotation[]} annotations
 */

/**
 * @typedef {object} ParsedNamesList
 * @property {string|null} version
 * @property {Array<[number, number, string]>} blocks [開始, 終了, ブロック名]
 * @property {Map<number, ParsedChar>} chars
 */

/**
 * チャンクファイルの中身。chars のキーはチャンク内オフセットの16進
 * @typedef {object} ChunkData
 * @property {string[]} subblocks
 * @property {Record<string, {n: string, s?: number, a?: RawAnnotation[]}>} chars
 */

/** 1チャンクに入るコードポイント数のビット数 (0x100) */
export const CHUNK_BITS = 8;

/**
 * @param {number} cp
 */
export function chunkIdOf(cp) {
	return cp >> CHUNK_BITS;
}

/**
 * @param {number} chunkId
 */
export function chunkFileName(chunkId) {
	return `${toHex(chunkId)}.json`;
}

/**
 * @param {number} n
 */
export function toHex(n) {
	return n.toString(16).toUpperCase().padStart(4, "0");
}

const HEX_SEQ = "[0-9A-F]{4,6}(?: [0-9A-F]{4,6})*";
const reCharLine = /^([0-9A-F]{4,6})\t(.+)$/;
const reBlockLine = /^@@\t([0-9A-F]{4,6})\t(.+?)\t([0-9A-F]{4,6})$/;
const reSubblockLine = /^@\t\t(.+)$/;
const reVersion = /^@@@\t.*?(\d+\.\d+\.\d+)/;
const reAnnotation = /^\t([=%*x~#:]) (.+)$/;
const reXrefParen = new RegExp(`^\\((.*) - (${HEX_SEQ})\\)$`);
const reXrefBare = new RegExp(`^(${HEX_SEQ})$`);
const reVariation = new RegExp(`^(${HEX_SEQ}) (.+)$`);
const reDecomposition = new RegExp(
	`^(?:(<[^>]+>) )?(${HEX_SEQ})(?: [^0-9A-F].*)?$`,
);

/**
 * @param {string} mark
 * @param {string} body
 * @returns {RawAnnotation}
 */
export function parseAnnotation(mark, body) {
	switch (mark) {
		case "x": {
			const paren = body.match(reXrefParen);
			if (paren) {
				return paren[1] === "" ? ["x", paren[2]] : ["x", paren[2], paren[1]];
			}
			const bare = body.match(reXrefBare);
			if (bare) {
				return ["x", bare[1]];
			}
			return ["x", "", body];
		}
		case "~": {
			const m = body.match(reVariation);
			return m ? ["~", m[1], m[2]] : ["~", "", body];
		}
		case "#": {
			const m = body.match(reDecomposition);
			if (!m) {
				return ["#", "", body];
			}
			return m[1] ? ["#", m[2], m[1]] : ["#", m[2]];
		}
		case ":": {
			const m = body.match(reDecomposition);
			return m ? [":", m[2]] : [":", "", body];
		}
		default:
			return [mark, body];
	}
}

/**
 * @param {string} text NamesList.txt の内容
 * @returns {ParsedNamesList}
 */
export function parseNamesList(text) {
	/** @type {string|null} */
	let version = null;
	/** @type {Array<[number, number, string]>} */
	const blocks = [];
	/** @type {Map<number, ParsedChar>} */
	const chars = new Map();

	/** @type {string|null} */
	let subblock = null;
	/** @type {ParsedChar|null} */
	let current = null;

	for (const line of text.split(/\r?\n/)) {
		const charMatch = line.match(reCharLine);
		if (charMatch) {
			current = { name: charMatch[2], subblock, annotations: [] };
			chars.set(Number.parseInt(charMatch[1], 16), current);
			continue;
		}

		if (line.startsWith("@")) {
			// ブロック・サブブロックの見出しや説明が来たら、それ以降の注釈は文字のものではない
			current = null;
			const block = line.match(reBlockLine);
			if (block) {
				blocks.push([
					Number.parseInt(block[1], 16),
					Number.parseInt(block[3], 16),
					block[2],
				]);
				subblock = null;
				continue;
			}
			const sub = line.match(reSubblockLine);
			if (sub) {
				subblock = sub[1];
				continue;
			}
			const ver = line.match(reVersion);
			if (ver && version == null) {
				version = ver[1];
			}
			continue;
		}

		if (current) {
			const ann = line.match(reAnnotation);
			if (ann) {
				current.annotations.push(parseAnnotation(ann[1], ann[2]));
			}
		}
	}

	return { version, blocks, chars };
}

/**
 * 文字行が1つもないブロック（CJK統合漢字など）を返す
 * @param {ParsedNamesList} parsed
 * @returns {Array<[number, number, string]>}
 */
export function findUnlistedBlocks(parsed) {
	const codePoints = [...parsed.chars.keys()].sort((a, b) => a - b);
	return parsed.blocks.filter(([start, end]) => {
		// 二分探索で start 以上の最初のコードポイントを探す
		let lo = 0;
		let hi = codePoints.length;
		while (lo < hi) {
			const mid = (lo + hi) >> 1;
			if (codePoints[mid] < start) {
				lo = mid + 1;
			} else {
				hi = mid;
			}
		}
		return !(lo < codePoints.length && codePoints[lo] <= end);
	});
}

/**
 * 文字をチャンクに分ける
 * @param {Map<number, ParsedChar>} chars
 * @returns {Map<number, ChunkData>}
 */
export function buildChunks(chars) {
	/** @type {Map<number, ChunkData>} */
	const chunks = new Map();
	const sorted = [...chars.entries()].sort((a, b) => a[0] - b[0]);
	for (const [cp, ch] of sorted) {
		const id = chunkIdOf(cp);
		let chunk = chunks.get(id);
		if (!chunk) {
			chunk = { subblocks: [], chars: {} };
			chunks.set(id, chunk);
		}

		/** @type {{n: string, s?: number, a?: RawAnnotation[]}} */
		const entry = { n: ch.name };
		if (ch.subblock != null) {
			let s = chunk.subblocks.indexOf(ch.subblock);
			if (s < 0) {
				s = chunk.subblocks.push(ch.subblock) - 1;
			}
			entry.s = s;
		}
		if (ch.annotations.length > 0) {
			entry.a = ch.annotations;
		}
		chunk.chars[(cp & ((1 << CHUNK_BITS) - 1)).toString(16).toUpperCase()] =
			entry;
	}
	return chunks;
}
