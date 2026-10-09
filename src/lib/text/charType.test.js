import { describe, expect, it } from "vitest";
import { isHiragana, isKanji, isKatakana } from "./charType";

describe("文字種の判定", () => {
	it("ひらがな・カタカナ・漢字を判定する", () => {
		expect(isHiragana("あ")).toBe(true);
		expect(isHiragana("ア")).toBe(false);
		expect(isKatakana("ア")).toBe(true);
		expect(isKatakana("あ")).toBe(false);
		expect(isKanji("雀")).toBe(true);
		expect(isKanji("あ")).toBe(false);
	});
});
