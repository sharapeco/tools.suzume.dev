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
			{ name: "まるびぃ", value: 10028.7 },
			{ name: "兼六園", value: 114000 },
			{ name: "芝政ワールド", value: 560000 },
			{ name: "木場潟", value: 1140000 },
			{ name: "森林公園", value: 11500000 },
			{ name: "能登島", value: 47000000 },
			{ name: "金沢市", value: 468000000 },
			{ name: "石川県", value: 4185000000 },
			{ name: "m²", value: 1 },
			{ name: "ha", value: 10000 },
			{ name: "km²", value: 1000000 },
			{ name: "坪", value: 400 / 121 },
			{ name: "畝", value: (30 * 400) / 121 },
			{ name: "反", value: (10 * 30 * 400) / 121 },
			{ name: "町", value: (100 * 30 * 400) / 121 },
			{ name: "東京ドーム", value: 46755 },
			{ name: "甲子園球場", value: 38500 }
		]
	}
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
