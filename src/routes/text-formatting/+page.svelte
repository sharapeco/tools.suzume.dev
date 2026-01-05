<script>
import ToggleSegment from "$components/ToggleSegment.svelte";
import { restoreFromStorage, saveToStorage } from "$lib/storage";
import { formatRules } from "./formatRules";
import TextFormattingCopy from "./TextFormattingCopy.svelte";
import TextFormattingEditor from "./TextFormattingEditor.svelte";

// プリレンダリングを無効にすることで500エラー回避
export const prerender = false;

let input = $state(restoreFromStorage("text-formatting.input", ""));

/** @type {"edit" | "copy"} */
let mode = $state("edit");

const modeItems = [
	{ value: "edit", label: "入力" },
	{ value: "copy", label: "結果をコピー" },
];

/** @type {{ [key: string]: string }} */
let options = $state(restoreOptions());

function restoreOptions() {
	let savedOptions = {};
	try {
		savedOptions = JSON.parse(
			restoreFromStorage("text-formatting.options", "{}"),
		);
	} catch (e) {
		console.error("Failed to restore options:", e);
	}
	return (formatRules ?? []).reduce((options, rule) => {
		// @ts-expect-error
		options[rule.id] = savedOptions[rule.id] ?? rule.default;
		return options;
	}, {});
}

$effect(() => {
	saveToStorage("text-formatting.input", input);
});

$effect(() => {
	saveToStorage("text-formatting.options", JSON.stringify(options));
});

function format() {
	let value = input;
	for (const rule of formatRules) {
		const option = options[rule.id];
		value = rule.fn(value, option);
	}
	input = value;
}
</script>

<svelte:head>
	<title>テキスト整形</title>
	<meta name="description" content="DTPやWebページ向けのテキスト整形を行います" />
</svelte:head>

<main class="pt-2 pb-4 flex-1 flex flex-col">
	<header class="mb-4 sm:flex sm:items-baseline">
		<h1 class="text-gray-800 text-3xl leading-7 font-bold">テキスト整形</h1>
		<p class="mt-4 ml-3 hidden md:block text-gray-500">
			DTPやWebページ向けのテキスト整形を行います
		</p>
	</header>

	<div class="flex justify-end -mt-12 mb-4">
		<ToggleSegment
			title={null}
			items={modeItems}
			value={mode}
			on:change={(event) => {
				const next = event.detail;
				if (next === "copy") {
					format();
				}
				mode = next;
			}}
		/>
	</div>

	<div class="border border-slate-200 rounded-lg flex h-[calc(100vh-200px)]">
		<div class="flex-1 flex flex-col">
			{#if mode === "edit"}
				<TextFormattingEditor
					bind:input={input}
				/>
			{:else}
				<TextFormattingCopy {input} />
			{/if}
		</div>
		<div class="w-64 border-l border-slate-200 bg-slate-50 flex flex-col">
			<div class="flex-1 p-4 h-full overflow-auto">
				{#each formatRules as rule (rule.id)}
					<div class="mb-3">
						<label for={rule.id} class="text-xs font-bold text-gray-600"
							>{rule.name}</label
						>
						<select
							id={rule.id}
							bind:value={options[rule.id]}
							class="w-full mt-1 px-2 py-1 rounded border border-slate-200 bg-white text-gray-900 text-sm"
						>
							{#each Object.entries(rule.options) as [key, label] (key)}
								<option value={key}>
									{label}
								</option>
							{/each}
						</select>
					</div>
				{/each}
			</div>
			<div class="p-4">
				<button
					type="button"
					class="w-full px-4 py-2 text-sm font-medium border rounded-md shadow-sm bg-indigo-500 text-white hover:bg-indigo-600 hover:text-white active:bg-indigo-800 active:text-slate-100"
					onclick={format}
				>
					整形
				</button>
			</div>
		</div>
	</div>
</main>
