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
		icon: '',
		title: 'QRコード',
		route: '/qr',
		disabled: true,
	},
	{
		icon: '',
		title: '組版用に整形',
		route: '/typesetting',
		disabled: true,
	},
	{
		icon: '',
		title: 'Tap BPM',
		route: '/tap-bpm',
		disabled: true,
	},
	{
		icon: '',
		title: '日付',
		route: '/date',
		disabled: true,
	},
]

export async function load () {
	return {
		tools,
	}
}
