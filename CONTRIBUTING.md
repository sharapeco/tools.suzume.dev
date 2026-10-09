# Contributing Guidelines

## 利ファクタリングのルール

1. Tailwindのクラスの重複を避ける
	1.同じクラスが3回以上出てきたら、src/componentsに新しくファイルを作って分離すること
	2. 条件分岐でクラスをガリガリ書くのは避けること。必要ならclsxを使って整理すること
	3. 不必要な @apply は禁止。基本はインラインで、どうしても再利用したいときだけコンポーネント化すること
2. SvelteKit特有のアーキテクチャ最適化
	1. $lib エイリアスを活用して深い相対パスでのimportを避けること
	2. コンポーネント中で onMount & fetch を避けること (+page.svelte の load 関数や Action に分離すること)
	3. Slotは避けてSnippetを活用すること
3. デザインシステム
	1. カラーコードを直接使用している箇所があればテーマカラーとして設定ファイルに追い出すこと
	2. フォントサイズ、マージン、パディングなどもデザインシステムに基づいて統一すること
4. ロジックの管理
	1. ロジックは `src/routes` やコンポーネントに書かず、`src/lib` に置くこと。ツール固有のロジックも同様。
	2. `src/lib` には環境に依存しない純粋なロジックだけを置くこと。`$app/*`、DOM、ブラウザ API（`navigator`、`localStorage` など）は使わない。
	3. 環境に依存する処理は、純粋な部分を `src/lib` に切り出したうえで、薄いラッパーを `src/utils`、Svelte Action を `src/actions` に置くこと。
	4. `src/lib` のモジュールには、同じディレクトリに `*.test.js` でテストを書くこと（`pnpm test`）。

## ディレクトリ構成

| ディレクトリ | エイリアス | 内容 |
| --- | --- | --- |
| `src/lib` | `$lib` | 純粋なロジック。ドメインごとにディレクトリを分ける（`text`, `encoding`, `qr`, `image`, `squircle`, `unit`, `text-formatting` など） |
| `src/utils` | `$utils` | ブラウザ環境に依存する処理（`platform`, `storage` など） |
| `src/actions` | `$actions` | Svelte Action |
| `src/components` | `$components` | 共通コンポーネント |
| `src/assets` | `$assets` | 画像などの静的アセット（import して使うもの） |
| `src/routes` | | ページと、そのページ専用のコンポーネント・UI のつなぎ（CodeMirror の拡張など） |
