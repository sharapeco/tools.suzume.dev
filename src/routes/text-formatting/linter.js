console.log("linter.js:1");
import { linter } from "@codemirror/lint";
console.log("linter.js:3");
import { TextlintKernel } from "@textlint/kernel";
console.log("linter.js:5");
import textlintText from "@textlint/textlint-plugin-text";
console.log("linter.js:7");
import noControlCharacter from "./rule-noControlCharacter";
import noDumbQuotes from "./rule-noDumpQuotes";
import noRadical from "./rule-noRadical";
import noPrivateUseArea from "./rule-noPrivateUseArea";
import noVerticalForms from "./rule-noVerticalForms";
import noRegionalIndicatorSymbol from "./rule-noRegionalIndicatorSymbol";

/** @typedef {import('@codemirror/lint').Diagnostic} Diagnostic */
/** @typedef {import('@textlint/kernel').TextlintMessage} TextlintMessage */

const kernel = new TextlintKernel();

export const textLinter = linter(async (view) => {
	const text = view.state.doc.toString();
	const result = await kernel.lintText(text, {
		ext: ".txt",
		plugins: [
			{
				pluginId: "text",
				plugin: textlintText,
			},
		],
		rules: [
			{
				ruleId: "no-control-character",
				rule: noControlCharacter,
			},
			{
				ruleId: "no-dumb-quotes",
				rule: noDumbQuotes,
			},
			{
				ruleId: "no-radical",
				rule: noRadical,
			},
			{
				ruleId: "no-private-use-area",
				rule: noPrivateUseArea,
			},
			{
				ruleId: "no-vertical-forms",
				rule: noVerticalForms,
			},
			{
				ruleId: "no-regioanl-indicator-symbol",
				rule: noRegionalIndicatorSymbol,
			},
		],
	});
	return result.messages.map(textlintMessageToDiagnostic);
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
