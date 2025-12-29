<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { logoutUser } from '$lib/utils/api';
	import { getAuthContext } from '$lib/stores/auth.svelte';

	const props = $props<{ active?: 'home' | 'organization' | 'settings' }>();
	const active = props.active ?? 'home';

	const auth = getAuthContext();
	let logoutLoading = $state(false);

	async function handleLogout() {
		logoutLoading = true;
		try {
			await logoutUser();
			auth.refresh();
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new Event('auth-changed'));
			}
			goto(resolve('/login'));
		} finally {
			logoutLoading = false;
		}
	}

	function goDashboardHome() {
		goto(resolve('/dashboard/home'));
	}

	function goWorkspace() {
		goto(resolve('/dashboard/organization'));
	}

	function goSettings() {
		goto(resolve('/dashboard/settings'));
	}
</script>

<aside class="w-64 bg-base-100 border-r border-base-300 hidden md:block">
	<div class="h-full flex flex-col">
		<div class="px-4 py-6 border-b border-base-300">
			<h2 class="text-lg font-bold">Dashboard</h2>
			<p class="text-xs text-base-content/60 mt-1">Navigation</p>
		</div>
		<nav class="flex-1 px-2 py-4 space-y-1">
			<button
				type="button"
				class={[
					'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left',
					active === 'home'
						? 'bg-primary/10 text-primary hover:bg-primary/20'
						: 'text-base-content/80 hover:bg-base-200'
				]}
				onclick={goDashboardHome}
			>
				<span>Home</span>
			</button>
			<button
				type="button"
				class={[
					'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left',
					active === 'organization'
						? 'bg-primary/10 text-primary hover:bg-primary/20'
						: 'text-base-content/80 hover:bg-base-200'
				]}
				onclick={goWorkspace}
			>
				<span>Organization</span>
			</button>
			<button
				type="button"
				class={[
					'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left',
					active === 'settings'
						? 'bg-primary/10 text-primary hover:bg-primary/20'
						: 'text-base-content/80 hover:bg-base-200'
				]}
				onclick={goSettings}
			>
				<span>Settings</span>
			</button>
		</nav>
		<div class="px-4 py-4 border-t border-base-300">
			<button
				type="button"
				class="d-btn d-btn-ghost d-btn-block justify-center"
				onclick={handleLogout}
				disabled={logoutLoading}
			>
				{#if logoutLoading}
					<span class="d-loading d-loading-spinner d-loading-xs" aria-hidden="true"></span>
				{/if}
				<span>Logout</span>
			</button>
		</div>
	</div>
</aside>


