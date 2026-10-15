/**
 * ツールを選んで遷移してきたときに入力欄へフォーカスするかを判定する
 *
 * サイト内のリンクや goto で来たときだけフォーカスする。
 * 直接アクセス・リロード・戻る／進むで来たとき、タッチ端末ではフォーカスしない。
 *
 * @param {{ from: unknown, type: string }} navigation
 * @param {boolean} pointerFine ポインタが精密な環境か
 * @return {boolean}
 */
export function shouldFocusOnToolSelect(navigation, pointerFine) {
	if (!pointerFine || !navigation.from) {
		return false;
	}
	return navigation.type === "link" || navigation.type === "goto";
}
