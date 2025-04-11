import { highlightSpecialChars } from "@codemirror/view";
import { specialChars } from "./specialChars";

const re = new RegExp(
	`[${[
			// 制御文字; HT, LF を除く
			"\u{0}-\u{09}\u{0B}-\u{1F}\u{7F}-\u{9F}",
			// SHY
			"\u{00AD}",
			// ZWSP, ZWNJ, ZWJ, LRM, RLM
			"\u{200B}-\u{200F}",
			// CJK部首補助, 康熙部首
			"\u{2E80}-\u{2EF3}\u{2F00}-\u{2FDF}",
			// 全角スペース
			"\u{3000}",
			// 私用領域
			"\u{E000}-\u{F8FF}\u{FFF80}-\u{FFFFF}\u{10FF80}-\u{10FFFF}",
			// Vertical Forms, CJK Compatibility Forms
			"\u{FE10}-\u{FE19}\u{FE30}-\u{FE44}\u{FE47}-\u{FE48}",
		].join("")}]`,
	"gu",
);

export const specialCharsHighlighter = highlightSpecialChars({
	specialChars: re,
	render(code, description, placeholder) {
		// @ts-ignore
		const [type, replacer] = specialChars[code] ?? ["unknown", null];
		const span = document.createElement("span");
		span.setAttribute("aria-label", description ?? "");
		span.setAttribute("contenteditable", "false");
		span.classList.add("cm-specialChar");
		if (code === 0x09) {
			// HT, TAB
			span.classList.add("cm-charType-tab");
		} else if (type === "control") {
			span.classList.add("cm-lintRange", "cm-lintRange-error");
			span.appendChild(createControlCharacter(replacer ?? placeholder));
		} else if (
			(code >= 0x2e80 && code <= 0x2ef3) ||
			(code >= 0x2f00 && code <= 0x2fdf)
		) {
			// CJK部首補助, 康煕部首
			span.classList.add(
				"cm-charType-radical",
				"cm-lintRange",
				"cm-lintRange-warning",
			);
			span.textContent = String.fromCodePoint(code);
		} else if (
			(code >= 0xe000 && code <= 0xf8ff) ||
			(code >= 0xfff80 && code <= 0xfffff) ||
			(code >= 0x10ff80 && code <= 0x10ffff)
		) {
			// 私用領域
			span.classList.add(
				"cm-charType-private",
				"cm-lintRange",
				"cm-lintRange-warning",
			);
			span.textContent = String.fromCodePoint(code);
		} else if (
			(code >= 0xfe10 && code <= 0xfe19) ||
			(code >= 0xfe30 && code <= 0xfe44) ||
			(code >= 0xfe47 && code <= 0xfe48)
		) {
			// Vertical Forms, CJK Compatibility Forms
			span.classList.add(
				"cm-charType-vertical",
				"cm-lintRange",
				"cm-lintRange-warning",
			);
			span.textContent = String.fromCodePoint(code);
		} else {
			span.classList.add(`cm-charType-${type}`);
			span.textContent = replacer ?? placeholder;
		}
		return span;
	},
});

/**
 * @param {string} name
 * @returns {HTMLSpanElement}
 */
function createControlCharacter(name) {
	const span = document.createElement("span");
	span.classList.add("cm-controlChar");
	span.textContent = name;
	return span;
}
