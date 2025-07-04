<script>
import { fromEvent } from "file-selector";
import {
	fileAccepted,
	fileMatchSize,
	isEvtWithFiles,
	isIeOrEdge,
	isPropagationStopped,
	TOO_MANY_FILES_REJECTION,
} from "./utils/index";
import { onMount, onDestroy, createEventDispatcher } from "svelte";

//props
/**
 * Set accepted file types.
 * See https://github.com/okonet/attr-accept for more information.
 */
/**
 * @type {string | Array<string>}
 */
export let accept = undefined;
export let disabled = false;
export let getFilesFromEvent = fromEvent;
export let id = "";
export let maxSize = Number.POSITIVE_INFINITY;
export let minSize = 0;
export let multiple = true;
export let preventDropOnDocument = true;
export let noClick = false;
export let noKeyboard = false;
export let noDrag = false;
export let noDragEventsBubbling = false;
export let containerClasses = "";
export let containerStyles = "";
export let disableDefaultStyles = false;
export let name = "";
export let inputElement = undefined;
export let required = false;
const dispatch = createEventDispatcher();

//state

let state = {
	isFocused: false,
	isFileDialogActive: false,
	isDragActive: false,
	isDragAccept: false,
	isDragReject: false,
	draggedFiles: [],
	acceptedFiles: [],
	fileRejections: [],
};

let rootRef;

function resetState() {
	state.isFileDialogActive = false;
	state.isDragActive = false;
	state.draggedFiles = [];
	state.acceptedFiles = [];
	state.fileRejections = [];
}

// Fn for opening the file dialog programmatically
function openFileDialog() {
	if (inputElement) {
		inputElement.value = null; // TODO check if null needs to be set
		state.isFileDialogActive = true;
		inputElement.click();
	}
}

// Cb to open the file dialog when SPACE/ENTER occurs on the dropzone
function onKeyDownCb(event) {
	// Ignore keyboard events bubbling up the DOM tree
	if (!rootRef || !rootRef.isEqualNode(event.target)) {
		return;
	}

	if (event.keyCode === 32 || event.keyCode === 13) {
		event.preventDefault();
		openFileDialog();
	}
}

// Update focus state for the dropzone
function onFocusCb() {
	state.isFocused = true;
}
function onBlurCb() {
	state.isFocused = false;
}

// Cb to open the file dialog when click occurs on the dropzone
function onClickCb() {
	if (noClick) {
		return;
	}

	// In IE11/Edge the file-browser dialog is blocking, therefore, use setTimeout()
	// to ensure React can handle state changes
	// See: https://github.com/react-dropzone/react-dropzone/issues/450
	if (isIeOrEdge()) {
		setTimeout(openFileDialog, 0);
	} else {
		openFileDialog();
	}
}

function onDragEnterCb(event) {
	event.preventDefault();
	stopPropagation(event);

	dragTargetsRef = [...dragTargetsRef, event.target];

	if (isEvtWithFiles(event)) {
		Promise.resolve(getFilesFromEvent(event)).then((draggedFiles) => {
			if (isPropagationStopped(event) && !noDragEventsBubbling) {
				return;
			}

			state.draggedFiles = draggedFiles;
			state.isDragActive = true;

			dispatch("dragenter", {
				dragEvent: event,
			});
		});
	}
}

function onDragOverCb(event) {
	event.preventDefault();
	stopPropagation(event);

	if (event.dataTransfer) {
		try {
			event.dataTransfer.dropEffect = "copy";
		} catch {} /* eslint-disable-line no-empty */
	}

	if (isEvtWithFiles(event)) {
		dispatch("dragover", {
			dragEvent: event,
		});
	}

	return false;
}

function onDragLeaveCb(event) {
	event.preventDefault();
	stopPropagation(event);

	// Only deactivate once the dropzone and all children have been left
	const targets = dragTargetsRef.filter((target) => rootRef?.contains(target));
	// Make sure to remove a target present multiple times only once
	// (Firefox may fire dragenter/dragleave multiple times on the same element)
	const targetIdx = targets.indexOf(event.target);
	if (targetIdx !== -1) {
		targets.splice(targetIdx, 1);
	}
	dragTargetsRef = targets;
	if (targets.length > 0) {
		return;
	}

	state.isDragActive = false;
	state.draggedFiles = [];

	if (isEvtWithFiles(event)) {
		dispatch("dragleave", {
			dragEvent: event,
		});
	}
}

