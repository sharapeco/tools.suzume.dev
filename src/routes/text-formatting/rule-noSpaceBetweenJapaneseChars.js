const SPACE_REGEX = /[\u0020\u2000-\u200A]/;
const JAPANESE_CHAR_REGEX = /[〃々ぁ-゚ゝ-ヿ㐀-鿕豈-舘]/;

/**
 * 和文文字の間にスペース（U+0020, U+2000〜U+200A）が入っていた場合に警告を出すTextLintルール
 *
 * @typedef {import('@textlint/types').TextlintRuleContext} RuleContext
 * @typedef {import('@textlint/ast-node-types').TxtNode} TxtNode
 *
 * @param {RuleContext} context
 */
export default function noSpaceBetweenJapaneseChars(context) {
	const { Syntax, RuleError, report, getSource, locator } = context;
	return {
		/** @param {TxtNode} node */
		[Syntax.Str](node) {
			const text = getSource(node);
			// 和文文字 + スペース + 和文文字
			const regex = new RegExp(
				`(${JAPANESE_CHAR_REGEX.source})(${SPACE_REGEX.source})(${JAPANESE_CHAR_REGEX.source})`,
				"g"
			);
			const matches = Array.from(text.matchAll(regex));
			for (const match of matches) {
				const index = match.index + match[1].length; // スペースの位置
				report(
					node,
					new RuleError("このスペースは意図的？", {
						padding: locator.range([index - 1, index + 2])
					})
				);
			}
		}
	};
}
