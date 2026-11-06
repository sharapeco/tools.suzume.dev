import { describe, expect, it } from "vitest";
import { wrapSelection } from "./insertNotation";

/**
 * @param {string} value
 * @param {number} start
 * @param {number} [end]
 */
const wrap = (value, start, end = start) =>
	wrapSelection(value, start, end, "\\u{", "}");

describe("wrapSelection", () => {
	it("空文字列に挿入し、カーソルは {} の間", () => {
		expect(wrap("", 0)).toEqual({ value: "\\u{}", cursor: 3 });
	});

	it("先頭・途中・末尾に挿入する", () => {
		expect(wrap("abc", 0)).toEqual({ value: "\\u{}abc", cursor: 3 });
		expect(wrap("abc", 2)).toEqual({ value: "ab\\u{}c", cursor: 5 });
		expect(wrap("abc", 3)).toEqual({ value: "abc\\u{}", cursor: 6 });
	});

	it("選択した文字列を {} で囲み、カーソルは } の直前", () => {
		expect(wrap("x30A2y", 1, 5)).toEqual({
			value: "x\\u{30A2}y",
			cursor: 8,
		});
	});

	it("範囲外の位置は文字列の長さに丸める", () => {
		expect(wrap("ab", 10)).toEqual({ value: "ab\\u{}", cursor: 5 });
		expect(wrap("ab", -1)).toEqual({ value: "\\u{}ab", cursor: 3 });
		expect(wrap("ab", 1, 10)).toEqual({ value: "a\\u{b}", cursor: 5 });
	});
});
