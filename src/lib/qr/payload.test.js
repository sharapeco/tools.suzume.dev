import { describe, expect, it } from "vitest";
import { buildPayload, convertNewline } from "./payload";

const empty = {
	mode: "string",
	input: "",
	mailto: { to: "", subject: "", body: "" },
	ssid: { ssid: "", password: "" },
	newline: /** @type {const} */ ("CRLF"),
};

describe("convertNewline", () => {
	it("改行コードを統一する", () => {
		expect(convertNewline("a\r\nb\nc\rd", "LF")).toBe("a\nb\nc\nd");
		expect(convertNewline("a\nb", "CRLF")).toBe("a\r\nb");
	});
});

describe("buildPayload", () => {
	it("文字列モードでは改行コードを変換する", () => {
		expect(buildPayload({ ...empty, input: "a\nb", newline: "CR" })).toBe(
			"a\rb",
		);
	});

	it("mailto モードでは宛先がなければ空文字列", () => {
		expect(buildPayload({ ...empty, mode: "mailto" })).toBe("");
	});

	it("mailto モードで件名と本文がなければ宛先だけにする", () => {
		expect(
			buildPayload({
				...empty,
				mode: "mailto",
				mailto: { to: "a@example.com", subject: "", body: "" },
			}),
		).toBe("mailto:a@example.com");
	});

	it("mailto モードの本文の改行は CRLF にする", () => {
		expect(
			buildPayload({
				...empty,
				mode: "mailto",
				mailto: { to: "a@example.com", subject: "件名", body: "1\n2" },
				newline: "LF",
			}),
		).toBe("mailto:a@example.com?subject=件名&body=1\r\n2");
	});

	it("SSID モードでは SSID とパスワードが揃っていなければ空文字列", () => {
		expect(
			buildPayload({
				...empty,
				mode: "ssid",
				ssid: { ssid: "suzume", password: "" },
			}),
		).toBe("");
		expect(
			buildPayload({
				...empty,
				mode: "ssid",
				ssid: { ssid: "suzume", password: "chun" },
			}),
		).toBe("WIFI:T:WPA;S:suzume;P:chun;;");
	});
});
