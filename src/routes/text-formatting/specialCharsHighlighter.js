import { highlightSpecialChars } from "@codemirror/view";
import { specialChars } from "./specialChars";

export const specialCharsHighlighter = highlightSpecialChars({
	specialChars: /[\u{0}-\u{09}\u{0B}-\u{1F}\u{7F}-\u{9F}\u{00AD}\u{200B}-\u{200F}\u{2F00}-\u{2FDF}\u{3000}\u{E000}-\u{F8FF}\u{FE10}-\u{FE19}\u{FE30}-\u{FE44}\u{FE47}-\u{FE48}\u{FFF80}-\u{FFFFF}\u{10FF80}-\u{10FFFF}]/gu,
	render(code, description, placeholder) {
		// @ts-ignore
		const [type, replacer] = specialChars[code] ?? ["unknown", null];
		const span = document.createElement("span");
		span.setAttribute("aria-label", description ?? "");
		span.setAttribute("contenteditable", "false");
		span.classList.add("cm-specialChar");
		if (type === "control") {
			span.classList.add("cm-lintRange", "cm-lintRange-error");
			span.appendChild(createControlCharacter(replacer ?? placeholder));
		} else if (code >= 0x2F00 && code <= 0x2FDF) {
			// 康煕部首
			span.classList.add("cm-charType-kangxi", "cm-lintRange", "cm-lintRange-warning");
			span.textContent = String.fromCodePoint(code);
		} else if ((code >= 0xE000 && code <= 0xF8FF) || (code >= 0xFFF80 && code <= 0xFFFFF) || (code >= 0x10FF80 && code <= 0x10FFFF)) {
			// 私用領域
			span.classList.add("cm-charType-private", "cm-lintRange", "cm-lintRange-warning");
			span.textContent = String.fromCodePoint(code);
		} else if ((code >= 0xFE10 && code <= 0xFE19) || (code >= 0xFE30 && code <= 0xFE44) || (code >= 0xFE47 && code <= 0xFE48)) {
			// Vertical Forms, CJK Compatibility Forms
			span.classList.add("cm-charType-vertical", "cm-lintRange", "cm-lintRange-warning");
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
