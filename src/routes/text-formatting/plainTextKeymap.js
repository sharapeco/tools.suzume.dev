import { defaultKeymap } from "@codemirror/commands";
import { keymap } from "@codemirror/view";

/**
 * 任意の文字を挿入するカスタムキーバインディング
 * @param {string} text
 */
function insertText(text) {
	/** @param {EditorView} view */
	return (view) => {
		const { state, dispatch } = view;
		if (!state.selection.ranges[0]) {
			return;
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
			})
		);
	};
}

export const plainTextKeymap = keymap.of(
	defaultKeymap.concat([
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
	])
);