function onDropCb(event) {
	event.preventDefault();
	stopPropagation(event);

	dragTargetsRef = [];

	if (isEvtWithFiles(event)) {
		dispatch("filedropped", {
			event,
		});
		Promise.resolve(getFilesFromEvent(event)).then((files) => {
			if (isPropagationStopped(event) && !noDragEventsBubbling) {
				return;
			}

			const acceptedFiles = [];
			const fileRejections = [];

			files.forEach((file) => {
				const [accepted, acceptError] = fileAccepted(file, accept);
				const [sizeMatch, sizeError] = fileMatchSize(file, minSize, maxSize);
				if (accepted && sizeMatch) {
					acceptedFiles.push(file);
				} else {
					const errors = [acceptError, sizeError].filter((e) => e);
					fileRejections.push({ file, errors });
				}
			});

			if (!multiple && acceptedFiles.length > 1) {
				// Reject everything and empty accepted files
				acceptedFiles.forEach((file) => {
					fileRejections.push({
						file,
						errors: [TOO_MANY_FILES_REJECTION],
					});
				});
				acceptedFiles.splice(0);
			}

			// Files dropped keep input in sync
			if (event.dataTransfer) {
				inputElement.files = event.dataTransfer.files;
			}

			state.acceptedFiles = acceptedFiles;
			state.fileRejections = fileRejections;

			dispatch("drop", {
				acceptedFiles,
				fileRejections,
				event,
			});

			if (fileRejections.length > 0) {
				dispatch("droprejected", {
					fileRejections,
					event,
				});
			}

			if (acceptedFiles.length > 0) {
				dispatch("dropaccepted", {
					acceptedFiles,
					event,
				});
			}
		});
	}
	resetState();
}

$: composeHandler = (fn) => (disabled ? null : fn);

$: composeKeyboardHandler = (fn) => (noKeyboard ? null : composeHandler(fn));

$: composeDragHandler = (fn) => (noDrag ? null : composeHandler(fn));

$: defaultPlaceholderString = multiple
	? "Drag 'n' drop some files here, or click to select files"
	: "Drag 'n' drop a file here, or click to select a file";

function stopPropagation(event) {
	if (noDragEventsBubbling) {
		event.stopPropagation();
	}
}

// allow the entire document to be a drag target
function onDocumentDragOver(event) {
	if (preventDropOnDocument) {
		event.preventDefault();
	}
}

let dragTargetsRef = [];
function onDocumentDrop(event) {
	if (!preventDropOnDocument) {
		return;
	}
	if (rootRef?.contains(event.target)) {
		// If we intercepted an event for our instance, let it propagate down to the instance's onDrop handler
		return;
	}
	event.preventDefault();
	dragTargetsRef = [];
}

// Update file dialog active state when the window is focused on
function onWindowFocus() {
	// Execute the timeout only if the file dialog is opened in the browser
	if (state.isFileDialogActive) {
		setTimeout(() => {
			if (inputElement) {
				const { files } = inputElement;

				if (!files.length) {
					state.isFileDialogActive = false;
					dispatch("filedialogcancel");
				}
			}
		}, 300);
	}
}

onDestroy(() => {
	// This is critical for canceling the timeout behaviour on `onWindowFocus()`
	inputElement = null;
});

function onInputElementClick(event) {
	event.stopPropagation();
}
</script>

<svelte:window on:focus={onWindowFocus} on:dragover={onDocumentDragOver} on:drop={onDocumentDrop} />

<div
	bind:this={rootRef}
	tabindex="0"
	role="button"
	class="{disableDefaultStyles ? '' : 'dropzone'}
	{containerClasses}"
	style={containerStyles}
	on:keydown={composeKeyboardHandler(onKeyDownCb)}
	on:focus={composeKeyboardHandler(onFocusCb)}
	on:blur={composeKeyboardHandler(onBlurCb)}
	on:click={composeHandler(onClickCb)}
	on:dragenter={composeDragHandler(onDragEnterCb)}
	on:dragover={composeDragHandler(onDragOverCb)}
	on:dragleave={composeDragHandler(onDragLeaveCb)}
	on:drop={composeDragHandler(onDropCb)}
	{...$$restProps}
>
	<input
		accept={accept?.toString()}
		{multiple}
		{required}
		type="file"
		{name}
		{id}
		autocomplete="off"
		tabindex="-1"
		on:change={onDropCb}
		on:click={onInputElementClick}
		bind:this={inputElement}
		style="display: none;"
	/>
	<slot>
		<p>{defaultPlaceholderString}</p>
	</slot>
</div>

<style>
	.dropzone {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		font-size: 87.5%;
		border-width: 2px;
		border-radius: 2px;
		border-color: #e5e7eb;
		border-style: dashed;
		background-color: rgb(248 250 252);
		color: #9ca3af;
		outline: none;
		transition: border 0.24s ease-in-out;
	}
	.dropzone:focus {
		border-color: rgb(79 70 229);
	}
</style>
