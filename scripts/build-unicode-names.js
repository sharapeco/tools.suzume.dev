#!/usr/bin/env node
/**
 * NamesList.txt から「Unicode文字情報」用のデータを生成する。
 *
 *   pnpm gen:unicode [NamesList.txt のパスまたはURL]
 *
 * 出力:
 *   static/unicode-names/<version>/<chunkId>.json  0x100 コードポイントごとの文字データ
 *   src/lib/unicode/data/unicodeIndex.json         ブロック一覧などの索引（バンドルに含める）
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	buildChunks,
	chunkFileName,
	findUnlistedBlocks,
	parseNamesList,
	toHex,
} from "../src/lib/unicode/namesList.js";

const DEFAULT_SOURCE = "https://www.unicode.org/Public/UNIDATA/NamesList.txt";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const staticDir = path.join(root, "static", "unicode-names");
const indexFile = path.join(root, "src", "lib", "unicode", "data", "unicodeIndex.json");

/**
 * @param {string} source
 */
async function readSource(source) {
	if (/^https?:\/\//.test(source)) {
		const res = await fetch(source);
		if (!res.ok) {
			throw new Error(`${source}: ${res.status} ${res.statusText}`);
		}
		return res.text();
	}
	return readFile(source, "utf-8");
}

async function main() {
	const source = process.argv[2] ?? DEFAULT_SOURCE;
	console.log(`読み込み: ${source}`);
	const parsed = parseNamesList(await readSource(source));
	if (!parsed.version) {
		throw new Error("NamesList.txt のバージョンが見つかりません");
	}

	const chunks = buildChunks(parsed.chars);
	const outDir = path.join(staticDir, parsed.version);

	// 古いバージョンのデータは消す
	await mkdir(staticDir, { recursive: true });
	for (const name of await readdir(staticDir)) {
		await rm(path.join(staticDir, name), { recursive: true, force: true });
	}
	await mkdir(outDir, { recursive: true });

	let totalBytes = 0;
	for (const [id, chunk] of chunks) {
		const json = JSON.stringify(chunk);
		totalBytes += json.length;
		await writeFile(path.join(outDir, chunkFileName(id)), json);
	}

	const index = {
		version: parsed.version,
		blocks: parsed.blocks.map(([start, end, name]) => [toHex(start), toHex(end), name]),
		unlistedBlocks: findUnlistedBlocks(parsed).map(([start]) => toHex(start)),
		chunks: [...chunks.keys()].sort((a, b) => a - b).map(toHex),
	};
	const lines = [
		"{",
		`\t"version": ${JSON.stringify(index.version)},`,
		'\t"blocks": [',
		index.blocks.map((b) => `\t\t${JSON.stringify(b)}`).join(",\n"),
		"\t],",
		`\t"unlistedBlocks": ${JSON.stringify(index.unlistedBlocks)},`,
		`\t"chunks": ${JSON.stringify(index.chunks)}`,
		"}",
		"",
	];
	await mkdir(path.dirname(indexFile), { recursive: true });
	await writeFile(indexFile, lines.join("\n"));

	console.log(`Unicode ${parsed.version}: ${parsed.chars.size} 文字, ${parsed.blocks.length} ブロック`);
	console.log(`${chunks.size} ファイル (${Math.round(totalBytes / 1024)} KB) → ${path.relative(root, outDir)}`);
	console.log(`索引 → ${path.relative(root, indexFile)}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
