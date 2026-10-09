import { describe, expect, it } from "vitest";
import { getClothoidSquircle } from "./clothoid";
import { getSuperEllipse } from "./superellipse";

describe("getSuperEllipse", () => {
	it("power=2 では楕円のパスになる", () => {
		expect(getSuperEllipse(100, 100, 2)).toBe(
			"M 0 50 C 0 77.614 22.386 100 50 100 C 77.614 100 100 77.614 100 50 C 100 22.386 77.614 0 50 0 C 22.386 0 0 22.386 0 50 z ",
		);
	});
});

describe("getClothoidSquircle", () => {
	it("角丸長方形のパスを生成する", () => {
		expect(getClothoidSquircle(100, 50, 10, 1, 0.5)).toBe(
			"M 10 0 h 80 c 5 0 10 5 10 10 v 30 c 0 5 -5 10 -10 10 h -80 c -5 0 -10 -5 -10 -10 v -30 c 0 -5 5 -10 10 -10 z ",
		);
	});
});
