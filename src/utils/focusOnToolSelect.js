import { afterNavigate } from "$app/navigation";
import { shouldFocusOnToolSelect } from "$lib/toolSelectFocus";

/**
 * サイト内でツールを選んで遷移してきたときだけ、入力欄にフォーカスする。
 * コンポーネントの初期化中に呼ぶこと。
 *
 * afterNavigate は SvelteKit がフォーカスをリセットした後に呼ばれるため、
 * ここでフォーカスすれば上書きされない。
 *
 * @param {() => { focus: () => void } | null | undefined} getTarget
 */
export function focusOnToolSelect(getTarget) {
	afterNavigate((navigation) => {
		const pointerFine = matchMedia("(pointer: fine)").matches;
		if (shouldFocusOnToolSelect(navigation, pointerFine)) {
			getTarget()?.focus();
		}
	});
}
