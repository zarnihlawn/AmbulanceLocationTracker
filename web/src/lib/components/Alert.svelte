<script lang="ts">
	let { type = 'info', message, className = '' } = $props<{
		type?: 'info' | 'success' | 'warning' | 'error';
		message: string;
		className?: string;
	}>();

	let alertClasses = $derived.by(() => {
		const classes = ['d-alert', `d-alert-${type}`];
		if (className) classes.push(className);
		return classes.filter(Boolean).join(' ');
	});
</script>

<div role="alert" class={alertClasses}>
	<span>{message}</span>
</div>

