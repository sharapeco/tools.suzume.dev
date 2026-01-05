/**
 * 角丸図形のSVGを生成する
 *
 * @param {number} w 幅
 * @param {number} h 高さ
 * @param {number} r 半径
 * @param {number} rScale 半径のスケール
 * @param {number} aTension 緩和係数
 * @param {number} decimals 小数点以下の桁数
 * @returns {string} パスの内容
 */
export function getClothoidSquircle(w, h, r, rScale, aTension, decimals = 3) {
	let tension = aTension;
	let rC = r * rScale;
	const [x, y] = [0, 0];

	let lineHLength = w - rC * 2;
	let lineVLength = h - rC * 2;

	const whMin = Math.min(...[w, h]);

	if (rC >= whMin / 2) {
		const rat = rC / whMin;
		rC = whMin / 2;
		lineHLength = w - rC * 2;
		lineVLength = h - rC * 2;
		tension = 0.552 / (rat * 1.3);
	}

	if (rC >= w / 2) {
		lineHLength = 0;
	}

	if (rC >= h / 2) {
		lineVLength = 0;
	}

	if (r >= whMin / 2) {
		tension = 0.552;
	}

	const pathData = [
		{ type: "M", values: [x + rC, y] },
		{ type: "h", values: [lineHLength] },
		{ type: "c", values: [rC * tension, 0, rC, rC * (1 - tension), rC, rC] },
		{ type: "v", values: [lineVLength] },
		{
			type: "c",
			values: [0, rC * tension, -(rC * (1 - tension)), rC, -rC, rC]
		},

		{ type: "h", values: [-lineHLength] },

		{
			type: "c",
			values: [-(rC * tension), 0, -rC, -(rC * (1 - tension)), -rC, -rC]
		},

		{ type: "v", values: [-lineVLength] },
		{
			type: "c",
			values: [0, -(rC * tension), rC * (1 - tension), -rC, rC, -rC]
		},
		{ type: "z", values: [] }
	];

	return pathData
		.map((com) => {
			return `${com.type} ${com.values
				.map((val) => {
					return +val.toFixed(decimals);
				})
				.join(" ")}`;
		})
		.join(" ");
}
