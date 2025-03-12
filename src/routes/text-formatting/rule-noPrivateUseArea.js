/** @typedef {import('@textlint/types').TextlintRuleContext} RuleContext */
/** @typedef {import('@textlint/ast-node-types').TxtNode} TxtNode */

const privateUseAreaRE = /[\u{E000}-\u{F8FF}\u{FFF80}-\u{FFFFF}\u{10FF80}-\u{10FFFF}]/gu;

/**
 * @param {RuleContext} context
 */
export default function noPrivateUseArea(context) {
	const { RuleError, Syntax, fixer, getSource, locator, report } = context;
	return {
		/** @param {TxtNode} node */
		[Syntax.Str](node) {
			const text = getSource(node);

			for (const match of [...text.matchAll(privateUseAreaRE)]) {
				if (match.index == null) return;
				report(
					node,
					new RuleError("Found PUA", {
						padding: locator.range([match.index, match.index + match[0].length]),
						fix: fixer.replaceTextRange(
							[match.index, match.index + match[0].length],
							""
						),
					})
				);
			}
		},
	};
}
