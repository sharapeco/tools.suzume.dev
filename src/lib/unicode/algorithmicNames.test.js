import { describe, expect, it } from "vitest";
import { algorithmicName, hangulSyllableName } from "./algorithmicNames";

describe("hangulSyllableName", () => {
	it("ハングル音節の名前を計算する", () => {
		expect(hangulSyllableName(0xac00)).toBe("HANGUL SYLLABLE GA");
		expect(hangulSyllableName(0xd7a3)).toBe("HANGUL SYLLABLE HIH");
		expect(hangulSyllableName(0xd55c)).toBe("HANGUL SYLLABLE HAN");
		expect(hangulSyllableName(0xc544)).toBe("HANGUL SYLLABLE A");
	});

	it("範囲外は null", () => {
		expect(hangulSyllableName(0xabff)).toBeNull();
		expect(hangulSyllableName(0xd7a4)).toBeNull();
	});
});

describe("algorithmicName", () => {
	it("CJK統合漢字と西夏文字", () => {
		expect(algorithmicName(0x5b57, "CJK Unified Ideographs")).toBe(
			"CJK UNIFIED IDEOGRAPH-5B57",
		);
		expect(algorithmicName(0x20000, "CJK Unified Ideographs Extension B")).toBe(
			"CJK UNIFIED IDEOGRAPH-20000",
		);
		expect(algorithmicName(0x17000, "Tangut")).toBe("TANGUT IDEOGRAPH-17000");
	});

	it("計算方法がわからないブロックは null", () => {
		expect(algorithmicName(0x3d000, "Small Seal")).toBeNull();
	});
});
