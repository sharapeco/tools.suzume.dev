import { describe, expect, it } from "vitest";
import { JINMEI_1981, JINMEI_CURRENT, JINMEI_REVISIONS } from "./data/jinmei";
import { JOYO_1981, JOYO_2010_ADDED, JOYO_2010_REMOVED } from "./data/joyo";
import { KYOIKU_KANJI_BY_GRADE } from "./data/kyoiku";
import {
	classifyKanji,
	describeKanjiHistory,
	getKanjiHistory,
	getYearOfKyoikuKanji,
	isJinmeiKanji,
	isJoyoKanji,
} from "./joyoKanji";

describe("データ", () => {
	it("1981年の常用漢字は1945字、2010年の追加は196字、削除は5字", () => {
		expect(new Set(JOYO_1981).size).toBe(1945);
		expect(new Set(JOYO_2010_ADDED).size).toBe(196);
		expect(new Set(JOYO_2010_REMOVED).size).toBe(5);
	});

	it("1981年の人名用漢字に改正を順に適用すると、現行の人名用漢字になる", () => {
		const jinmei = new Set(JINMEI_1981);
		for (const { added, removed = "" } of JINMEI_REVISIONS) {
			for (const c of added) jinmei.add(c);
			for (const c of removed) jinmei.delete(c);
		}
		expect([...jinmei].sort()).toEqual([...new Set(JINMEI_CURRENT)].sort());
		expect(jinmei.size).toBe(864);
	});

	it("教育漢字は学年別漢字配当表（2017年告示）の1026字", () => {
		expect(KYOIKU_KANJI_BY_GRADE.map((s) => [...s].length)).toEqual([
			0, 80, 160, 200, 202, 193, 191,
		]);
	});
});

describe("isJoyoKanji", () => {
	it("現行（2010年）の常用漢字を判定する", () => {
		expect(isJoyoKanji("愛")).toBe(true);
		expect(isJoyoKanji("挨")).toBe(true);
		expect(isJoyoKanji("臆")).toBe(true);
		expect(isJoyoKanji("哺")).toBe(true);
		expect(isJoyoKanji("勺")).toBe(false);
		expect(isJoyoKanji("雀")).toBe(false);
	});

	it("許容字体も常用漢字とみなす", () => {
		expect(isJoyoKanji("𠮟")).toBe(true);
		expect(isJoyoKanji("叱")).toBe(true);
		expect(isJoyoKanji("剝")).toBe(true);
		expect(isJoyoKanji("剥")).toBe(true);
		expect(isJoyoKanji("頰")).toBe(true);
		expect(isJoyoKanji("頬")).toBe(true);
		expect(isJoyoKanji("塡")).toBe(true);
		expect(isJoyoKanji("填")).toBe(true);
	});
});

describe("isJinmeiKanji", () => {
	it("現行の人名用漢字を判定する", () => {
		expect(isJinmeiKanji("杏")).toBe(true);
		expect(isJinmeiKanji("雀")).toBe(true);
		expect(isJinmeiKanji("勺")).toBe(true);
		expect(isJinmeiKanji("勒")).toBe(true);
		expect(isJinmeiKanji("亞")).toBe(true);
		expect(isJinmeiKanji("岡")).toBe(false);
		expect(isJinmeiKanji("愛")).toBe(false);
	});
});

describe("getYearOfKyoikuKanji", () => {
	it("配当学年を返す", () => {
		expect(getYearOfKyoikuKanji("一")).toBe(1);
		expect(getYearOfKyoikuKanji("引")).toBe(2);
		expect(getYearOfKyoikuKanji("異")).toBe(6);
		expect(getYearOfKyoikuKanji("雀")).toBe(0);
	});

	it("2020年度からの配当に従う", () => {
		expect(getYearOfKyoikuKanji("茨")).toBe(4);
		expect(getYearOfKyoikuKanji("賀")).toBe(4);
		expect(getYearOfKyoikuKanji("胃")).toBe(6);
	});
});

describe("getKanjiHistory", () => {
	it("1981年以降に変更のない字は空", () => {
		expect(getKanjiHistory("愛")).toEqual([]);
		expect(getKanjiHistory("憶")).toEqual([]);
		expect(getKanjiHistory("捕")).toEqual([]);
		expect(getKanjiHistory("杏")).toEqual([]);
	});

	it("2010年に常用漢字に追加された字", () => {
		expect(getKanjiHistory("哺")).toEqual([
			{ date: "2010-11-30", kind: "joyo-added" },
		]);
	});

	it("人名用漢字に追加されたあと、常用漢字に移った字", () => {
		expect(getKanjiHistory("岡")).toEqual([
			{ date: "2004-09-27", kind: "jinmei-added" },
			{ date: "2010-11-30", kind: "joyo-added" },
			{ date: "2010-11-30", kind: "jinmei-removed" },
		]);
	});

	it("許容字体は通用字体の変遷を返す", () => {
		expect(getKanjiHistory("頬")).toEqual(getKanjiHistory("頰"));
	});
});

describe("describeKanjiHistory", () => {
	it("同じ日の変更をまとめて説明する", () => {
		expect(describeKanjiHistory(getKanjiHistory("岡"))).toEqual([
			{ date: "2004年9月27日", text: "人名用漢字に追加" },
			{ date: "2010年11月30日", text: "人名用漢字から常用漢字へ" },
		]);
		expect(describeKanjiHistory(getKanjiHistory("勺"))).toEqual([
			{ date: "2010年11月30日", text: "常用漢字から人名用漢字へ" },
		]);
		expect(describeKanjiHistory(getKanjiHistory("哺"))).toEqual([
			{ date: "2010年11月30日", text: "常用漢字に追加" },
		]);
		expect(describeKanjiHistory(getKanjiHistory("勒"))).toEqual([
			{ date: "2026年6月26日", text: "人名用漢字に追加" },
		]);
	});
});

describe("classifyKanji", () => {
	it("漢字でない文字", () => {
		expect(classifyKanji("あ")).toEqual({
			char: "あ",
			isKanji: false,
			isJoyo: false,
			isJinmei: false,
			kyoikuYear: 0,
			history: [],
		});
	});

	it("教育漢字", () => {
		expect(classifyKanji("学")).toMatchObject({
			isKanji: true,
			isJoyo: true,
			isJinmei: false,
			kyoikuYear: 1,
			history: [],
		});
	});

	it("2010年に人名用漢字から常用漢字に移った字", () => {
		expect(classifyKanji("岡")).toMatchObject({
			isKanji: true,
			isJoyo: true,
			isJinmei: false,
			kyoikuYear: 4,
		});
		expect(classifyKanji("岡").history).toHaveLength(2);
	});

	it("基本多言語面の外にある常用漢字", () => {
		expect(classifyKanji("𠮟")).toMatchObject({
			isKanji: true,
			isJoyo: true,
		});
	});

	it("CJK互換漢字の人名用漢字", () => {
		expect(classifyKanji("渚")).toMatchObject({
			isKanji: true,
			isJinmei: true,
		});
	});
});
