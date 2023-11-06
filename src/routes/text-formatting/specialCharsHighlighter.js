import { highlightSpecialChars } from "@codemirror/view";
import { specialChars } from "./specialChars";

export const specialCharsHighlighter = highlightSpecialChars({
	specialChars: /[\u{0}-\u{09}\u{0B}-\u{1F}\u{7F}-\u{9F}\u{200B}-\u{200F}\u{3000}\u{E000}-\u{F8FF}\u{FFF80}-\u{FFFFF}\u{10FF80}-\u{10FFFF}]/gu,
	render(code, description, placeholder) {
		// @ts-ignore
		const [type, replacer] = specialChars[code] ?? ["unknown", null];
		const span = document.createElement("span");
		span.setAttribute("aria-label", description ?? "");
		span.setAttribute("contenteditable", "false");
		span.classList.add("cm-specialChar");
		if (code >= 0xE000) {
			// 私用領域
			span.classList.add("cm-charType-private");
			span.textContent = "?";
		} else {
			span.classList.add(`cm-charType-${type}`);
			span.textContent = replacer ?? placeholder;
		}
		return span;
	},
});
