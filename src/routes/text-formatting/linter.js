import { linter } from "@codemirror/lint";
import { TextlintKernel } from "@textlint/kernel";
import textlintText from "@textlint/textlint-plugin-text";
import noControlCharacter from "./rule-noControlCharacter";
import noDumbQuotes from "./rule-noDumpQuotes";
import noHyphenBetweenYears from "./rule-noHyphenBetweenYears";
import noPrivateUseArea from "./rule-noPrivateUseArea";
import noRadical from "./rule-noRadical";
import noRegionalIndicatorSymbol from "./rule-noRegionalIndicatorSymbol";
import noSpaceBetweenJapaneseChars from "./rule-noSpaceBetweenJapaneseChars";
import noVerticalForms from "./rule-noVerticalForms";
import noWrongBrackets from "./rule-noWrongBrackets";

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
				ruleId: "no-hyphen-between-years",
				rule: noHyphenBetweenYears,
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
				ruleId: "no-space-between-japanese-chars",
				rule: noSpaceBetweenJapaneseChars,
			},
			{
				ruleId: "no-vertical-forms",
				rule: noVerticalForms,
			},
			{
				ruleId: "no-wrong-brackets",
				rule: noWrongBrackets,
			},
			{
				ruleId: "no-regional-indicator-symbol",
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
