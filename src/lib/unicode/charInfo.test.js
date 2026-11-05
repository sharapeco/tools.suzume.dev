import { describe, expect, it } from "vitest";
import {
	buildCharInfo,
	createUnicodeIndex,
	findBlock,
	isControlCodePoint,
	toAnnotation,
} from "./charInfo";

const TEST_INDEX = createUnicodeIndex({
	version: "18.0.0",
	blocks: [
		["0000", "007F", "Basic Latin"],
		["0100", "017F", "Latin Extended-A"],
		["4E00", "9FFF", "CJK Unified Ideographs"],
		["AC00", "D7A3", "Hangul Syllables"],
		["D800", "DB7F", "High Surrogates"],
		["E000", "F8FF", "Private Use Area"],
		["3D000", "3FC3F", "Small Seal"],
	],
	unlistedBlocks: ["4E00", "AC00", "D800", "E000", "3D000"],
	chunks: ["0000", "0001"],
});

/** @type {import("./namesList").ChunkData} */
const CHUNK0 = {
	subblocks: ["C0 controls", "ASCII punctuation and symbols"],
	chars: {
		0: { n: "<control>", s: 0, a: [["=", "NULL"]] },
		21: { n: "EXCLAMATION MARK", s: 1, a: [["x", "00A1", "inverted"]] },
		41: { n: "LATIN CAPITAL LETTER A" },
	},
};

describe("findBlock", () => {
	it("コードポイントを含むブロックを返す", () => {
		expect(findBlock(TEST_INDEX, 0x41)?.name).toBe("Basic Latin");
		expect(findBlock(TEST_INDEX, 0x5b57)?.name).toBe("CJK Unified Ideographs");
		expect(findBlock(TEST_INDEX, 0x3fc3f)?.name).toBe("Small Seal");
	});

	it("どのブロックにも入らなければ null", () => {
		expect(findBlock(TEST_INDEX, 0x0080)).toBeNull();
	});
});

describe("isControlCodePoint", () => {
	it("C0/C1 制御文字だけを true にする", () => {
		expect(isControlCodePoint(0x00)).toBe(true);
		expect(isControlCodePoint(0x1f)).toBe(true);
		expect(isControlCodePoint(0x20)).toBe(false);
		expect(isControlCodePoint(0x7f)).toBe(true);
		expect(isControlCodePoint(0x9f)).toBe(true);
		expect(isControlCodePoint(0xa0)).toBe(false);
		expect(isControlCodePoint(0x200b)).toBe(false);
	});
});

describe("toAnnotation", () => {
	it("注釈を種類ごとのオブジェクトにする", () => {
		expect(toAnnotation(["=", "factorial"])).toEqual({
			type: "alias",
			text: "factorial",
		});
		expect(toAnnotation(["x", "00A1", "inverted"])).toEqual({
			type: "xref",
			cp: 0xa1,
			name: "inverted",
			text: "inverted",
		});
		expect(toAnnotation(["x", "5143"])).toEqual({
			type: "xref",
			cp: 0x5143,
			name: null,
			text: "",
		});
		expect(toAnnotation(["~", "0030 FE00", "short"])).toEqual({
			type: "variation",
			sequence: [0x30, 0xfe00],
			text: "short",
		});
		expect(toAnnotation(["#", "0020", "<noBreak>"])).toEqual({
			type: "decomposition",
			canonical: false,
			sequence: [0x20],
			tag: "<noBreak>",
			text: "",
		});
		expect(toAnnotation([":", "0041 0304"])).toEqual({
			type: "decomposition",
			canonical: true,
			sequence: [0x41, 0x304],
			tag: null,
			text: "",
		});
	});
});

describe("buildCharInfo", () => {
	it("チャンクのデータから文字情報を組み立てる", () => {
		expect(buildCharInfo(0x21, CHUNK0, TEST_INDEX)).toEqual({
			cp: 0x21,
			status: "assigned",
			name: "EXCLAMATION MARK",
			block: "Basic Latin",
			subblock: "ASCII punctuation and symbols",
			annotations: [
				{ type: "xref", cp: 0xa1, name: "inverted", text: "inverted" },
			],
		});
		expect(buildCharInfo(0x41, CHUNK0, TEST_INDEX).subblock).toBeNull();
	});

	it("チャンクにない文字は未割り当て", () => {
		expect(buildCharInfo(0x7e, CHUNK0, TEST_INDEX)).toMatchObject({
			status: "unassigned",
			name: null,
			block: "Basic Latin",
		});
		expect(buildCharInfo(0x0080, null, TEST_INDEX)).toMatchObject({
			status: "unassigned",
			block: null,
		});
	});

	it("文字行のないブロックは名前を計算するか、種類を返す", () => {
		expect(buildCharInfo(0x5b57, null, TEST_INDEX)).toMatchObject({
			status: "assigned",
			name: "CJK UNIFIED IDEOGRAPH-5B57",
		});
		expect(buildCharInfo(0xd55c, null, TEST_INDEX).name).toBe(
			"HANGUL SYLLABLE HAN",
		);
		expect(buildCharInfo(0xd800, null, TEST_INDEX).status).toBe("surrogate");
		expect(buildCharInfo(0xe000, null, TEST_INDEX).status).toBe("private");
		expect(buildCharInfo(0x3d000, null, TEST_INDEX)).toMatchObject({
			status: "unlisted",
			name: null,
			block: "Small Seal",
		});
	});
});
