import { isKanji } from "$lib/text/charType";
import { JINMEI_1981, JINMEI_REVISIONS } from "./data/jinmei";
import {
	JOYO_1981,
	JOYO_2010_ADDED,
	JOYO_2010_DATE,
	JOYO_2010_REMOVED,
	JOYO_ALIASES,
} from "./data/joyo";
import { KYOIKU_KANJI_BY_GRADE } from "./data/kyoiku";

/**
 * @typedef {"joyo-added" | "joyo-removed" | "jinmei-added" | "jinmei-removed"} KanjiChangeKind
 */

/**
 * @typedef {Object} KanjiChange
 * @property {string} date - 施行日（YYYY-MM-DD）
 * @property {KanjiChangeKind} kind - 変更の種類
 */

/**
 * @typedef {Object} KanjiChangeDescription
 * @property {string} date - 日付（例：2010年11月30日）
 * @property {string} text - 変更の内容
 */

/** 現行の常用漢字 */
const joyo = new Set(JOYO_1981);
/** 現行の人名用漢字 */
const jinmei = new Set(JINMEI_1981);
/** @type {Map<string, KanjiChange[]>} 1981年以降の変更 */
const history = new Map();

/**
 * @param {string} chars
 * @param {string} date
 * @param {KanjiChangeKind} kind
 */
function record(chars, date, kind) {
	for (const c of chars) {
		const changes = history.get(c) ?? [];
		changes.push({ date, kind });
		history.set(c, changes);
	}
}

for (const c of JOYO_2010_REMOVED) joyo.delete(c);
for (const c of JOYO_2010_ADDED) joyo.add(c);
record(JOYO_2010_ADDED, JOYO_2010_DATE, "joyo-added");
record(JOYO_2010_REMOVED, JOYO_2010_DATE, "joyo-removed");

for (const { date, added, removed = "" } of JINMEI_REVISIONS) {
	for (const c of added) jinmei.add(c);
	for (const c of removed) jinmei.delete(c);
	record(added, date, "jinmei-added");
	record(removed, date, "jinmei-removed");
}

for (const changes of history.values()) {
	changes.sort((a, b) => a.date.localeCompare(b.date));
}

/** @type {Map<string, number>} */
const kyoikuYears = new Map();
KYOIKU_KANJI_BY_GRADE.forEach((chars, year) => {
	for (const c of chars) kyoikuYears.set(c, year);
});

/**
 * 許容字体を通用字体に置き換える
 *
 * @param {string} c
 * @returns {string}
 */
function normalize(c) {
	return JOYO_ALIASES[/** @type {keyof typeof JOYO_ALIASES} */ (c)] ?? c;
}

/**
 * 教育漢字の配当学年を返す（学年別漢字配当表、2017年告示）
 *
 * @param {string} c
 * @returns {number} 学年。教育漢字でなければ0
 */
export function getYearOfKyoikuKanji(c) {
	return kyoikuYears.get(c) ?? 0;
}

/**
 * 現行（2010年）の常用漢字かどうか
 *
 * @param {string} c
 * @returns {boolean}
 */
export function isJoyoKanji(c) {
	return joyo.has(normalize(c));
}

/**
 * 現行の人名用漢字かどうか
 *
 * @param {string} c
 * @returns {boolean}
 */
export function isJinmeiKanji(c) {
	return jinmei.has(c);
}

/**
 * 1981年以降に常用漢字・人名用漢字の範囲が変わった記録を、日付順に返す
 *
 * @param {string} c
 * @returns {KanjiChange[]}
 */
export function getKanjiHistory(c) {
	return history.get(normalize(c)) ?? [];
}

/** @type {Record<KanjiChangeKind, string>} */
const changeTexts = {
	"joyo-added": "常用漢字に追加",
	"joyo-removed": "常用漢字から削除",
	"jinmei-added": "人名用漢字に追加",
	"jinmei-removed": "人名用漢字から削除",
};

/**
 * @param {string} date - YYYY-MM-DD
 * @returns {string}
 */
function formatDate(date) {
	const [y, m, d] = date.split("-").map(Number);
	return `${y}年${m}月${d}日`;
}

/**
 * 変更の記録を、日付ごとにまとめた説明にする
 *
 * @param {KanjiChange[]} changes
 * @returns {KanjiChangeDescription[]}
 */
export function describeKanjiHistory(changes) {
	/** @type {Map<string, Set<KanjiChangeKind>>} */
	const byDate = new Map();
	for (const { date, kind } of changes) {
		const kinds = byDate.get(date) ?? new Set();
		kinds.add(kind);
		byDate.set(date, kinds);
	}
	return [...byDate].map(([date, kinds]) => {
		let text;
		if (kinds.has("jinmei-removed") && kinds.has("joyo-added")) {
			text = "人名用漢字から常用漢字へ";
		} else if (kinds.has("joyo-removed") && kinds.has("jinmei-added")) {
			text = "常用漢字から人名用漢字へ";
		} else {
			text = [...kinds].map((kind) => changeTexts[kind]).join("、");
		}
		return { date: formatDate(date), text };
	});
}

/**
 * @typedef {Object} KanjiInfo
 * @property {string} char - 文字
 * @property {boolean} isKanji - 漢字かどうか
 * @property {boolean} isJoyo - 常用漢字かどうか
 * @property {boolean} isJinmei - 人名用漢字かどうか
 * @property {number} kyoikuYear - 教育漢字の場合の学年（0は教育漢字でない）
 * @property {KanjiChangeDescription[]} history - 1981年以降の常用漢字・人名用漢字の変更
 */

/**
 * 文字が常用漢字・人名用漢字・教育漢字のどれにあたるかを調べる
 *
 * @param {string} char
 * @returns {KanjiInfo}
 */
export function classifyKanji(char) {
	const isJoyo = isJoyoKanji(char);
	const isJinmei = isJinmeiKanji(char);
	const changes = getKanjiHistory(char);
	return {
		char,
		// 基本多言語面の外の字（𠮟）やCJK互換漢字は isKanji で拾えないので、表にある字も漢字とする
		isKanji: isJoyo || isJinmei || changes.length > 0 || isKanji(char),
		isJoyo,
		isJinmei,
		kyoikuYear: getYearOfKyoikuKanji(char),
		history: describeKanjiHistory(changes),
	};
}
