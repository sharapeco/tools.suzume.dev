/**
 * @typedef {Object} Tool
 * @property {string} icon
 * @property {string} title
 * @property {string} route
 * @property {string} description
 * @property {boolean} [disabled]
 */

/** @type {Tool[]} */
export const tools = [
	{
		icon: "U+",
		title: "Unicode文字情報",
		route: "/unicode",
		description: "文字のUnicode符号位置と文字の詳細について調べるツールです",
		disabled: false,
	},
	{
		icon: "Aa",
		title: "文字種変換",
		route: "/character-form",
		description:
			"ひらがな、カタカナ、全角形など、さまざまな文字種の変換を行います",
		disabled: false,
	},
	{
		icon: "01",
		title: "エンコード・デコード",
		route: "/encode",
		description:
			"URL encode、Base64 など、さまざまな形式のエンコード・デコードを行います",
		disabled: false,
	},
	{
		icon: '<svg viewBox="64 64 896 896" focusable="false" data-icon="qrcode" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M468 128H160c-17.7 0-32 14.3-32 32v308c0 4.4 3.6 8 8 8h332c4.4 0 8-3.6 8-8V136c0-4.4-3.6-8-8-8zm-56 284H192V192h220v220zm-138-74h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm194 210H136c-4.4 0-8 3.6-8 8v308c0 17.7 14.3 32 32 32h308c4.4 0 8-3.6 8-8V556c0-4.4-3.6-8-8-8zm-56 284H192V612h220v220zm-138-74h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm590-630H556c-4.4 0-8 3.6-8 8v332c0 4.4 3.6 8 8 8h332c4.4 0 8-3.6 8-8V160c0-17.7-14.3-32-32-32zm-32 284H612V192h220v220zm-138-74h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm194 210h-48c-4.4 0-8 3.6-8 8v134h-78V556c0-4.4-3.6-8-8-8H556c-4.4 0-8 3.6-8 8v332c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V644h78v102c0 4.4 3.6 8 8 8h190c4.4 0 8-3.6 8-8V556c0-4.4-3.6-8-8-8zM746 832h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm142 0h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z"></path></svg>',
		title: "QRコード生成",
		route: "/qr",
		description:
			"4種のエラー訂正レベルのQRコードを生成し、SVG形式でダウンロードできます",
		disabled: false,
	},
	{
		icon: '<svg width="1em" height="1em" viewBox="0 0 100 100" version="1.1" focusable="false" data-icon="round-rect" aria-hidden="true"><g transform="matrix(0.913545,-0.406737,0.406737,0.913545,-21.3234,34.082)"><path d="M46,10L74,10C103.25,10 110,16.75 110,46L110,74C110,103.25 103.25,110 74,110L46,110C16.75,110 10,103.25 10,74L10,46C10,16.75 16.75,10 46,10" fill="currentColor"/></g></svg>',
		title: "角丸図形",
		route: "/squircle",
		description: "角丸図形を生成します",
		disabled: false,
	},
	{
		icon: "組",
		title: "テキスト整形",
		route: "/text-formatting",
		description: "DTPやWebページ向けのテキスト整形を行います",
		disabled: false,
	},
	{
		icon: "漢",
		title: "常用漢字チェッカー",
		route: "/joyo-kanji",
		description: "常用漢字でない漢字、人名用漢字、教育漢字の配当学年を調べます",
		disabled: false,
	},
	{
		icon: "⇄",
		title: "単位換算",
		route: "/unit-converter",
		description: "木場潟は兼六園何個分？ さまざまな単位を変換します",
		disabled: false,
	},
	{
		icon: '<svg width="1em" height="1em" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17"><path d="M2.994 2.995V.964h.508V1.98h.507v2.03h.508v2.031h.508V1.963h.507V.97h.508V-.046h2.538V.97h.508v.993h.508v7.129h-.508v1.015h.508v1.015h1.015v2.031h.507v3.046H6.548v-1.015H6.04v-1.016h-.508v-1.015h-.507v-2.031h-.508v-1.015h.508v-2.03h-.508V7.056h-.508v-2.03h-.507V2.995zm2.031 10.158v2.031l.505-.012.005 1.016-.51.011-.502.011v-.011H3.502v-3.046h.507v-2.031h.508v2.031zm.507-9.16v3.068h3.554V3.993zm3.046.754v1.539h-.507V4.747zm-2.03 0v1.539H6.04V4.747z" style="fill:#fff" transform="matrix(1.96989 0 0 .98494 -5.898 1.045)"/></svg>',
		title: "画像中画像",
		route: "/stegano-image",
		description: "画像に画像を隠します",
	},
	{
		icon: '<svg width="1em" height="1em" viewBox="0 0 96 96" fill="currentColor" aria-hidden="true"><path d="M36.026,2.507l-6.314,-0l-0,52.3c-0.99,-0.849 -3.474,-1.885 -7.552,-1.885c-10.196,0 -22.16,8.027 -22.16,19.799c0,7.893 5.438,11.772 13.595,11.772c11.148,0 22.431,-9.23 22.431,-21.538l0,-60.448Z"/><path d="M96,63.182l-39.636,-0l0,6.342l39.636,-0l0,-6.342Zm0,-20.932l-39.636,0l0,6.342l39.636,0l0,-6.342Z"/></svg>',
		title: "BPM計測",
		route: "/tap-bpm",
		description:
			"キーボード、ポインティングデバイス、タッチ操作でBPMを計測します",
		disabled: false,
	},
	{
		icon: "",
		title: "日付",
		route: "/date",
		description: "日付用のツールを考え中…💭",
		disabled: true,
	},
];
