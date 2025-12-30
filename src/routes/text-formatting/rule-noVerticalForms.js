/** @typedef {import('@textlint/types').TextlintRuleContext} RuleContext */
/** @typedef {import('@textlint/ast-node-types').TxtNode} TxtNode */

import { stripVerticalForms } from "$lib/zenkaku";

const verticalFormsRE =
	/[︐︑︒︓︔︕︖︗︘︙︰︱︲︳︴︵︶︷︸︹︺︻︼︽︾︿﹀﹁﹂﹃﹄﹇﹈]/gu;

/**
 * @param {RuleContext} context
 */
export default function noVerticalForms(context) {
	const { RuleError, Syntax, fixer, getSource, locator, report } = context;
	return {
		/** @param {TxtNode} node */
		[Syntax.Str](node) {
			const text = getSource(node);

			for (const match of [...text.matchAll(verticalFormsRE)]) {
				if (match.index == null) return;
				report(
					node,
					new RuleError("縦組用字形が含まれています", {
						padding: locator.range([
							match.index,
							match.index + match[0].length,
						]),
						fix: fixer.replaceTextRange(
							[match.index, match.index + match[0].length],
							stripVerticalForms(match[0]),
						),
					}),
				);
			}
		},
	};
}
