<script lang="ts">
	let {
		type = 'text',
		placeholder = '',
		label = '',
		error = '',
		value = $bindable(''),
		required = false,
		disabled = false,
		id,
		name,
		className = '',
		onChange
	} = $props<{
		type?: string;
		placeholder?: string;
		label?: string;
		error?: string;
		value?: string;
		required?: boolean;
		disabled?: boolean;
		id?: string;
		name?: string;
		className?: string;
		onChange?: (value: string) => void;
	}>();

	let inputClasses = $derived.by(() => {
		const classes = ['d-input', 'd-input-bordered', 'w-full'];
		if (error) classes.push('d-input-error');
		if (className) classes.push(className);
		return classes.filter(Boolean).join(' ');
	});
</script>

<div class="form-control w-full">
	{#if label}
		<label class="label" for={id || name}>
			<span class="label-text">{label}</span>
			{#if required}
				<span class="label-text-alt text-error">*</span>
			{/if}
		</label>
	{/if}
	<input
		type={type}
		id={id || name}
		name={name}
		placeholder={placeholder}
		bind:value
		required={required}
		disabled={disabled}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id || name}-error` : undefined}
		oninput={(e) => {
			if (onChange) {
				onChange((e.target as HTMLInputElement).value);
			}
		}}
		class={inputClasses}
	/>
	{#if error}
		<div class="label" id={id || name ? `${id || name}-error` : undefined}>
			<span class="label-text-alt text-error">{error}</span>
		</div>
	{/if}
</div>

