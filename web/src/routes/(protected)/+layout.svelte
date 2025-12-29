<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { isAuthenticated } from '$lib/utils/auth';

	let { children } = $props();
	const auth = getAuthContext();
	let checking = $state(true);

	onMount(() => {
		// Refresh auth context first
		auth.refresh();
		
		// Check authentication
		if (!isAuthenticated() || !auth.user) {
			goto(resolve('/login'));
			return;
		}
		checking = false;
	});
</script>

{#if checking}
	<div class="min-h-screen flex items-center justify-center">
		<span class="d-loading d-loading-spinner d-loading-lg"></span>
	</div>
{:else if auth.user}
	{@render children()}
{/if}

