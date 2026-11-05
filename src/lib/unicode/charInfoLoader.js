import { buildCharInfo } from "./charInfo";
import { chunkIdOf } from "./namesList";

/**
 * @typedef {object} CharInfoLoader
 * @property {(codePoints: Iterable<number>) => void} prefetch
 *   先読みの依頼。必要なチャンクをプールに入れる（前回の依頼は置き換える）。
 *   取得中はリクエストを出さず、今のバッチが終わってからプールの分を送る。
 * @property {(cp: number) => Promise<import("./charInfo").CharInfo>} get
 *   1コードポイントの文字情報を取得する。未取得のチャンクは優先して取りに行く。
 * @property {(cp: number) => import("./charInfo").CharInfo | undefined} peek
 *   取得済みなら文字情報を同期的に返す。未取得なら undefined。
 */

/**
 * @template T
 * @typedef {{promise: Promise<T>, resolve: (value: T) => void, reject: (reason: unknown) => void}} Deferred
 */

/**
 * @template T
 * @returns {Deferred<T>}
 */
function deferred() {
	/** @type {(value: T) => void} */
	let resolve = () => {};
	/** @type {(reason: unknown) => void} */
	let reject = () => {};
	/** @type {Promise<T>} */
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

/**
 * 文字情報を、チャンク単位で緩衝しながら取得する。
 *
 * @param {object} options
 * @param {(chunkId: number) => Promise<import("./namesList").ChunkData>} options.fetchChunk
 * @param {import("./charInfo").UnicodeIndex} options.index
 * @param {number} [options.concurrency] バッチあたりの同時取得数
 * @returns {CharInfoLoader}
 */
export function createCharInfoLoader({ fetchChunk, index, concurrency = 2 }) {
	/** @type {Map<number, import("./namesList").ChunkData>} */
	const loaded = new Map();
	/** @type {Set<number>} */
	const inflight = new Set();
	/** get() で待たれているチャンク @type {Map<number, Deferred<import("./namesList").ChunkData>>} */
	const waiters = new Map();
	/** まだ送っていないチャンクID @type {number[]} */
	let pool = [];
	let busy = false;

	/**
	 * @param {number} id
	 */
	function needsFetch(id) {
		return index.chunkIds.has(id) && !loaded.has(id) && !inflight.has(id);
	}

	/**
	 * @param {number} id
	 */
	async function load(id) {
		inflight.add(id);
		try {
			const data = await fetchChunk(id);
			loaded.set(id, data);
			waiters.get(id)?.resolve(data);
		} catch (e) {
			waiters.get(id)?.reject(e);
		} finally {
			inflight.delete(id);
			waiters.delete(id);
		}
	}

	function pump() {
		if (busy || pool.length === 0) {
			return;
		}
		const batch = pool.slice(0, concurrency);
		pool = pool.slice(concurrency);
		busy = true;
		Promise.allSettled(batch.map(load)).then(() => {
			busy = false;
			pump();
		});
	}

	/** @type {CharInfoLoader["prefetch"]} */
	function prefetch(codePoints) {
		/** @type {Set<number>} */
		const ids = new Set();
		for (const cp of codePoints) {
			const id = chunkIdOf(cp);
			if (needsFetch(id)) {
				ids.add(id);
			}
		}
		// get() で待たれているものは残し、それ以外は新しい依頼で置き換える
		const waited = pool.filter((id) => waiters.has(id) && !ids.has(id));
		pool = [...waited, ...ids];
		pump();
	}

	/**
	 * @param {number} id
	 * @returns {Promise<import("./namesList").ChunkData|null>}
	 */
	function chunkFor(id) {
		if (!index.chunkIds.has(id)) {
			return Promise.resolve(null);
		}
		const data = loaded.get(id);
		if (data) {
			return Promise.resolve(data);
		}
		let waiter = waiters.get(id);
		if (!waiter) {
			waiter = deferred();
			waiters.set(id, waiter);
		}
		if (!inflight.has(id)) {
			pool = [id, ...pool.filter((x) => x !== id)];
			pump();
		}
		return waiter.promise;
	}

	/** @type {CharInfoLoader["get"]} */
	async function get(cp) {
		const chunk = await chunkFor(chunkIdOf(cp));
		return buildCharInfo(cp, chunk, index);
	}

	/** @type {CharInfoLoader["peek"]} */
	function peek(cp) {
		const id = chunkIdOf(cp);
		if (!index.chunkIds.has(id)) {
			return buildCharInfo(cp, null, index);
		}
		const data = loaded.get(id);
		return data ? buildCharInfo(cp, data, index) : undefined;
	}

	return { prefetch, get, peek };
}
