/** @typedef {import('@textlint/types').TextlintRuleContext} RuleContext */
/** @typedef {import('@textlint/ast-node-types').TxtNode} TxtNode */

const dumbQuotesRE = /["'`]/gu;

/**
 * @param {RuleContext} context
 */
export default function noDumbQuotes(context) {
	const { RuleError, Syntax, getSource, report } = context;
	return {
		/** @param {TxtNode} node */
		[Syntax.Str](node) {
			const text = getSource(node);

			for (const match of [...text.matchAll(dumbQuotesRE)]) {
				if (match.index == null) return;
				report(
					node,
					new RuleError("マヌケ引用符のかわりに “...” ‘…’ を使いましょう", {
						index: match.index
					})
				);
			}
		}
	};
}
