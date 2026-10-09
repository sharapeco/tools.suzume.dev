import { describe, expect, it } from "vitest";
import { calcBpm } from "./bpm";

describe("calcBpm", () => {
	it("0.5秒間隔なら 120 BPM", () => {
		expect(calcBpm(4, 2000)).toEqual({
			bpm: "120.0",
			bps: "2.00",
			msec: "500.0",
		});
	});

	it("小数点以下を丸める", () => {
		expect(calcBpm(3, 1000)).toEqual({
			bpm: "180.0",
			bps: "3.00",
			msec: "333.3",
		});
	});
});
