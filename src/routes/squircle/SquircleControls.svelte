<script>
import { inputBaseClass } from "$components/inputClasses.js";

let { params = $bindable() } = $props();
</script>

<div class="controls">
	<label class="text-gray-700 text-sm mb-1">
		種類
		<select class={inputBaseClass} bind:value={params.type}>
			<option value="clothoid">クロソイド</option>
			<option value="super-ellipse">スーパー楕円</option>
		</select>
	</label>

	<div class="flex gap-2">
		<label class="text-gray-700 text-sm mb-1 flex-1">
			単位
			<select
				class={inputBaseClass}
				bind:value={params.unit}
			>
				<option value="px">px</option>
				<option value="mm">mm</option>
				<option value="cm">cm</option>
				<option value="inch">inch</option>
			</select>
		</label>

		<label class="text-gray-700 text-sm mb-1 flex-1">
			解像度 (dpi)
			<input
				type="number"
				class={`${inputBaseClass} disabled:text-gray-400 disabled:bg-slate-100 dpi-input`}
				bind:value={params.dpi}
				min="1"
				max="1000"
				disabled={params.unit === "px"}
			/>
		</label>
	</div>

	<div class="flex gap-2">
		<label class="text-gray-700 text-sm mb-1 flex-1">
			幅
			<input
				type="number"
				class={inputBaseClass}
				bind:value={params.width}
				min="1"
				max="1000"
				step="0.01"
			/>
		</label>

		<label class="text-gray-700 text-sm mb-1 flex-1">
			高さ
			<input
				type="number"
				class={inputBaseClass}
				bind:value={params.height}
				min="1"
				max="1000"
				step="0.01"
			/>
		</label>
	</div>

	{#if params.type === "clothoid"}
		<label class="text-gray-700 text-sm mb-1">
			角の半径
			<input
				type="number"
				class={inputBaseClass}
				bind:value={params.radius}
				min="0"
				max="500"
				step="0.01"
			/>
		</label>
		<label class="text-gray-700 text-sm mb-1">
			角のオフセット比率
			<input
				type="number"
				class={inputBaseClass}
				bind:value={params.borderOffset}
				min="0"
				max="10"
				step="0.01"
			/>
		</label>
		<label class="text-gray-700 text-sm mb-1">
			クロソイドの緩和係数
			<input
				type="number"
				class={inputBaseClass}
				bind:value={params.tension}
				min="0.3"
				max="1.4"
				step="0.01"
			/>
		</label>
	{/if}

	{#if params.type === "super-ellipse"}
		<label class="text-gray-700 text-sm mb-1">
			指数
			<input
				type="number"
				class={inputBaseClass}
				bind:value={params.power}
				min="0"
				max="10"
				step="0.01"
			/>
		</label>
	{/if}

	<label class="text-gray-700 text-sm mb-1">
		色
		<input
			type="color"
			class={inputBaseClass}
			bind:value={params.color}
		/>
	</label>
</div>

<style>
	.controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	input[type="color"] {
		height: 48px;
	}

	.dpi-input:disabled {
		color: rgb(156 163 175 / var(--tw-text-opacity));
		background-color: rgb(248 250 252 / var(--tw-bg-opacity));
	}
</style>
