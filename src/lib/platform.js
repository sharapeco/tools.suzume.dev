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
	} else if (/\b(?:Windows)\b/.test(ua)) {
		return "microsoft";
	} else if (/\b(?:Chromebook)\b/.test(ua)) {
		return "google";
	} else {
		return "unknown";
	}
}