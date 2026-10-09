import { describe, expect, it } from "vitest";
import { getKey } from "./eventUtil";

/**
 * @param {Partial<KeyboardEvent>} init
 * @returns {KeyboardEvent}
 */
function keyEvent(init) {
	return /** @type {KeyboardEvent} */ ({
		metaKey: false,
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		...init,
	});
}

describe("getKey", () => {
	it("修飾キーがなければキー名だけを返す", () => {
		expect(getKey(keyEvent({ key: "Enter" }))).toBe("Enter");
	});

	it("修飾キーを meta, ctrl, alt, shift の順に連結する", () => {
		expect(getKey(keyEvent({ key: "k", shiftKey: true, metaKey: true }))).toBe(
			"meta+shift+k",
		);
	});
});
