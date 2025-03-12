import { browser } from "$app/environment";

/**
 * @return {string}
 */
export function getPlatform() {
	if (!browser) {
		return "server";
	}
	const ua = navigator.userAgent;
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
