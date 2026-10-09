import { describe, expect, it } from "vitest";
import {
	getYearOfKyoikuKanji,
	isAddedJoyoKanji2010,
	isHiragana,
	isJinmeiKanji,
	isJoyoKanji,
	isKanji,
	isKatakana,
	isRemovedJoyoKanji2010,
} from "./kanji";

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

describe("漢字の分類", () => {
	it("教育漢字の学年を返す", () => {
		expect(getYearOfKyoikuKanji("一")).toBe(1);
		expect(getYearOfKyoikuKanji("引")).toBe(2);
		expect(getYearOfKyoikuKanji("異")).toBe(6);
		expect(getYearOfKyoikuKanji("雀")).toBe(0);
	});

	it("常用漢字を判定する（1981年版の常用漢字表）", () => {
		expect(isJoyoKanji("愛")).toBe(true);
		expect(isJoyoKanji("勺")).toBe(true);
		expect(isJoyoKanji("挨")).toBe(false);
		expect(isJoyoKanji("雀")).toBe(false);
	});

	it("2010年の常用漢字表改定の追加・削除を判定する", () => {
		expect(isAddedJoyoKanji2010("挨")).toBe(true);
		expect(isAddedJoyoKanji2010("愛")).toBe(false);
		expect(isRemovedJoyoKanji2010("勺")).toBe(true);
		expect(isRemovedJoyoKanji2010("愛")).toBe(false);
	});

	it("人名用漢字を判定する", () => {
		expect(isJinmeiKanji("杏")).toBe(true);
		expect(isJinmeiKanji("愛")).toBe(false);
	});
});
