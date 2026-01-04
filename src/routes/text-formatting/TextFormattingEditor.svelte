<script>
import { history } from "@codemirror/commands";
import { highlightSelectionMatches } from "@codemirror/search";
import { EditorState } from "@codemirror/state";
import {
	drawSelection,
	dropCursor,
	highlightActiveLine,
	highlightActiveLineGutter,
	lineNumbers,
} from "@codemirror/view";
import CodeMirror from "svelte-codemirror-editor";
import tabIcon from "$lib/assets/tab.svg";
import { textLinter } from "./linter";
import { plainTextKeymap } from "./plainTextKeymap";
import { specialCharsHighlighter } from "./specialCharsHighlighter";

/**
 * @typedef {Object} Props
 * @property {string} input
 */

/** @type {Props} */
let { input = $bindable() } = $props();

const extensions = [
	lineNumbers(),
	highlightActiveLine(),
	highlightActiveLineGutter(),
	history(),
	drawSelection(),
	dropCursor(),
	EditorState.allowMultipleSelections.of(true),
	highlightSelectionMatches(),
	plainTextKeymap,
	specialCharsHighlighter,
	textLinter,
];
</script>

<CodeMirror
	bind:value={input}
	extensions={extensions}
	useTab={false}
	tabSize={4}
	lineWrapping={true}
	styles={{
		"&": {
			height: "100%",
			flexGrow: 1,
		},
		".cm-gutters": {
			paddingLeft: "8px",
			fontSize: "80%",
			lineHeight: "19px",
			fontFamily: "sans-serif",
			fontFeatureSettings: '"lnum", "tnum"',
			color: "rgb(107 114 128)",
			backgroundColor: "rgb(248 250 252)",
			borderColor: "rgb(226 232 240)",
		},
		".cm-content": {
			padding: "8px 4px 8px 0",
			fontFamily: '"ヒラギノ角ゴシック", "ヒラギノ角ゴ ProN", "Segoe UI", sans-serif',
			fontFeatureSettings: '"lnum", "tnum"',
		},
		".cm-line": {
			padding: "0 2px 0 8px",
			lineHeight: "19px",
		},
		".cm-lintRange": {
			paddingBottom: "3px",
		},
		".cm-specialChar": {
			color: "#f59e0b",
		},
		".cm-tab": {
			minWidth: "0.5em",
			maxWidth: "1em",
			color: "#f59e0b",
			backgroundImage: `url(${tabIcon})`,
			backgroundSize: "0.7em 0.7em",
			backgroundPosition: "0.15em 50%",
			backgroundRepeat: "no-repeat",
		},
		".cm-charType-fullwidth": {
			fontFamily: '"ヒラギノ角ゴシック", "ヒラギノ角ゴ ProN", sans-serif',
		},
		".cm-charType-radical": {
			color: "#d946ef",
		},
		".cm-charType-vertical": {
			color: "#d946ef",
		},
		".cm-charType-private": {
			color: "#ec4899",
		},
		".cm-controlChar": {
			display: "inline-block",
			verticalAlign: "middle",
			margin: "0 0.0625em",
			padding: "0.125em 0.0625em",
			fontFamily: "monospace",
			fontSize: "75%",
			lineHeight: "1",
			border: "1px dotted",
		},
		".cm-activeLine": {
			backgroundColor: "#50bcff14",
		},
	}}
/>
