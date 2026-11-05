import { algorithmicName } from "./algorithmicNames";
import { CHUNK_BITS, chunkIdOf } from "./namesList";

/**
 * 生成スクリプトが出力する索引 (unicodeIndex.json)。数値は16進文字列
 * @typedef {object} RawUnicodeIndex
 * @property {string} version
 * @property {Array<[string, string, string]>} blocks [開始, 終了, ブロック名]
 * @property {string[]} unlistedBlocks 文字行のないブロックの開始コードポイント
 * @property {string[]} chunks データファイルがあるチャンクID
 */

/**
 * @typedef {object} Block
 * @property {number} start
 * @property {number} end
 * @property {string} name
 * @property {boolean} unlisted 文字ごとの行がないブロック
 */

/**
 * @typedef {object} UnicodeIndex
 * @property {string} version
 * @property {Block[]} blocks 開始コードポイント順
 * @property {Set<number>} chunkIds
 */

/**
 * @typedef {{type: "alias" | "formalAlias" | "note", text: string}
 *   | {type: "xref", cp: number|null, name: string|null, text: string}
 *   | {type: "variation", sequence: number[], text: string}
 *   | {type: "decomposition", canonical: boolean, sequence: number[], tag: string|null, text: string}
 * } Annotation
 */

/**
 * - assigned: 文字名あり
 * - unassigned: 未割り当て
 * - unlisted: 割り当て済みのブロックだが、個別の文字名が収録されていない
 * - private: 私用領域
 * - surrogate: サロゲート
 * @typedef {"assigned" | "unassigned" | "unlisted" | "private" | "surrogate"} CharStatus
 */

/**
 * @typedef {object} CharInfo
 * @property {number} cp
 * @property {CharStatus} status
 * @property {string|null} name
 * @property {string|null} block
 * @property {string|null} subblock
 * @property {Annotation[]} annotations
 */

/**
 * @param {RawUnicodeIndex} raw
 * @returns {UnicodeIndex}
 */
export function createUnicodeIndex(raw) {
	const unlisted = new Set(raw.unlistedBlocks);
	return {
		version: raw.version,
		blocks: raw.blocks.map(([start, end, name]) => ({
			start: Number.parseInt(start, 16),
			end: Number.parseInt(end, 16),
			name,
			unlisted: unlisted.has(start),
		})),
		chunkIds: new Set(raw.chunks.map((id) => Number.parseInt(id, 16))),
	};
}

/**
 * @param {UnicodeIndex} index
 * @param {number} cp
 * @returns {Block|null}
 */
export function findBlock(index, cp) {
	const { blocks } = index;
	let lo = 0;
	let hi = blocks.length - 1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		const b = blocks[mid];
		if (cp < b.start) {
			hi = mid - 1;
		} else if (cp > b.end) {
			lo = mid + 1;
		} else {
			return b;
		}
	}
	return null;
}

/**
 * C0/C1 制御文字 (名前が <control> の文字)
 * @param {number} cp
 */
export function isControlCodePoint(cp) {
	return (cp >= 0 && cp <= 0x1f) || (cp >= 0x7f && cp <= 0x9f);
}

/**
 * @param {string} seq 16進をスペース区切りで並べたもの
 * @returns {number[]}
 */
function parseSequence(seq) {
	return seq === "" ? [] : seq.split(" ").map((h) => Number.parseInt(h, 16));
}

/**
 * @param {import("./namesList").RawAnnotation} raw
 * @returns {Annotation}
 */
export function toAnnotation(raw) {
	const [mark, a = "", b = null] = raw;
	switch (mark) {
		case "=":
			return { type: "alias", text: a };
		case "%":
			return { type: "formalAlias", text: a };
		case "x":
			return a === ""
				? { type: "xref", cp: null, name: null, text: b ?? "" }
				: {
						type: "xref",
						cp: Number.parseInt(a, 16),
						name: b,
						text: b ?? "",
					};
		case "~":
			return { type: "variation", sequence: parseSequence(a), text: b ?? "" };
		case "#":
		case ":":
			return {
				type: "decomposition",
				canonical: mark === ":",
				sequence: parseSequence(a),
				tag: a === "" ? null : b,
				text: a === "" ? (b ?? "") : "",
			};
		default:
			return { type: "note", text: a };
	}
}

/**
 * チャンクのデータと索引から、1コードポイントの文字情報を組み立てる
 * @param {number} cp
 * @param {import("./namesList").ChunkData|null} chunk 該当チャンク。データファイルがなければ null
 * @param {UnicodeIndex} index
 * @returns {CharInfo}
 */
export function buildCharInfo(cp, chunk, index) {
	const block = findBlock(index, cp);
	/** @type {CharInfo} */
	const info = {
		cp,
		status: "unassigned",
		name: null,
		block: block?.name ?? null,
		subblock: null,
		annotations: [],
	};

	const offset = (cp & ((1 << CHUNK_BITS) - 1)).toString(16).toUpperCase();
	const entry = chunk?.chars[offset];
	if (entry) {
		info.status = "assigned";
		info.name = entry.n;
		info.subblock =
			entry.s != null ? (chunk?.subblocks[entry.s] ?? null) : null;
		info.annotations = (entry.a ?? []).map(toAnnotation);
		return info;
	}

	if (block?.unlisted) {
		if (block.name.includes("Surrogates")) {
			info.status = "surrogate";
		} else if (block.name.includes("Private Use")) {
			info.status = "private";
		} else {
			const name = algorithmicName(cp, block.name);
			info.status = name != null ? "assigned" : "unlisted";
			info.name = name;
		}
	}
	return info;
}

/**
 * このコードポイントの情報がデータファイルにありうるか
 * @param {UnicodeIndex} index
 * @param {number} cp
 */
export function hasChunk(index, cp) {
	return index.chunkIds.has(chunkIdOf(cp));
}
