import { describe, expect, it } from "vitest";
import { shouldFocusOnToolSelect } from "./toolSelectFocus";

const from = { url: new URL("https://tools.suzume.dev/") };

describe("shouldFocusOnToolSelect", () => {
	it.each([
		["link", true],
		["goto", true],
		["popstate", false],
		["form", false],
	])("サイト内から %s で遷移: %s", (type, expected) => {
		expect(shouldFocusOnToolSelect({ from, type }, true)).toBe(expected);
	});

	it("直接アクセス・リロードではフォーカスしない", () => {
		expect(shouldFocusOnToolSelect({ from: null, type: "enter" }, true)).toBe(
			false,
		);
	});

	it("タッチ端末ではフォーカスしない", () => {
		expect(shouldFocusOnToolSelect({ from, type: "link" }, false)).toBe(false);
	});
});
