/**
 * @typedef {Object} UnitDef
 * @property {string} name
 * @property {number} value
 *
 * @typedef {Object} ConverterDef
 * @property {string} classification
 * @property {UnitDef[]} units
 */

/**
 * @type {ConverterDef[]}
 */
export const converters = [
	{
		classification: "面積",
		units: [
			{ name: "まるびぃ", value: 10_028.7 },
			{ name: "兼六園", value: 114_000 },
			{ name: "芝政ワールド", value: 560_000 },
			{ name: "木場潟", value: 1_140_000 },
			{ name: "森林公園", value: 11_500_000 },
			{ name: "能登島", value: 47_000_000 },
			{ name: "金沢市", value: 468_000_000 },
			{ name: "石川県", value: 4_190_940_000 },
			{ name: "m²", value: 1 },
			{ name: "ha", value: 10_000 },
			{ name: "km²", value: 1_000_000 },
			{ name: "坪", value: 400 / 121 },
			{ name: "畝", value: (30 * 400) / 121 },
			{ name: "反", value: (10 * 30 * 400) / 121 },
			{ name: "町", value: (100 * 30 * 400) / 121 },
			{ name: "北海道", value: 83_457_000_000 },
			{ name: "東京ドーム", value: 46_755 },
			{ name: "甲子園球場", value: 38_500 },
		],
	},
];

/**
 * 単位を変換します
 *
 * @param {string} valueStr
 * @param {UnitDef} fromUnit
 * @param {UnitDef} toUnit
 */
export function convert(valueStr, fromUnit, toUnit) {
	const value = Number.parseFloat(valueStr);
	const convertedValue = (value * fromUnit.value) / toUnit.value;
	return convertedValue.toFixed(6).replace(/\.?0+$/, "");
}
