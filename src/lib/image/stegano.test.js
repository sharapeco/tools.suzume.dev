import { describe, expect, it } from "vitest";
import { coverRect, embedImage, extractImage } from "./stegano";

describe("coverRect", () => {
	it("縦横比を保ったまま全面を覆うように拡大して中央に置く", () => {
		expect(coverRect(100, 50, 200, 200)).toEqual([400, 200, -100, 0]);
	});
});

describe("embedImage / extractImage", () => {
	const mino = new Uint8ClampedArray([
		200, 100, 50, 255, 10, 20, 30, 40, 255, 255, 255, 255,
	]);
	const src = new Uint8ClampedArray([
		0, 128, 255, 255, 182, 77, 240, 128, 1, 2, 3, 4,
	]);

	it("隠れ蓑画像の上位ビットは保たれる", () => {
		const embedded = embedImage(mino, src);
		expect(embedded[4] & 0b11100000).toBe(mino[4] & 0b11100000);
		expect(embedded[5] & 0b11110000).toBe(mino[5] & 0b11110000);
	});

	it("1ピクセル目のアルファの最下位ビットを落とす", () => {
		expect(embedImage(mino, src)[3] & 1).toBe(0);
	});

	it("取り出した画像は元の画像を量子化誤差の範囲で再現する", () => {
		const restored = extractImage(embedImage(mino, src));
		// 1ピクセル目はアルファの最下位ビットを落としているので2ピクセル目以降で比べる
		for (let i = 4; i < src.length; i += 4) {
			expect(Math.abs(restored[i + 0] - src[i + 0])).toBeLessThan(8);
			expect(Math.abs(restored[i + 1] - src[i + 1])).toBeLessThan(8);
			expect(Math.abs(restored[i + 2] - src[i + 2])).toBeLessThan(16);
			expect(Math.abs(restored[i + 3] - src[i + 3])).toBeLessThan(8);
		}
	});

	it("元の配列は変更しない", () => {
		const copy = new Uint8ClampedArray(mino);
		embedImage(mino, src);
		expect(mino).toEqual(copy);
	});
});
