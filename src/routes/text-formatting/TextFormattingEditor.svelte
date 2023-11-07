<script>
	import { createEventDispatcher } from "svelte";
	import CodeMirror from "svelte-codemirror-editor";
	import { specialCharsHighlighter } from "./specialCharsHighlighter";
	import { plainTextKeymap } from "./plainTextKeymap";
	import { textLinter } from "./linter";

	/** @type {string} */
	export let input;

	const dispatch = createEventDispatcher();

	const extensions = [plainTextKeymap, specialCharsHighlighter, textLinter];
</script>

<CodeMirror
	bind:value={input}
	on:change={(event) => {
		dispatch("change", event.detail);
	}}
	useTab={false}
	tabSize={4}
	{extensions}
	styles={{
		"&": {
			flexGrow: 1,
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
		".cm-content": {
			fontFamily: '"ヒラギノ角ゴシック", "ヒラギノ角ゴ ProN", "Segoe UI", sans-serif',
			fontFeatureSettings: '"lnum", "tnum"',
		},
		".cm-line": {
			lineHeight: "19px",
		},
		".cm-lintRange": {
			paddingBottom: "3px",
		},
		".cm-specialChar": {
			color: "#ba4",
		},
		".cm-charType-fullwidth": {
			fontFamily: '"ヒラギノ角ゴシック", "ヒラギノ角ゴ ProN", sans-serif',
		},
		".cm-charType-kangxi": {
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
	}}
/>
