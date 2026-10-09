/**
 * @typedef {"CRLF" | "LF" | "CR"} Newline
 *
 * @typedef {object} PayloadProps
 * @property {string} mode
 * @property {string} input
 * @property {{ to: string, subject: string, body: string }} mailto
 * @property {{ ssid: string, password: string }} ssid
 * @property {Newline} newline
 */

const newlinesMap = {
	CRLF: "\r\n",
	LF: "\n",
	CR: "\r",
};

/**
 * QRコードにする文字列を組み立てる
 *
 * @param {PayloadProps} props
 * @returns {string} 必要な入力が足りない場合は空文字列
 */
export function buildPayload(props) {
	const { mode, input, mailto, ssid, newline } = props;
	switch (mode) {
		case "string":
			return convertNewline(input, newline);
		case "mailto":
			if (mailto.to === "") {
				return "";
			}
			if (mailto.subject === "" && mailto.body === "") {
				return `mailto:${mailto.to}`;
			}
			return `mailto:${mailto.to}?subject=${mailto.subject}&body=${mailto.body.replace(/\r\n|\r|\n/g, "\r\n")}`;
		case "ssid":
			if (ssid.ssid === "" || ssid.password === "") {
				return "";
			}
			return `WIFI:T:WPA;S:${ssid.ssid};P:${ssid.password};;`;
		default:
			return "";
	}
}

/**
 * @param {string} input 入力文字列
 * @param {Newline} newline 改行コード
 * @returns {string} 改行コードを変換した文字列
 */
export function convertNewline(input, newline) {
	return input.replace(/\r\n|\r|\n/g, newlinesMap[newline]);
}
