<script>
	import CodeMirror from "svelte-codemirror-editor";
	import { specialCharsHighlighter } from "./specialCharsHighlighter";
	import { plainTextKeymap } from "./plainTextKeymap";
	import { textLinter } from "./linter";

	/** @type {string} */
	export let input;

	const extensions = [plainTextKeymap, specialCharsHighlighter, textLinter];
</script>

<CodeMirror
	bind:value={input}
	useTab={false}
	tabSize={4}
	{extensions}
	styles={{
		"&": {
			"flex-grow": 1,
		},
		".cm-gutters": {
			paddingLeft: "0.4em",
			fontSize: "80%",
			lineHeight: "19px",
			fontFamily: "sans-serif",
			fontFeatureSettings: '"lnum", "tnum"',
			color: "rgb(107 114 128)",
			backgroundColor: "rgb(248 250 252)",
			borderColor: "rgb(226 232 240)",
		},
		".cm-line": {
			fontFamily: "sans-serif",
			fontFeatureSettings: '"lnum", "tnum"',
			lineHeight: "19px",
		},
		".cm-specialChar": {
			color: "#ba4",
		},
		".cm-charType-control": {
			display: "inline-block",
			verticalAlign: "middle",
			margin: "0 0.0625em",
			padding: "0.125em 0.0625em",
			fontFamily: "monospace",
			fontSize: "75%",
			lineHeight: "1",
			border: "1px dotted",
		},
		".cm-charType-fullwidth": {
			fontFamily: '"ヒラギノ角ゴシック", "ヒラギノ角ゴ ProN", sans-serif',
		},
		".cm-charType-private": {
			display: "inline-block",
			verticalAlign: "middle",
			boxSizing: "content-box",
			width: "1em",
			margin: "0 0.0625em",
			padding: "0.125em",
			textAlign: "center",
			fontFamily: "monospace",
			fontSize: "75%",
			lineHeight: "1",
			border: "1px dotted",
			color: "#d6a",
		},
	}}
/>
