/** @typedef {import('@textlint/types').TextlintRuleContext} RuleContext */
/** @typedef {import('@textlint/ast-node-types').TxtNode} TxtNode */

const re = /[\u{1F1E6}-\u{1F1FF}]/gu;

/**
 * @param {RuleContext} context
 */
export default function noRegionalIndicatorSymbol(context) {
	const { RuleError, Syntax, getSource, locator, report } = context;
	return {
		/** @param {TxtNode} node */
		[Syntax.Str](node) {
			const text = getSource(node);

			[...text.matchAll(re)].forEach((match) => {
				if (match.index == null) return;
				report(
					node,
					new RuleError("Found regional indicator symbol", {
						padding: locator.range([match.index, match.index + match[0].length]),
					})
				);
			});
		},
	};
}
