import { describe, expect, it } from "vitest";
import { lintText } from "./textlint";

/**
 * @param {string} text
 */
async function ruleIds(text) {
	return (await lintText(text)).map((m) => m.ruleId);
}

describe("lintText", () => {
	it("問題がなければ何も報告しない", async () => {
		expect(await ruleIds("すずめの学校")).toEqual([]);
	});

	it.each([
		["no-control-character", "すずめ\u0007"],
		["no-dumb-quotes", `"すずめ"`],
		["no-hyphen-between-years", "1990-2000年"],
		["no-radical", "⼭"],
		["no-private-use-area", ""],
		["no-space-between-japanese-chars", "すずめ の学校"],
		["no-vertical-forms", "︵すずめ︶"],
		["no-wrong-brackets", "≪すずめ≫"],
		["no-regional-indicator-symbol", "\u{1F1EF}"],
	])("%s を検出する", async (ruleId, text) => {
		expect(await ruleIds(text)).toContain(ruleId);
	});
});
