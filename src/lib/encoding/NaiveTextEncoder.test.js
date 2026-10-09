import { describe, expect, it } from "vitest";
import { NaiveTextEncoder } from "./NaiveTextEncoder";

describe("NaiveTextEncoder (EUC-JP)", () => {
	const encoder = new NaiveTextEncoder("EUC-JP", 3);

	it("ASCII と全角文字をエンコードする", () => {
		expect([...encoder.encode("aあ漢")]).toEqual([
			0x61, 0xa4, 0xa2, 0xb4, 0xc1,
		]);
	});

	it("TextDecoder でデコードすると元の文字列に戻る", () => {
		const text = "雀の子そこのけそこのけ御馬が通る";
		expect(new TextDecoder("euc-jp").decode(encoder.encode(text))).toBe(text);
	});

	it("波ダッシュは全角チルダとしてエンコードする", () => {
		expect(encoder.encode("〜")).toEqual(encoder.encode("～"));
	});
});
