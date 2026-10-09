import { QRCode } from "./qrcode.js";

/**
 * QRコードのSVGを生成する
 *
 * @param {string} content
 * @param {string} ecl エラー訂正レベル（L, M, Q, H）
 * @param {string} drawMethod predefined: <def> と <use> を使う
 * @param {number} size
 * @returns {string}
 */
export function buildQRCodeSvg(content, ecl, drawMethod, size) {
	return new QRCode({
		content,
		ecl,
		container: "svg-viewbox",
		swap: true,
		join: false,
		predefined: drawMethod === "predefined",
		pretty: true,
		width: size,
		height: size,
	}).svg();
}
