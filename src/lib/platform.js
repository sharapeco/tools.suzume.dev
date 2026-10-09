/**
 * User-Agent からプラットフォームを判定する
 *
 * @param {string} ua
 * @return {string}
 */
export function detectPlatform(ua) {
	if (/\b(?:Mac OS X|macOS|iOS|iPadOS)\b/.test(ua)) {
		return "apple";
	}
	if (/\b(?:Windows)\b/.test(ua)) {
		return "microsoft";
	}
	if (/\b(?:Chromebook)\b/.test(ua)) {
		return "google";
	}
	return "unknown";
}
