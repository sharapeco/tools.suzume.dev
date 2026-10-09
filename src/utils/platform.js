import { browser } from "$app/environment";
import { detectPlatform } from "$lib/platform";

/**
 * @return {string}
 */
export function getPlatform() {
	if (!browser) {
		return "server";
	}
	return detectPlatform(navigator.userAgent);
}
