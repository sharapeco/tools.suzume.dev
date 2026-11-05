import { describe, expect, it } from "vitest";
import {
	buildChunks,
	findUnlistedBlocks,
	parseAnnotation,
	parseNamesList,
} from "./namesList";

const SAMPLE = [
	"; charset=UTF-8",
	"@@@\tThe Unicode Standard 18.0.0",
	"@@\t0000\tC0 Controls and Basic Latin (Basic Latin)\t007F",
	"@@+",
	"@\t\tC0 controls",
	"@+\t\tAlias names are those for ISO/IEC 6429:1992.",
	"0000\t<control>",
	"\t= NULL",
	"@\t\tASCII punctuation and symbols",
	"0021\tEXCLAMATION MARK",
	"\t= factorial",
	"\tx (inverted exclamation mark - 00A1)",
	"0030\tDIGIT ZERO",
	"\t~ 0030 FE00 short diagonal stroke form",
	"@@\t00F0\tTest Block\t01FF",
	"@\t\tSpanning subblock",
	"00FF\tLAST IN CHUNK",
	"0100\tFIRST IN NEXT CHUNK",
	"\t: 0041 0304",
	"@@\t4E00\tCJK Unified Ideographs\t9FFF",
	"@@\t20A0\tCurrency Symbols\t20CF",
	"@\t\tCurrency symbols",
	"@+\t\tA number of currency symbols are found in other blocks.",
	"\t\tx (dollar sign - 0024)",
	"20A0\tEURO-CURRENCY SIGN",
	"",
].join("\n");

describe("parseAnnotation", () => {
	it("相互参照の2つの書式を解析する", () => {
		expect(parseAnnotation("x", "(no-break space - 00A0)")).toEqual([
			"x",
			"00A0",
			"no-break space",
		]);
		expect(parseAnnotation("x", "5143")).toEqual(["x", "5143"]);
	});

	it("異体字シーケンスを解析する", () => {
		expect(
			parseAnnotation("~", "0030 FE00 short diagonal stroke form"),
		).toEqual(["~", "0030 FE00", "short diagonal stroke form"]);
	});

	it("分解を解析し、末尾の文字名は捨てる", () => {
		expect(parseAnnotation("#", "<noBreak> 0020")).toEqual([
			"#",
			"0020",
			"<noBreak>",
		]);
		expect(parseAnnotation("#", "<font> 0077 latin small letter w")).toEqual([
			"#",
			"0077",
			"<font>",
		]);
		expect(parseAnnotation(":", "0300 combining grave accent")).toEqual([
			":",
			"0300",
		]);
		expect(parseAnnotation(":", "0041 0304")).toEqual([":", "0041 0304"]);
	});

	it("別名・コメントはそのまま", () => {
		expect(parseAnnotation("=", "factorial")).toEqual(["=", "factorial"]);
		expect(parseAnnotation("*", "sometimes considered a control code")).toEqual(
			["*", "sometimes considered a control code"],
		);
	});
});

describe("parseNamesList", () => {
	const parsed = parseNamesList(SAMPLE);

	it("バージョンとブロックを読む", () => {
		expect(parsed.version).toBe("18.0.0");
		expect(parsed.blocks[0]).toEqual([
			0x0000,
			0x007f,
			"C0 Controls and Basic Latin (Basic Latin)",
		]);
		expect(parsed.blocks).toHaveLength(4);
	});

	it("文字にサブブロックと注釈を割り当てる", () => {
		expect(parsed.chars.get(0x0000)).toEqual({
			name: "<control>",
			subblock: "C0 controls",
			annotations: [["=", "NULL"]],
		});
		expect(parsed.chars.get(0x0021)).toEqual({
			name: "EXCLAMATION MARK",
			subblock: "ASCII punctuation and symbols",
			annotations: [
				["=", "factorial"],
				["x", "00A1", "inverted exclamation mark"],
			],
		});
	});

	it("ブロックの説明に付いた注釈は文字に付けない", () => {
		expect(parsed.chars.get(0x20a0)?.annotations).toEqual([]);
		expect(parsed.chars.get(0x0030)?.annotations).toEqual([
			["~", "0030 FE00", "short diagonal stroke form"],
		]);
	});

	it("文字行のないブロックを見つける", () => {
		expect(findUnlistedBlocks(parsed).map(([start]) => start)).toEqual([
			0x4e00,
		]);
	});
});

describe("buildChunks", () => {
	const chunks = buildChunks(parseNamesList(SAMPLE).chars);

	it("0x100 ごとに分け、キーはチャンク内オフセットの16進", () => {
		expect([...chunks.keys()]).toEqual([0x00, 0x01, 0x20]);
		expect(chunks.get(0x00)?.chars["21"]).toEqual({
			n: "EXCLAMATION MARK",
			s: 1,
			a: [
				["=", "factorial"],
				["x", "00A1", "inverted exclamation mark"],
			],
		});
	});

	it("チャンクの境界をまたぐサブブロックは両方のチャンクに入る", () => {
		const c0 = chunks.get(0x00);
		const c1 = chunks.get(0x01);
		expect(c0?.subblocks[c0.chars.FF.s ?? -1]).toBe("Spanning subblock");
		expect(c1?.subblocks[c1.chars["0"].s ?? -1]).toBe("Spanning subblock");
	});

	it("注釈のない文字は a を持たない", () => {
		expect(chunks.get(0x00)?.chars.FF).toEqual({ n: "LAST IN CHUNK", s: 2 });
	});
});
