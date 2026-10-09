import { TextlintKernel } from "@textlint/kernel";
import textlintText from "@textlint/textlint-plugin-text";
import noControlCharacter from "./rules/noControlCharacter";
import noDumbQuotes from "./rules/noDumbQuotes";
import noHyphenBetweenYears from "./rules/noHyphenBetweenYears";
import noPrivateUseArea from "./rules/noPrivateUseArea";
import noRadical from "./rules/noRadical";
import noRegionalIndicatorSymbol from "./rules/noRegionalIndicatorSymbol";
import noSpaceBetweenJapaneseChars from "./rules/noSpaceBetweenJapaneseChars";
import noVerticalForms from "./rules/noVerticalForms";
import noWrongBrackets from "./rules/noWrongBrackets";

/** @typedef {import('@textlint/kernel').TextlintMessage} TextlintMessage */

const kernel = new TextlintKernel();

/**
 * テキストを textlint で検査する
 *
 * @param {string} text
 * @returns {Promise<TextlintMessage[]>}
 */
export async function lintText(text) {
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
	return result.messages;
}
