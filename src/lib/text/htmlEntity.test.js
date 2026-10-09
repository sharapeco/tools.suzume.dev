import { describe, expect, it } from "vitest";
import {
	convertToNumericCharacterReference,
	encodeHTMLEntities,
} from "./htmlEntity";

describe("encodeHTMLEntities", () => {
	it("予約済み文字を実体参照にする", () => {
		expect(encodeHTMLEntities(`<a href="x">&</a>`)).toBe(
			"&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;",
		);
	});
});

describe("convertToNumericCharacterReference", () => {
	it("サロゲートペアも1文字として数値文字参照にする", () => {
		expect(convertToNumericCharacterReference("A𠮷")).toBe("&#65;&#134071;");
	});
});
