import { describe, expect, it } from "vitest";
import {
	classifyKanji,
	getYearOfKyoikuKanji,
	isAddedJoyoKanji2010,
	isJinmeiKanji,
	isJoyoKanji,
	isRemovedJoyoKanji2010,
} from "./joyoKanji";

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

describe("classifyKanji", () => {
	it("漢字でない文字はすべて false", () => {
		expect(classifyKanji("あ")).toEqual({
			char: "あ",
			isKanji: false,
			isJoyo: false,
			isJinmei: false,
			kyoikuYear: 0,
			isAdded2010: false,
			isRemoved2010: false,
		});
	});

	it("教育漢字の情報を返す", () => {
		expect(classifyKanji("学")).toMatchObject({
			isKanji: true,
			isJoyo: true,
			kyoikuYear: 1,
		});
	});

	it("2010年に人名用漢字から常用漢字に追加された字", () => {
		expect(classifyKanji("岡")).toMatchObject({
			isKanji: true,
			isJinmei: false,
			isAdded2010: true,
		});
	});
});
