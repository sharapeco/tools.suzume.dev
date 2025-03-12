/**
 * @typedef {{ id: string, name: string, fn: (text: string, option: string) => string, options: { [id: string]: string }, default: string }} FormatRule
 */

import {
	normalize,
	stripFullwidthForm,
	stripJISX0201Kana,
	stripVerticalForms,
	toFullwidthForm,
} from "$lib/zenkaku";

/** @type {FormatRule[]} */
export const formatRules = [
	{
		id: "normalize-nfc",
		name: "結合文字",
		options: {
			keep: "そのまま",
			normalize: "合成",
		},
		default: "normalize",
		fn(text, option) {
			switch (option) {
				case "normalize":
					return normalize(text);
			}
			return text;
		},
	},
	{
		id: "halfwidth-katakana",
		name: "半角カタカナ",
		options: {
			keep: "そのまま",
			normalize: "正規化",
		},
		default: "normalize",
		fn(text, option) {
			switch (option) {
				case "normalize":
					return stripJISX0201Kana(text);
			}
			return text;
		},
	},
	{
		id: "vertical-forms",
		name: "縦組用約物",
		options: {
			keep: "そのまま",
			normalize: "横組用に変換",
		},
		default: "normalize",
		fn(text, option) {
			switch (option) {
				case "normalize":
					return stripVerticalForms(text);
			}
			return text;
		},
	},
	{
		id: "control-characters",
		name: "制御文字",
		options: {
			keep: "そのまま",
			remove: "削除",
		},
		default: "remove",
		fn(text, option) {
			switch (option) {
				case "remove":
					return text.replace(
						// biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を取り除くため
						/[\u{0}-\u{08}\u{0B}-\u{1F}\u{7F}-\u{9F}\u{AD}\u{200B}-\u{200F}\u{202A}-\u{202F}\u{205F}-\u{206F}]/gu,
						"",
					);
			}
			return text;
		},
	},
	{
		id: "private-use-area",
		name: "私用領域",
		options: {
			keep: "そのまま",
			remove: "削除",
		},
		default: "keep",
		fn(text, option) {
			switch (option) {
				case "remove":
					return text.replace(
						/[\u{E000}-\u{F8FF}\u{FFF80}-\u{FFFFF}\u{10FF80}-\u{10FFFF}]/gu,
						"",
					);
			}
			return text;
		},
	},
	{
		id: "kangxi-radical",
		name: "康煕部首",
		options: {
			keep: "そのまま",
			normalize: "正規化",
		},
		default: "normalize",
		fn(text, option) {
			switch (option) {
				case "normalize":
					return text.replace(/[\u{2F00}-\u{2FD5}]/gu, (match) =>
						match.normalize("NFKC"),
					);
			}
			return text;
		},
	},
	{
		id: "trim-leading-spaces",
		name: "行頭のスペース",
		options: {
			keep: "そのまま",
			all: "削除",
			tabs: "タブを残す",
			ideographic: "全角スペースを残す",
			ideographicTabs: "全角スペースとタブを残す",
		},
		default: "ideographicTabs",
		fn(text, option) {
			switch (option) {
				case "all":
					return text.replace(/^[^\S\n]+/gm, "");
				case "tabs":
					return text.replace(/^[^\S\n\u3000]+/gm, "");
				case "ideographic":
					return text
						.replace(/^[^\S\n\u3000]+/gm, "")
						.replace(/^(\u3000+)[^\S\n\u3000]+/gm, "$1");
				case "ideographicTabs":
					return text
						.replace(/^[^\S\n\t\u3000]+/gm, "")
						.replace(/^([\t\u3000]+)[^\S\n\t\u3000]+/gm, "$1");
			}
			return text;
		},
	},
	{
		id: "trim-trailing-spaces",
		name: "行末のスペース",
		options: {
			keep: "そのまま",
			all: "削除",
		},
		default: "all",
		fn(text, option) {
			switch (option) {
				case "all":
					return text.replace(/[^\S\n]+$/gm, "");
			}
			return text;
		},
	},
	{
		id: "parentheses",
		name: "括弧 （）［］｛｝",
		options: {
			keep: "そのまま",
			fullwidth: "全角",
			halfwidth: "半角",
			halfwidthSpace: "半角（スペースを追加）",
		},
		default: "fullwidth",
		fn(text, option) {
			switch (option) {
				case "fullwidth":
					return text
						.replace(/[^\S\n\t]*[\(（][^\S\n\t]*/gu, "（")
						.replace(/[^\S\n\t]*[\)）][^\S\n\t]*/gu, "）")
						.replace(/[^\S\n\t]*[\[［][^\S\n\t]*/gu, "［")
						.replace(/[^\S\n\t]*[\]］][^\S\n\t]*/gu, "］")
						.replace(/[^\S\n\t]*[\{｛][^\S\n\t]*/gu, "｛")
						.replace(/[^\S\n\t]*[\}｝][^\S\n\t]*/gu, "｝");
				case "halfwidth":
					return text
						.replace(/[^\S\n\t]*[\(（][^\S\n\t]*/gu, "(")
						.replace(/[^\S\n\t]*[\)）][^\S\n\t]*/gu, ")")
						.replace(/[^\S\n\t]*[\[［][^\S\n\t]*/gu, "[")
						.replace(/[^\S\n\t]*[\]］][^\S\n\t]*/gu, "]")
						.replace(/[^\S\n\t]*[\{｛][^\S\n\t]*/gu, "{")
						.replace(/[^\S\n\t]*[\}｝][^\S\n\t]*/gu, "}");
				case "halfwidthSpace":
					return text
						.replace(/([\S]?)[^\S\n\t]*[\(（][^\S\n\t]*/gu, (_, p1) =>
							p1 !== "" ? `${p1} (` : "(",
						)
						.replace(/[^\S\n\t]*[\)）][^\S\n\t]*([\S]?)/gu, (_, p1) =>
							p1 !== "" ? `) ${p1}` : ")",
						)
						.replace(/([\S]?)[^\S\n\t]*[\[［][^\S\n\t]*/gu, (_, p1) =>
							p1 !== "" ? `${p1} [` : "[",
						)
						.replace(/[^\S\n\t]*[\]］][^\S\n\t]*([\S]?)/gu, (_, p1) =>
							p1 !== "" ? `] ${p1}` : "]",
						)
						.replace(/([\S]?)[^\S\n\t]*[\{｛][^\S\n\t]*/gu, (_, p1) =>
							p1 !== "" ? `${p1} {` : "{",
						)
						.replace(/[^\S\n\t]*[\}｝][^\S\n\t]*([\S]?)/gu, (_, p1) =>
							p1 !== "" ? `} ${p1}` : "}",
						);
			}
			return text;
		},
	},
	{
		id: "latin",
		name: "ラテン文字",
		options: {
			keep: "そのまま",
			halfwidth: "半角",
			fullwidth: "全角",
			fullwidth1c: "1文字のみ全角",
		},
		default: "halfwidth",
		fn(text, option) {
			switch (option) {
				case "halfwidth":
					return text.replace(/[Ａ-Ｚａ-ｚ]+/gu, (match) =>
						stripFullwidthForm(match),
					);
				case "fullwidth":
					return text.replace(/[A-Za-z]+/g, (match) => toFullwidthForm(match));
				case "fullwidth1c":
					return text.replace(/[A-Za-zＡ-Ｚａ-ｚ]+/g, (match) => {
						if (match.length <= 1) return toFullwidthForm(match);
						return stripFullwidthForm(match);
					});
			}
			return text;
		},
	},
	{
		id: "figure",
		name: "数字",
		options: {
			keep: "そのまま",
			halfwidth: "半角",
			fullwidth: "全角",
			fullwidth1c: "1桁のみ全角",
		},
		default: "halfwidth",
		fn(text, option) {
			switch (option) {
				case "halfwidth":
					return text.replace(/[０-９]+/gu, (match) =>
						stripFullwidthForm(match),
					);
				case "fullwidth":
					return text.replace(/[0-9]+/g, (match) => toFullwidthForm(match));
				case "fullwidth1c":
					return text.replace(/[0-9０-９]+/gu, (match) => {
						if (match.length <= 1) return toFullwidthForm(match);
						return stripFullwidthForm(match);
					});
			}
			return text;
		},
	},
	{
		id: "text-spacing",
		name: "和欧間スペース",
		options: {
			keep: "そのまま",
			strip: "スペースなし",
			hair: "Hair space",
			thin: "Thin space",
			sixPerEm: "1/6 em space",
		},
		default: "strip",
		fn(text, option) {
			const sp = {
				strip: "",
				hair: "\u{200A}",
				thin: "\u{2009}",
				sixPerEm: "\u{2006}",
			}[option];
			if (sp != null) {
				return text
					.replace(
						/([#$%&0-9A-Za-z¢-¥©ª®²³µ¶¹º¼-¾À-ʯ])[^\S\n]*([〃々ぁ-゚ゝ-ヿ㐀-鿕豈-舘])/gu,
						(_, p1, p2) => `${p1}${sp}${p2}`,
					)
					.replace(
						/([〃々ぁ-゚ゝ-ヿ㐀-鿕豈-舘])[^\S\n]*([#$%&0-9A-Za-z¢-¥©ª®²³µ¶¹º¼-¾À-ʯ])/gu,
						(_, p1, p2) => `${p1}${sp}${p2}`,
					);
			}
			return text;
		},
	},
];
