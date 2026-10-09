import { describe, expect, it } from "vitest";
import { decodeUnicodeNotation } from "./unicodeNotation";

describe("decodeUnicodeNotation", () => {
	it("U+XXXX 形式を文字にする", () => {
		expect(decodeUnicodeNotation("U+96C0 U+20BB7")).toBe("雀𠮷");
	});

	it("\\uXXXX と \\u{XXXXX} 形式を文字にする", () => {
		expect(decodeUnicodeNotation("\\u96C0\\u{20BB7}")).toBe("雀𠮷");
	});

	it("符号位置の表記以外はそのまま残す", () => {
		expect(decodeUnicodeNotation("すずめ U+96C0")).toBe("すずめ雀");
	});

	it("範囲外の符号位置は ? にする", () => {
		expect(decodeUnicodeNotation("U+110000")).toBe("?");
	});
});
