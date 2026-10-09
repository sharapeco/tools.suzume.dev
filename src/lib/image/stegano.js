/**
 * 隠れ蓑画像を埋め込む画像の全面に敷き詰めるときの配置を求める（object-fit: cover 相当）
 *
 * @param {number} mw 隠れ蓑画像の幅
 * @param {number} mh 隠れ蓑画像の高さ
 * @param {number} sw 埋め込む画像の幅
 * @param {number} sh 埋め込む画像の高さ
 * @returns {[number, number, number, number]} [幅, 高さ, x, y]
 */
export function coverRect(mw, mh, sw, sh) {
	const scale = Math.max(sw / mw, sh / mh);
	const pw = mw * scale;
	const ph = mh * scale;
	return [pw, ph, (sw - pw) / 2, (sh - ph) / 2];
}

/**
 * 隠れ蓑画像の下位ビットに画像を埋め込む
 *
 * 埋め込む画像の RGBA の上位ビットを、隠れ蓑画像の R, B, G, A の下位ビットに入れる。
 *
 * @param {Uint8ClampedArray} mino 隠れ蓑画像の RGBA（埋め込む画像と同じサイズ）
 * @param {Uint8ClampedArray} src 埋め込む画像の RGBA
 * @returns {Uint8ClampedArray<ArrayBuffer>} 埋め込んだ画像の RGBA
 */
export function embedImage(mino, src) {
	const data = new Uint8ClampedArray(mino);
	for (let i = 0; i < data.length; i += 4) {
		const [sr, sg, sb, sa] = src.slice(i, i + 4);
		const [mr, mg, mb, ma] = data.slice(i, i + 4);
		data[i + 0] = (mr & 0b11100000) | (sr >>> 3);
		data[i + 1] = (mg & 0b11110000) | (sb >>> 4);
		data[i + 2] = (mb & 0b11100000) | (sg >>> 3);
		data[i + 3] = (ma & 0b11100000) | (sa >>> 3);
	}

	// Twitterでできるだけ透過PNGにする
	data[3] &= 0b11111110;

	return data;
}

/**
 * embedImage で埋め込んだ画像を取り出す
 *
 * @param {Uint8ClampedArray} src 埋め込んだ画像の RGBA
 * @returns {Uint8ClampedArray<ArrayBuffer>} 取り出した画像の RGBA
 */
export function extractImage(src) {
	const data = new Uint8ClampedArray(src.length);
	for (let i = 0; i < data.length; i += 4) {
		const [sr, sg, sb, sa] = src.slice(i, i + 4);
		data[i + 0] = ((sr << 3) & 0xff) | (sr >>> 5);
		data[i + 1] = ((sb << 3) & 0xff) | (sb >>> 5);
		data[i + 2] = ((sg << 4) & 0xff) | (sg >>> 4);
		data[i + 3] = ((sa << 3) & 0xff) | (sa >>> 5);
	}
	return data;
}
