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

			for (const match of [...text.matchAll(radicalSupplementRE)]) {
				if (match.index == null) return;
				report(
					node,
					new RuleError("CJK部首補助が含まれています", {
						padding: locator.range([
							match.index,
							match.index + match[0].length,
						]),
					}),
				);
			}

			for (const match of [...text.matchAll(kangxiRadicalRE)]) {
				if (match.index == null) return;
				report(
					node,
					new RuleError("康熙部首が含まれています", {
						padding: locator.range([
							match.index,
							match.index + match[0].length,
						]),
						fix: fixer.replaceTextRange(
							[match.index, match.index + match[0].length],
							match[0].normalize("NFKC"),
						),
					}),
				);
			}
		},
	};
}
