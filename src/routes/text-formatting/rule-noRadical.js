/** @typedef {import('@textlint/types').TextlintRuleContext} RuleContext */
/** @typedef {import('@textlint/ast-node-types').TxtNode} TxtNode */

const radicalSupplementRE = /[\u{2E80}-\u{2EF3}]/gu;
const kangxiRadicalRE = /[\u{2F00}-\u{2FD5}]/gu;

/**
 * @param {RuleContext} context
 */
export default function noRadical(context) {
	const { RuleError, Syntax, fixer, getSource, locator, report } = context;
	return {
		/** @param {TxtNode} node */
		[Syntax.Str](node) {
			const text = getSource(node);

			[...text.matchAll(radicalSupplementRE)].forEach((match) => {
				if (match.index == null) return;
				report(
					node,
					new RuleError("Found CJK radical supplement", {
						padding: locator.range([match.index, match.index + match[0].length]),
					})
				);
			});

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
