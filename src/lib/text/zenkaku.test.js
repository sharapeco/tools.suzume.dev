import { describe, expect, it } from "vitest";
import {
	hiraganaToKatakana,
	katakanaToHiragana,
	normalize,
	stripFullwidthForm,
	stripFullwidthFormJP,
	stripJISX0201Kana,
	stripVerticalForms,
	toFullwidthForm,
	toJISX0201Kana,
} from "./zenkaku";

describe("normalize", () => {
	it("結合文字を合成する", () => {
		expect(normalize("が")).toBe("が");
	});

	it("CJK互換漢字は合成しない", () => {
		expect(normalize("豈")).toBe("豈");
	});
});

describe("hiraganaToKatakana / katakanaToHiragana", () => {
	it("ひらがなをカタカナにする", () => {
		expect(hiraganaToKatakana("すずめ、ゝゞ")).toBe("スズメ、ヽヾ");
	});

	it("カタカナをひらがなにする", () => {
		expect(katakanaToHiragana("スズメ、ヽヾ")).toBe("すずめ、ゝゞ");
	});
});

describe("全角形", () => {
	it("全角英数記号を半角にする", () => {
		expect(stripFullwidthForm("ＡＢＣ１２３！")).toBe("ABC123!");
	});

	it("半角英数記号を全角にする", () => {
		expect(toFullwidthForm("ABC123!")).toBe("ＡＢＣ１２３！");
	});

	it("日本語組版用では全角の括弧と感嘆符を残す", () => {
		expect(stripFullwidthFormJP("（ＡＢＣ１２３！）")).toBe("（ABC123！）");
	});
});

describe("JIS X 0201 カナ", () => {
	it("半角カナを全角カナにする", () => {
		expect(stripJISX0201Kana("ｽｽﾞﾒ")).toBe("スズメ");
	});

	it("全角カナを半角カナにする", () => {
		expect(toJISX0201Kana("スズメ")).toBe("ｽｽﾞﾒ");
	});
});

describe("stripVerticalForms", () => {
	it("縦書き用の文字を通常の文字にする", () => {
		expect(stripVerticalForms("︵︶")).toBe("（）");
	});
});
