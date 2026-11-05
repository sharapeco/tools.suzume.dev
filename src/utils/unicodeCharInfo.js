import { createUnicodeIndex } from "$lib/unicode/charInfo";
import { createCharInfoLoader } from "$lib/unicode/charInfoLoader";
import rawIndex from "$lib/unicode/data/unicodeIndex.json";
import { chunkFileName } from "$lib/unicode/namesList";

const CACHE_PREFIX = "unicode-names-";

export const unicodeIndex = createUnicodeIndex(
	/** @type {import("$lib/unicode/charInfo").RawUnicodeIndex} */ (rawIndex),
);

const cacheName = `${CACHE_PREFIX}${unicodeIndex.version}`;

/** @type {Promise<Cache|null>|null} */
let cachePromise = null;

/**
 * Cache Storage を開く。古いバージョンのキャッシュはここで消す。
 * 使えない環境（安全でないコンテキストなど）では null
 * @returns {Promise<Cache|null>}
 */
function openCache() {
	if (cachePromise == null) {
		cachePromise = (async () => {
			if (typeof caches === "undefined") {
				return null;
			}
			try {
				for (const name of await caches.keys()) {
					if (name.startsWith(CACHE_PREFIX) && name !== cacheName) {
						await caches.delete(name);
					}
				}
				return await caches.open(cacheName);
			} catch {
				return null;
			}
		})();
	}
	return cachePromise;
}

/**
 * チャンクのデータを取得する。Cache Storage にあればそれを使う
 * @param {number} chunkId
 * @returns {Promise<import("$lib/unicode/namesList").ChunkData>}
 */
async function fetchChunk(chunkId) {
	const url = `/unicode-names/${unicodeIndex.version}/${chunkFileName(chunkId)}`;
	const cache = await openCache();
	if (cache) {
		const hit = await cache.match(url).catch(() => undefined);
		if (hit) {
			return hit.json();
		}
	}

	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`${url}: ${res.status}`);
	}
	if (cache) {
		await cache.put(url, res.clone()).catch(() => {});
	}
	return res.json();
}

export const charInfoLoader = createCharInfoLoader({
	fetchChunk,
	index: unicodeIndex,
	concurrency: 2,
});
