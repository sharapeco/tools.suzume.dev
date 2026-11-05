import { describe, expect, it } from "vitest";
import { createUnicodeIndex } from "./charInfo";
import { createCharInfoLoader } from "./charInfoLoader";

const index = createUnicodeIndex({
	version: "18.0.0",
	blocks: [["0000", "FFFF", "Everything"]],
	unlistedBlocks: [],
	chunks: ["0000", "0001", "0002", "0003", "0004", "0030"],
});

/**
 * 手動で resolve / reject できる fetchChunk
 */
function createFakeFetch() {
	/** @type {Array<{id: number, resolve: () => void, reject: (e: Error) => void}>} */
	const pending = [];
	/** @type {number[]} */
	const calls = [];
	/**
	 * @param {number} id
	 * @returns {Promise<import("./namesList").ChunkData>}
	 */
	function fetchChunk(id) {
		calls.push(id);
		return new Promise((resolve, reject) => {
			pending.push({
				id,
				resolve: () =>
					resolve({
						subblocks: [],
						chars: { 0: { n: `CHAR ${id.toString(16).toUpperCase()}00` } },
					}),
				reject,
			});
		});
	}
	/**
	 * @param {number} id
	 */
	function take(id) {
		const i = pending.findIndex((p) => p.id === id);
		if (i < 0) {
			throw new Error(`chunk ${id} is not pending`);
		}
		return pending.splice(i, 1)[0];
	}
	return {
		fetchChunk,
		calls,
		pending,
		/** @param {number} id */
		resolve: (id) => take(id).resolve(),
		/** @param {number} id */
		reject: (id) => take(id).reject(new Error("network")),
	};
}

/** マイクロタスクを流す */
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("createCharInfoLoader", () => {
	it("同時に送るのは concurrency 件まで", () => {
		const fake = createFakeFetch();
		const loader = createCharInfoLoader({
			fetchChunk: fake.fetchChunk,
			index,
			concurrency: 2,
		});
		loader.prefetch([0x0000, 0x0100, 0x0200, 0x0300]);
		expect(fake.calls).toEqual([0, 1]);
	});

	it("取得中はプールするだけで、バッチが終わってから次を送る", async () => {
		const fake = createFakeFetch();
		const loader = createCharInfoLoader({
			fetchChunk: fake.fetchChunk,
			index,
			concurrency: 2,
		});
		loader.prefetch([0x0000, 0x0100, 0x0200]);
		loader.prefetch([0x0000, 0x0100, 0x0200, 0x0300]);
		expect(fake.calls).toEqual([0, 1]);

		fake.resolve(0);
		await flush();
		// バッチ内に取得中のものが残っていれば、まだ送らない
		expect(fake.calls).toEqual([0, 1]);

		fake.resolve(1);
		await flush();
		expect(fake.calls).toEqual([0, 1, 2, 3]);
	});

	it("プールは最新の依頼で置き換わる", async () => {
		const fake = createFakeFetch();
		const loader = createCharInfoLoader({
			fetchChunk: fake.fetchChunk,
			index,
			concurrency: 1,
		});
		loader.prefetch([0x0000]);
		loader.prefetch([0x0000, 0x0100, 0x0200]);
		loader.prefetch([0x0300]);
		fake.resolve(0);
		await flush();
		expect(fake.calls).toEqual([0, 3]);
	});

	it("取得済み・データのないチャンクは取りに行かない", async () => {
		const fake = createFakeFetch();
		const loader = createCharInfoLoader({ fetchChunk: fake.fetchChunk, index });
		loader.prefetch([0x0000, 0x0001, 0x4e00]);
		expect(fake.calls).toEqual([0]);
		fake.resolve(0);
		await flush();
		loader.prefetch([0x0000]);
		expect(fake.calls).toEqual([0]);
		const info = await loader.get(0x4e00);
		expect(info.status).toBe("unassigned");
		expect(fake.calls).toEqual([0]);
	});

	it("get はプールの先頭に入って優先される", async () => {
		const fake = createFakeFetch();
		const loader = createCharInfoLoader({
			fetchChunk: fake.fetchChunk,
			index,
			concurrency: 1,
		});
		loader.prefetch([0x0000, 0x0100, 0x0200]);
		const p = loader.get(0x0300);
		fake.resolve(0);
		await flush();
		expect(fake.calls).toEqual([0, 3]);
		fake.resolve(3);
		expect((await p).name).toBe("CHAR 300");
	});

	it("get で待たれているチャンクは prefetch の置き換えで消えない", async () => {
		const fake = createFakeFetch();
		const loader = createCharInfoLoader({
			fetchChunk: fake.fetchChunk,
			index,
			concurrency: 1,
		});
		loader.prefetch([0x0000]);
		const p = loader.get(0x0300);
		loader.prefetch([0x0400]);
		fake.resolve(0);
		await flush();
		expect(fake.calls).toEqual([0, 3]);
		fake.resolve(3);
		await p;
		await flush();
		expect(fake.calls).toEqual([0, 3, 4]);
	});

	it("同じチャンクへのリクエストは1本にまとめる", async () => {
		const fake = createFakeFetch();
		const loader = createCharInfoLoader({ fetchChunk: fake.fetchChunk, index });
		const a = loader.get(0x0000);
		const b = loader.get(0x0001);
		loader.prefetch([0x0002]);
		expect(fake.calls).toEqual([0]);
		fake.resolve(0);
		expect((await a).name).toBe("CHAR 000");
		expect((await b).status).toBe("unassigned");
	});

	it("peek は取得済みのときだけ返す", async () => {
		const fake = createFakeFetch();
		const loader = createCharInfoLoader({ fetchChunk: fake.fetchChunk, index });
		expect(loader.peek(0x0000)).toBeUndefined();
		expect(loader.peek(0x4e00)?.status).toBe("unassigned");
		loader.prefetch([0x0000]);
		fake.resolve(0);
		await flush();
		expect(loader.peek(0x0000)?.name).toBe("CHAR 000");
	});

	it("失敗したら reject し、あとで再試行できる", async () => {
		const fake = createFakeFetch();
		const loader = createCharInfoLoader({ fetchChunk: fake.fetchChunk, index });
		const p = loader.get(0x0000);
		fake.reject(0);
		await expect(p).rejects.toThrow("network");
		await flush();

		const retry = loader.get(0x0000);
		expect(fake.calls).toEqual([0, 0]);
		fake.resolve(0);
		expect((await retry).name).toBe("CHAR 000");
	});
});
