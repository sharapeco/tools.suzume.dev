/**
 * @typedef {Object} BpmStats
 * @property {string} bpm 1分あたりの拍数
 * @property {string} bps 1秒あたりの拍数
 * @property {string} msec 1拍の長さ（ミリ秒）
 */

/**
 * タップした間隔からテンポを求める
 *
 * @param {number} count 最初のタップから数えた拍数
 * @param {number} elapsed 最初のタップからの経過時間（ミリ秒）
 * @returns {BpmStats}
 */
export function calcBpm(count, elapsed) {
	const bpmValue = (count / elapsed) * 60000;
	return {
		bpm: bpmValue.toFixed(1),
		bps: (bpmValue / 60).toFixed(2),
		msec: (60000 / bpmValue).toFixed(1),
	};
}
