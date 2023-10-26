const tools = [
	{
		title: 'Unicode文字情報',
		route: '/unicode',
		description: '文字のUnicodeコードポイントと文字の詳細について調べるツールです',
		disabled: false,
	},
	{
		title: 'エンコード・デコード',
		route: '/encode',
		description: 'URL encode, Base64 などさまざまな形式のエンコード・デコードを行います',
		disabled: true,
	},
	{
		title: 'QRコード',
		route: '/qr',
		disabled: true,
	},
	{
		title: '組版用に整形',
		route: '/typesetting',
		disabled: true,
	},
	{
		title: 'Tap BPM',
		route: '/tap-bpm',
		disabled: true,
	},
	{
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
