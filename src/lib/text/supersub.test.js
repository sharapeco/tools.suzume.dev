import { describe, expect, it } from "vitest";
import { supersub } from "./supersub";

describe("supersub", () => {
	it("^ の次の1文字を上付きにする", () => {
		expect(supersub("a^2 + b^2")).toBe("a² + b²");
	});

	it("_{...} の中身を下付きにする", () => {
		expect(supersub("H_2O, x_{12}")).toBe("H₂O, x₁₂");
	});

	it("\\ でエスケープできる", () => {
		expect(supersub("a\\^2")).toBe("a^2");
	});

	it("末尾の ^ はエラー", () => {
		expect(() => supersub("a^")).toThrow();
	});

	it("閉じていない { はエラー", () => {
		expect(() => supersub("a^{12")).toThrow();
	});
});
