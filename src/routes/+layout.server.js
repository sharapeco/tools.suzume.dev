const tools = [
	{
		icon: 'U+',
		title: 'Unicode文字情報',
		route: '/unicode',
		description: '文字のUnicode符号位置と文字の詳細について調べるツールです',
		disabled: false,
	},
	{
		icon: 'Aa',
		title: '文字種変換',
		route: '/character-form',
		description: 'ひらがな、カタカナ、全角形など、さまざまな文字種の変換を行います',
		disabled: false,
	},
	{
		icon: '01',
		title: 'エンコード・デコード',
		route: '/encode',
		description: 'URL encode、Base64 など、さまざまな形式のエンコード・デコードを行います',
		disabled: false,
	},
	{
		icon: '<svg viewBox="64 64 896 896" focusable="false" data-icon="qrcode" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M468 128H160c-17.7 0-32 14.3-32 32v308c0 4.4 3.6 8 8 8h332c4.4 0 8-3.6 8-8V136c0-4.4-3.6-8-8-8zm-56 284H192V192h220v220zm-138-74h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm194 210H136c-4.4 0-8 3.6-8 8v308c0 17.7 14.3 32 32 32h308c4.4 0 8-3.6 8-8V556c0-4.4-3.6-8-8-8zm-56 284H192V612h220v220zm-138-74h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm590-630H556c-4.4 0-8 3.6-8 8v332c0 4.4 3.6 8 8 8h332c4.4 0 8-3.6 8-8V160c0-17.7-14.3-32-32-32zm-32 284H612V192h220v220zm-138-74h56c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm194 210h-48c-4.4 0-8 3.6-8 8v134h-78V556c0-4.4-3.6-8-8-8H556c-4.4 0-8 3.6-8 8v332c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V644h78v102c0 4.4 3.6 8 8 8h190c4.4 0 8-3.6 8-8V556c0-4.4-3.6-8-8-8zM746 832h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm142 0h-48c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z"></path></svg>',
		title: 'QRコード生成',
		route: '/qr',
		description: '4種のエラー訂正レベルのQRコードを生成し、SVG形式でダウンロードできます',
		disabled: false,
	},
	{
		icon: '組',
		title: 'テキスト整形',
		route: '/text-formatting',
		description: 'DTPやWebページ向けのテキスト整形を行います',
		disabled: true,
	},
	{
		icon: '<svg width="1em" height="1em" viewBox="0 0 96 96" fill="currentColor" aria-hidden="true"><path d="M36.026,2.507l-6.314,-0l-0,52.3c-0.99,-0.849 -3.474,-1.885 -7.552,-1.885c-10.196,0 -22.16,8.027 -22.16,19.799c0,7.893 5.438,11.772 13.595,11.772c11.148,0 22.431,-9.23 22.431,-21.538l0,-60.448Z"/><path d="M96,63.182l-39.636,-0l0,6.342l39.636,-0l0,-6.342Zm0,-20.932l-39.636,0l0,6.342l39.636,0l0,-6.342Z"/></svg>',
		title: 'Tap BPM',
		route: '/tap-bpm',
		description: 'キーボード、ポインティングデバイス、タッチ操作でBPMを計測します',
		disabled: true,
	},
	{
		icon: '',
		title: '日付',
		route: '/date',
		disabled: true,
	},
]

export async function load() {
	return {
		tools,
	}
}
