<script>
	import { converters, convert } from "./unitConverter";
	import SimpleToolLayout from "../../components/SimpleToolLayout.svelte";

	let converter = converters[0];
	let fromUnit = converter?.units[0];
	let toUnit = converter?.units[1] ?? converter?.units[0];
	let fromValue = "1";
	let toValue = convert(fromValue, fromUnit, toUnit);
</script>

<svelte:head>
	<title>単位換算</title>
</svelte:head>

<SimpleToolLayout title="単位換算">
	<svelte:fragment slot="description">
		<p class="mt-2">木場潟は兼六園何個分？ さまざまな単位を変換します</p>
	</svelte:fragment>

	<div class="max-w-lg">
		<select
			bind:value={converter}
			class="w-full bg-slate-50 rounded border px-3 py-2"
			on:change={() => {
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
						on:input={() => {
							toValue = convert(fromValue, fromUnit, toUnit);
						}}
					/>
					<select
						class="w-full bg-slate-50 rounded-b border border-t-0 px-3 py-2 text-center"
						bind:value={fromUnit}
						on:change={() => {
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
						on:input={() => {
							fromValue = convert(toValue, toUnit, fromUnit);
						}}
					/>
					<select
						class="w-full bg-slate-50 rounded-b border border-t-0 px-3 py-2 text-center"
						bind:value={toUnit}
						on:change={() => {
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
