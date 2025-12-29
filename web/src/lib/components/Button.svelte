<script lang="ts">
	let {
		type = 'button',
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		wide = false,
		block = false,
		className = '',
		onClick,
		children
	} = $props<{
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		loading?: boolean;
		disabled?: boolean;
		wide?: boolean;
		block?: boolean;
		className?: string;
		onClick?: () => void;
		children?: import('svelte').Snippet;
	}>();

	let buttonClasses = $derived.by(() => {
		const classes = ['d-btn', `d-btn-${variant}`, `d-btn-${size}`];
		if (wide) classes.push('d-btn-wide');
		if (block) classes.push('d-btn-block');
		if (className) classes.push(className);
		return classes.filter(Boolean).join(' ');
	});
</script>

<button
	type={type}
	disabled={disabled || loading}
	onclick={onClick}
	class={buttonClasses}
	aria-busy={loading}
	aria-disabled={disabled || loading}
>
	{#if loading}
		<span class="d-loading d-loading-spinner d-loading-sm" aria-hidden="true"></span>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>

