import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { lintKeymap } from "@codemirror/lint";
import { searchKeymap } from "@codemirror/search";
import { keymap } from "@codemirror/view";

/**
 * 任意の文字を挿入するカスタムキーバインディング
 *
 * @param {string} text
 * @returns {import('@codemirror/view').Command}
 */
function insertText(text) {
	return (view) => {
		const { state, dispatch } = view;
		if (!state.selection.ranges[0]) {
			return false;
		}
		dispatch(
			state.update({
				changes: {
					from: state.selection.ranges[0].from,
					to: state.selection.ranges[0].to,
					insert: text,
				},
				selection: {
					anchor: state.selection.ranges[0].from + text.length,
				},
				scrollIntoView: true,
				userEvent: "input",
			}),
		);
		return true;
	};
}

const removeKeys = ["Enter", "Mod-Enter"];
export const plainTextKeymap = keymap.of([
	{
		key: "Tab",
		preventDefault: true,
		run: insertText("\t"),
	},
	{
		key: "Enter",
		preventDefault: true,
		run: insertText("\n"),
	},
	...defaultKeymap.filter((keymap) => !removeKeys.includes(keymap.key ?? "")),
	...searchKeymap,
	...historyKeymap,
	...lintKeymap,
]);
