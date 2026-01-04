import { specialChars } from "$lib/text-formatting/specialChars";

/** @typedef {import('@textlint/types').TextlintRuleContext} RuleContext */
/** @typedef {import('@textlint/ast-node-types').TxtNode} TxtNode */

const controlCharacterRE =
	// biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字を取り除くため
	/[\u{0}-\u{08}\u{0B}-\u{1F}\u{7F}-\u{9F}\u{AD}\u{200B}-\u{200F}\u{202A}-\u{202F}\u{2060}-\u{206F}]/gu;

/**
 * @param {RuleContext} context
 */
export default function noControlCharacter(context) {
	const { RuleError, Syntax, fixer, getSource, report } = context;
	return {
		/** @param {TxtNode} node */
		[Syntax.Str](node) {
			const text = getSource(node);

			for (const match of [...text.matchAll(controlCharacterRE)]) {
				if (match.index == null) return;

				const codePoint = match[0].codePointAt(0);
				const name = codePoint != null ? specialChars[codePoint][1] : null;

				report(
					node,
					new RuleError(`制御文字が含まれます ${name ?? ""}`, {
						index: match.index,
						fix: fixer.replaceTextRange(
							[match.index, match.index + match[0].length],
							"",
						),
					}),
				);
			}
		},
	};
}
