<script>
import SimpleToolLayout from "$components/SimpleToolLayout.svelte";
import { convert, converters } from "./unitConverter";

/** @type {import("./unitConverter").ConverterDef} */
const defaultConverter = converters[0];
let converter = $state(defaultConverter);

// 初期単位を安全に設定
const initialUnits = {
	from: defaultConverter.units[0],
	to: defaultConverter.units[1] ?? defaultConverter.units[0],
};

let fromUnit = $state(initialUnits.from);
let toUnit = $state(initialUnits.to);
let fromValue = $state("1");
let toValue = $state();

$effect(() => {
	toValue = convert(fromValue, fromUnit, toUnit);
});
</script>

<svelte:head>
	<title>単位換算</title>
</svelte:head>

<SimpleToolLayout title="単位換算">
	{#snippet description()}
		<p class="mt-2">木場潟は兼六園何個分？ さまざまな単位を変換します</p>
	{/snippet}

	<div class="max-w-lg">
		<select
			bind:value={converter}
			class="w-full bg-slate-50 rounded border px-3 py-2"
			onchange={() => {
				fromUnit = converter.units[0];
				toUnit = converter.units[1] ?? converter.units[0];
			}}
		>
			{#each converters as iConv}
				<option
					value={iConv}
					selected={iConv.classification === converter.classification}
				>
					{iConv.classification}
				</option>
			{/each}
		</select>

		{#if converter}
			<div class="mt-4 flex">
				<div class="flex-1">
					<input
						type="number"
						class="w-full bg-slate-50 rounded-t border px-3 py-2 text-xl text-center"
						bind:value={fromValue}
						oninput={() => {
							toValue = convert(fromValue, fromUnit, toUnit);
						}}
					/>
					<select
						class="w-full bg-slate-50 rounded-b border border-t-0 px-3 py-2 text-center"
						bind:value={fromUnit}
						onchange={() => {
							toValue = convert(fromValue, fromUnit, toUnit);
						}}
					>
						{#each converter.units as iUnit}
							<option value={iUnit}>{iUnit.name}</option>
						{/each}
					</select>
				</div>
				<div class="px-2 py-2 text-xl">=</div>
				<div class="flex-1">
					<input
						type="number"
						class="w-full bg-slate-50 rounded-t border px-3 py-2 text-xl text-center"
						bind:value={toValue}
						oninput={() => {
							fromValue = convert(toValue, toUnit, fromUnit);
						}}
					/>
					<select
						class="w-full bg-slate-50 rounded-b border border-t-0 px-3 py-2 text-center"
						bind:value={toUnit}
						onchange={() => {
							toValue = convert(fromValue, fromUnit, toUnit);
						}}
					>
						{#each converter.units as iUnit}
							<option value={iUnit}>{iUnit.name}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}
	</div>
</SimpleToolLayout>
