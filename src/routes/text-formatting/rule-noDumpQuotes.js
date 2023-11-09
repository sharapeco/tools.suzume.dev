import { specialChars } from "./specialChars";

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

			[...text.matchAll(dumbQuotesRE)].forEach((match) => {
				if (match.index == null) return;
				report(
					node,
					new RuleError("Found dumb quote", {
						index: match.index,
					})
				);
			});
		},
	};
}
