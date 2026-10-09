import { describe, expect, it } from "vitest";
import { placeTooltip } from "./tooltipPlacement";

const viewport = { width: 400, height: 600 };
const tooltip = { width: 200, height: 50 };

/**
 * @param {number} left
 * @param {number} top
 */
const anchorAt = (left, top) => ({
	left,
	top,
	right: left + 20,
	bottom: top + 20,
});

describe("placeTooltip", () => {
	it("基準要素の下に中央揃えで置く", () => {
		expect(placeTooltip(anchorAt(190, 100), tooltip, viewport)).toEqual({
			left: 100,
			top: 124,
			placement: "below",
		});
	});

	it("左右は画面端からはみ出さない", () => {
		expect(placeTooltip(anchorAt(0, 100), tooltip, viewport).left).toBe(8);
		expect(placeTooltip(anchorAt(380, 100), tooltip, viewport).left).toBe(192);
	});

	it("下に収まらなければ上に置く", () => {
		expect(placeTooltip(anchorAt(190, 560), tooltip, viewport)).toEqual({
			left: 100,
			top: 506,
			placement: "above",
		});
	});

	it("上にも収まらなければ下に置く", () => {
		const tall = { width: 200, height: 590 };
		expect(placeTooltip(anchorAt(190, 100), tall, viewport).placement).toBe(
			"below",
		);
	});

	it("ツールチップが画面より広いときは左端に寄せる", () => {
		const wide = { width: 500, height: 50 };
		expect(placeTooltip(anchorAt(190, 100), wide, viewport).left).toBe(8);
	});
});
