import { browser } from "$app/environment";

/**
 * ローカルストレージから値を復元する関数
 *
 * @param {string} key
 * @param {string} defaultValue
 */
export function restoreFromStorage(key, defaultValue) {
	if (browser) {
		try {
			const value = localStorage.getItem(key);
			return value ?? defaultValue;
		} catch (e) {
			console.error(`Failed to restore ${key} from localStorage:`, e);
			return defaultValue;
		}
	}
	return defaultValue;
}

/**
 * ローカルストレージに値を保存する関数
 *
 * @param {string} key
 * @param {string} value
 */
export function saveToStorage(key, value) {
	if (browser) {
		try {
			localStorage.setItem(key, value);
		} catch (e) {
			console.error(`Failed to save ${key} to localStorage:`, e);
		}
	}
}
