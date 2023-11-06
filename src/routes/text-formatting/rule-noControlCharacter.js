import { specialChars } from "./specialChars";

/** @typedef {import('@textlint/types').TextlintRuleContext} RuleContext */
/** @typedef {import('@textlint/ast-node-types').TxtNode} TxtNode */

const controlCharacterRE =
	/[\u{0}-\u{08}\u{0B}-\u{1F}\u{7F}-\u{9F}\u{200B}-\u{200F}\u{202A}-\u{202F}\u{205F}-\u{206F}]/gu;

/**
 * @param {RuleContext} context
 */
export default function noControlCharacter(context) {
	const { RuleError, Syntax, fixer, getSource, report } = context;
	return {
		/** @param {TxtNode} node */
		[Syntax.Str](node) {
			const text = getSource(node);
			console.log('TxtNode', text);

			[...text.matchAll(controlCharacterRE)].forEach((match) => {
				if (!match.index) return;

				const codePoint = match[0].codePointAt(0);
				const name = (codePoint != null) ? specialChars[codePoint][1] : null;

				report(
					node,
					new RuleError(`Found control character ${name ?? ''}`, {
						index: match.index,
						fix: fixer.replaceTextRange(
							[match.index, match.index + match[0].length],
							""
						),
					})
				);
			});
		},
	};
}
