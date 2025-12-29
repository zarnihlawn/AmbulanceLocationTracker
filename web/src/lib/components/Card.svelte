<script lang="ts">
	let { title, className = '', children } = $props<{
		title?: string;
		className?: string;
		children?: import('svelte').Snippet;
	}>();
</script>

<div class="d-card d-card-bordered bg-base-100 shadow-xl {className}">
	{#if title}
		<div class="d-card-body">
			<h2 class="d-card-title">{title}</h2>
		</div>
	{/if}
	<div class="d-card-body">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

