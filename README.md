# スズメツールズ

小ぶりで、チュンとしたツール。

## どのように始めたか

スズメツールズはフレームワークとしてSvelteKitとTailwind CSSを使って作られています。
以下に、SvelteKitとTailwind CSSを使用したプロジェクトの作成方法を示します。

### 1. プロジェクトの作成

SvelteKitのプロジェクトを作成するには、次のコマンドを実行します。

```bash
npm create svelte@latest tools.suzume.dev.
cd tools.suzume.dev.
```

このコマンドは次と等価です。

```bash
mkdir tools.suzume.dev.
cd tools.suzume.dev.
npm init svelte@latest
```

続いて、npmを使用して依存関係をインストールし、Gitのリポジトリを初期化します。

```bash
npm install
git init && git add -A && git commit -m 🐤
```

### 2. Tailwind CSSのインストール

Tailwind CSSをインストールするには、次のコマンドを実行します（→[Install Tailwind CSS with SvelteKit - Tailwind CSS](https://tailwindcss.com/docs/guides/sveltekit)）。

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. `<style>` ブロックでPostCSSを有効にする

`svelte.config.js` を編集し、`vitePreprocess` をプリプロセッサとして使用するよう設定します。

```js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';
/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter()
  },
  preprocess: vitePreprocess()
};
export default config;
```

### 4. テンプレートファイルのパスを設定

`tailwind.config.js` を編集し、Tailwind CSSを使用するテンプレートファイルのパスを設定します。

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  plugins: []
};
```

### 5. Tailwindを有効にする

`./src/app.css` を作成し、`@tailwind` ディレクティブを追加します。

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 6. SvelteテンプレートからTailwindを使用する

`./src/routes/+layout.svelte` を作成し、先ほど作成した `app.css` をインポートします。

```svelte
<script>
  import "../app.css";
</script>

<slot />
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
