import { describe, expect, it } from "vitest";
import { buildQRCodeSvg } from "./svg";

describe("buildQRCodeSvg", () => {
	it("指定したサイズの viewBox を持つ SVG を生成する", () => {
		const svg = buildQRCodeSvg("https://tools.suzume.dev/", "M", "normal", 256);
		expect(svg).toMatch(/<svg[^>]*viewBox="0 0 256 256"/);
	});

	it("predefined では <defs> と <use> を使う", () => {
		const svg = buildQRCodeSvg("suzume", "L", "predefined", 256);
		expect(svg).toContain("<defs>");
		expect(svg).toContain("<use");
	});
});
