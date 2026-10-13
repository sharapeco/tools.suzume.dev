import { linter } from "@codemirror/lint";

/** @typedef {import('@codemirror/lint').Diagnostic} Diagnostic */
/** @typedef {import('@textlint/kernel').TextlintMessage} TextlintMessage */

export const textLinter = linter(async (view) => {
	// textlint は Node.js の process に依存しており、Cloudflare Workers 上の SSR で
	// 読み込むと落ちるため、ブラウザで lint するときに初めて読み込む
	const { lintText } = await import("$lib/text-formatting/textlint");
	const messages = await lintText(view.state.doc.toString());
	return messages.map(textlintMessageToDiagnostic);
});

/**
 * @param {TextlintMessage} message
 * @return {Diagnostic}
 */
function textlintMessageToDiagnostic(message) {
	return {
		from: message.range[0],
		to: message.range[1],
		message: message.message,
		severity: textlintSeverityToDiagnosticSeverity(message.severity),
	};
}

/**
 * @param {number} severity
 * @return {"hint" | "info" | "warning" | "error"}
 */
function textlintSeverityToDiagnosticSeverity(severity) {
	switch (severity) {
		case 0:
			return "info";
		case 1:
			return "warning";
		case 2:
			return "error";
		default:
			return "hint";
	}
}
