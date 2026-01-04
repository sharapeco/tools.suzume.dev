# リファクタリング計画書

## 1. 概要
本ドキュメントは、`CONTRIBUTING.md` に記載されたガイドラインに基づき、既存コードのリファクタリング計画をまとめたものである。

## 2. 現状分析

### 2.1. Tailwindクラスの重複
- **入力欄・コンテナ**: `w-full bg-slate-50 rounded border px-3 py-2` というクラスの組み合わせが、`unit-converter`, `joyo-kanji`, `qr`, `encode`, `squircle`, `character-form`, `unicode` など多数のページで20回以上使用されている。
- **ボタン**: `bg-indigo-600` などのボタンスタイルも散見される。

### 2.2. SvelteKitアーキテクチャ
- **相対パス import**: `../../components/SimpleToolLayout.svelte` や `../../lib/kanji` など、深い階層からの相対パス import が多数存在する。
- **Slot**: `src/components/dropzone/Dropzone.svelte` で `<slot>` が使用されている。

### 2.3. デザインシステム
- **ハードコードされた色**:
    - `Dropzone.svelte`: `#e5e7eb`, `#9ca3af`
    - `tap-bpm/+page.svelte`: `#2d3748`, `#f7fafc`, `#e2e8f0`
    - `joyo-kanji/+page.svelte`: `#dfd`, `#fc0`, `#faa`, `#4af` など、ステータス表示用の色が直接指定されている。

## 3. 実施計画

### Phase 1: SvelteKitアーキテクチャ最適化
まずはコードの構造を整理し、可読性とメンテナンス性を向上させる。

1.  **$lib エイリアスの適用**:
    - `src/routes` 配下のファイルにある `../` や `../../` で始まる import を `$lib` や `$components` (必要ならエイリアス追加) に置き換える。
2.  **Slot から Snippet への移行**:
    - `src/components/dropzone/Dropzone.svelte` の `<slot>` を Svelte 5 の Snippet に書き換える（もしSvelte 5を使用している場合。package.json確認要）。
    - ※ Svelte 4の場合はSlotのままでも良いが、Snippetが使えるなら移行する。

### Phase 2: Tailwind重複排除（コンポーネント化）
重複しているスタイルをコンポーネントとして切り出す。`@apply` は使用せず、Svelteコンポーネントとして再利用する。

1.  **共通コンテナコンポーネントの作成**:
    - `w-full bg-slate-50 rounded border px-3 py-2` を持つ `Card` または `InputWrapper` コンポーネントを作成する。
    - 各ページでの使用箇所を新コンポーネントに置き換える。

### Phase 3: デザインシステム適用
ハードコードされた色を Tailwind のクラスまたは設定ファイルに移動する。

1.  **カラーの抽出と定義**:
    - `joyo-kanji` などで使われている色を分析し、意味のある名前（例: `bg-status-added`, `text-status-removed`）で `tailwind.config.js` に定義するか、既存のTailwindカラー（`bg-green-100`など）に置き換える。
2.  **ハードコード箇所の修正**:
    - `style="background: #dfd;"` などを `class="bg-green-100"` などに書き換える。

### Phase 4: ロジックの分離 (onMount & fetch)
コンポーネント内のロジックを見直す。`CONTRIBUTING.md` の指示に従い、`+page.svelte` 内の `onMount` は原則として `load` 関数や Action に分離する。

1.  **onMount の分析と移行**:
    - 各 `onMount` が何をしているか確認する。
    - **データ取得**: `+page.js` または `+page.server.js` の `load` 関数へ移動する。
    - **DOM操作**: Svelte Action (`use:action`) へ移動する。
    - **ブラウザAPI依存**: どうしても必要な場合のみ残すが、可能な限りロジックを分離する。

## 4. 次のアクション
Phase 1 から順次実行する。
