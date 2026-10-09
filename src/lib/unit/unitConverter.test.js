import { describe, expect, it } from "vitest";
import { convert, converters } from "./unitConverter";

/**
 * @param {string} name
 */
function unit(name) {
	const found = converters.flatMap((c) => c.units).find((u) => u.name === name);
	if (!found) throw new Error(`unknown unit: ${name}`);
	return found;
}

describe("convert", () => {
	it("単位を変換する", () => {
		expect(convert("1", unit("km²"), unit("ha"))).toBe("100");
	});

	it("末尾の0と小数点を取り除く", () => {
		expect(convert("1", unit("ha"), unit("km²"))).toBe("0.01");
	});

	it("小数点以下6桁に丸める", () => {
		expect(convert("1", unit("m²"), unit("東京ドーム"))).toBe("0.000021");
	});
});
