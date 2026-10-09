import { linter } from "@codemirror/lint";
import { lintText } from "$lib/text-formatting/textlint";

/** @typedef {import('@codemirror/lint').Diagnostic} Diagnostic */
/** @typedef {import('@textlint/kernel').TextlintMessage} TextlintMessage */

export const textLinter = linter(async (view) => {
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
