/**
 * @typedef {Object} Rect
 * @property {number} left
 * @property {number} top
 * @property {number} right
 * @property {number} bottom
 */

/**
 * @typedef {Object} Size
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} TooltipPlacement
 * @property {number} left
 * @property {number} top
 * @property {"below" | "above"} placement
 */

/**
 * ツールチップの位置を決める
 *
 * 基本は基準要素の下に中央揃えで置く。下に収まらず上に収まるときは上に置く。
 * 左右は画面からはみ出さないように寄せる。
 *
 * @param {Rect} anchor - 基準要素の位置（ビューポート座標）
 * @param {Size} tooltip - ツールチップの大きさ
 * @param {Size} viewport - ビューポートの大きさ
 * @param {{ gap?: number, margin?: number }} [options] - 基準要素との間隔、画面端との余白
 * @returns {TooltipPlacement}
 */
export function placeTooltip(
	anchor,
	tooltip,
	viewport,
	{ gap = 4, margin = 8 } = {},
) {
	const center = (anchor.left + anchor.right) / 2;
	const maxLeft = viewport.width - margin - tooltip.width;
	const left = Math.max(margin, Math.min(center - tooltip.width / 2, maxLeft));

	const below = anchor.bottom + gap;
	const above = anchor.top - gap - tooltip.height;
	const fitsBelow = below + tooltip.height <= viewport.height - margin;
	if (!fitsBelow && above >= margin) {
		return { left, top: above, placement: "above" };
	}
	return { left, top: below, placement: "below" };
}
