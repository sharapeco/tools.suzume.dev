/** @typedef {import('@textlint/types').TextlintRuleContext} RuleContext */
/** @typedef {import('@textlint/ast-node-types').TxtNode} TxtNode */

const kangxiRadicalRE = /[\u{2F00}-\u{2FD5}]/gu;

/**
 * @param {RuleContext} context
 */
export default function noKangxiRadical(context) {
	const { RuleError, Syntax, fixer, getSource, locator, report } = context;
	return {
		/** @param {TxtNode} node */
		[Syntax.Str](node) {
			const text = getSource(node);

			[...text.matchAll(kangxiRadicalRE)].forEach((match) => {
				if (match.index == null) return;
				report(
					node,
					new RuleError("Found Kangxi radical", {
						padding: locator.range([match.index, match.index + match[0].length]),
						fix: fixer.replaceTextRange(
							[match.index, match.index + match[0].length],
							match[0].normalize("NFKC")
						),
					})
				);
			});
		},
	};
}
