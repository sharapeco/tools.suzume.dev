/**
 * 誤った囲み記号の使用を正しい日本語表記に修正するTextLintルール
 *
 * ≪...≫ → 《...》
 * <<...>> → 《...》
 * ＜...＞ → 〈...〉
 * <...> → 〈...〉
 *
 * @typedef {import('@textlint/types').TextlintRuleContext} RuleContext
 * @typedef {import('@textlint/ast-node-types').TxtNode} TxtNode
 *
 * @param {RuleContext} context
 */
export default function noWrongBrackets(context) {
	const { Syntax, RuleError, report, getSource, fixer, locator } = context;
	return {
		/** @param {TxtNode} node */
		[Syntax.Str](node) {
			const text = getSource(node);
			// 4パターンの誤用記号
			const patterns = [
				{
					regex: /≪(.{1,30}?)≫/g,
					replace: "《$1》",
					message: "≪...≫ は 《...》 に直してください。",
				},
				{
					regex: /<<(.{1,30}?)>>/g,
					replace: "《$1》",
					message: "<<...>> は 《...》 に直してください。",
				},
				{
					regex: /＜(.{1,30}?)＞/g,
					replace: "〈$1〉",
					message: "＜...＞ は 〈...〉 に直してください。",
				},
				{
					regex: /<(.{1,30}?)>/g,
					replace: "〈$1〉",
					message: "<...> は 〈...〉 に直してください。",
				},
			];
			for (const { regex, replace, message } of patterns) {
				const matches = Array.from(text.matchAll(regex));
				for (const match of matches) {
					report(
						node,
						new RuleError(message, {
							padding: locator.range([
								match.index,
								match.index + match[0].length,
							]),
							fix: fixer.replaceTextRange(
								[match.index, match.index + match[0].length],
								match[0].replace(regex, replace),
							),
						}),
					);
				}
			}
		},
	};
}
