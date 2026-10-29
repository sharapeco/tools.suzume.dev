import { describe, expect, it } from "vitest";
import { specialChars } from "./specialChars";

describe("特殊文字の表", () => {
	it("すべての文字が既知の分類と空でないラベルを持つ", () => {
		const types = ["control", "invisible", "nbsp", "undefined"];
		for (const sp of Object.values(specialChars)) {
			expect(types).toContain(sp.type);
			expect(sp.label).not.toBe("");
		}
	});

	it("空白類を invisible / nbsp に分類する", () => {
		expect(specialChars[0x2006]).toEqual({ type: "invisible", label: "1/6em" });
		expect(specialChars[0x3000]).toEqual({ type: "invisible", label: "ideo" });
		expect(specialChars[0x00a0]).toEqual({ type: "nbsp", label: "NBSP" });
	});

	it("制御文字の分類とラベルは変わらない", () => {
		expect(specialChars[0x0000]).toEqual({ type: "control", label: "NUL" });
		expect(specialChars[0x200b]).toEqual({ type: "control", label: "ZWSP" });
	});
});
