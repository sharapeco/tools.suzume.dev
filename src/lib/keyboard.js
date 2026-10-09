/**
 * Get key name from KeyboardEvent
 *
 * @param {KeyboardEvent} event
 * @return {string}
 */
export function getKey(event) {
	const modifier = [
		event.metaKey ? "meta" : "",
		event.ctrlKey ? "ctrl" : "",
		event.altKey ? "alt" : "",
		event.shiftKey ? "shift" : "",
	]
		.filter((m) => m !== "")
		.join("+");
	return modifier ? `${modifier}+${event.key}` : event.key;
}
