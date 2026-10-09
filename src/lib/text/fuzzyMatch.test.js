import { describe, expect, it } from "vitest";
import { fuzzyMatch, matchSegments } from "./fuzzyMatch";

describe("fuzzyMatch", () => {
	it("空のクエリは常にマッチする", () => {
		expect(fuzzyMatch("/qr", "")).toBe(true);
	});

	it("クエリの文字が順に現れればマッチする", () => {
		expect(fuzzyMatch("/unit-converter", "ucv")).toBe(true);
		expect(fuzzyMatch("/unit-converter", "vcu")).toBe(false);
	});

	it("大文字小文字とカタカナひらがなを区別しない", () => {
		expect(fuzzyMatch("QRコード生成", "qrこーど")).toBe(true);
	});
});

describe("matchSegments", () => {
	it("空のクエリではテキスト全体を1つのセグメントにする", () => {
		expect(matchSegments("<qr>", "")).toEqual([
			{ text: "<qr>", matched: false },
		]);
	});

	it("マッチした文字を分割する", () => {
		expect(matchSegments("/unit", "ui")).toEqual([
			{ text: "/", matched: false },
			{ text: "u", matched: true },
			{ text: "n", matched: false },
			{ text: "i", matched: true },
			{ text: "t", matched: false },
		]);
	});

	it("途中でマッチしなくなったら残りをそのまま返す", () => {
		expect(matchSegments("/qr", "qx")).toEqual([
			{ text: "/", matched: false },
			{ text: "q", matched: true },
			{ text: "r", matched: false },
		]);
	});
});
