/**
 * スーパー楕円のSVGを生成する
 *
 * @param {number} w 幅
 * @param {number} h 高さ
 * @param {number} power 指数
 * @param {number} [decimals=3] 小数点以下の桁数
 * @returns {string} パスの内容
 */
export function getSuperEllipse(w, h, power, decimals = 3) {
	const w2 = w / 2;
	const h2 = h / 2;
	/** スーパー楕円を近似したときの制御点の比率 */
	const k = (8 / 3) * (1 / 2 ** (1 / power) - 1 / 2);

	const pathData = [
		{ type: "M", values: [0, h2] },
		{ type: "C", values: [0, h2 * (1 + k), w2 * (1 - k), h, w2, h] },
		{ type: "C", values: [w2 * (1 + k), h, w, h2 * (1 + k), w, h2] },
		{ type: "C", values: [w, h2 * (1 - k), w2 * (1 + k), 0, w2, 0] },
		{ type: "C", values: [w2 * (1 - k), 0, 0, h2 * (1 - k), 0, h2] },
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
