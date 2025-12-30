/** @typedef {import('@textlint/types').TextlintRuleContext} RuleContext */
/** @typedef {import('@textlint/ast-node-types').TxtNode} TxtNode */

/**
 * 4桁数字-4桁数字 のつなぎがenダッシュではなくハイフンの場合に警告を出すTextLintルール
 *
 * @param {RuleContext} context
 */
export default function noHyphenBetweenYears(context) {
	const { Syntax, RuleError, report, getSource, locator } = context;
	return {
		/** @param {TxtNode} node */
		[Syntax.Str](node) {
			const text = getSource(node);
			// 4桁数字-4桁数字（例: 1980-1995）
			const regex = /(?<!\d)(\d{4})-(\d{4})(?!\d)/g;
			const matches = Array.from(text.matchAll(regex));
			for (const match of matches) {
				const index = match.index;
				const length = match[0].length;
				report(
					node,
					new RuleError(
						"年号の範囲を示す場合はenダッシュ (–) を使いましょう。",
						{ padding: locator.range([index, index + length]) },
					),
				);
			}
		},
	};
}
