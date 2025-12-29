<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { logoutUser } from '$lib/utils/api';
	import { APP_NAME } from '$lib/config/app';
	import Button from './Button.svelte';

	let auth = $state<ReturnType<typeof getAuthContext> | null>(null);
	
	try {
		auth = getAuthContext();
	} catch {
		auth = null;
	}

	// Listen for auth changes to update navbar
	onMount(() => {
		function handleAuthChange() {
			if (auth) {
				auth.refresh();
			}
		}

		window.addEventListener('auth-changed', handleAuthChange);
		window.addEventListener('storage', handleAuthChange);
		
		return () => {
			window.removeEventListener('auth-changed', handleAuthChange);
			window.removeEventListener('storage', handleAuthChange);
		};
	});

	let logoutLoading = $state(false);

	async function handleLogout() {
		logoutLoading = true;
		try {
			await logoutUser();
			if (auth) {
				auth.refresh();
			}
			// Dispatch event to notify other components
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new Event('auth-changed'));
			}
			// Navigate to home page after logout
			goto(resolve('/'));
		} catch (error) {
			console.error('Logout error:', error);
			// Still refresh auth context even if logout fails
			if (auth) {
				auth.refresh();
			}
		} finally {
			logoutLoading = false;
		}
	}

	function goToLogin() {
		goto(resolve('/login'));
	}

	function goToRegister() {
		goto(resolve('/register'));
	}

	function goToDashboard() {
		goto(resolve('/dashboard'));
	}
</script>

<div class="d-navbar bg-base-100 shadow-lg sticky top-0 z-50">
	<div class="d-navbar-start">
		<a href={resolve('/')} class="d-btn d-btn-ghost text-xl font-bold">
			{APP_NAME}
		</a>
	</div>

	<div class="d-navbar-center hidden lg:flex">
		<ul class="d-menu d-menu-horizontal gap-2">
			{#if auth?.isAuthenticated && auth?.user}
				<li>
					<!-- <button class="d-btn d-btn-ghost" onclick={goToDashboard} type="button">
						Dashboard
					</button> -->
				</li>
			{/if}
		</ul>
	</div>

	<div class="d-navbar-end gap-2">
		{#if auth?.isAuthenticated && auth?.user}
			<details class="d-dropdown d-dropdown-end">
				<summary class="d-btn d-btn-ghost d-btn-circle avatar cursor-pointer" type="button" aria-label="User menu">
					<div class="d-avatar placeholder">
						<div class="bg-neutral text-neutral-content rounded-full w-10">
							<span class="text-lg" aria-hidden="true">
								{auth.user.firstName?.[0] || auth.user.username?.[0] || auth.user.email[0].toUpperCase()}
							</span>
						</div>
					</div>
				</summary>
				<ul class="d-dropdown-content d-menu bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg" role="menu">
					<li class="d-menu-title">
						<span>{auth.user.firstName && auth.user.lastName ? `${auth.user.firstName} ${auth.user.lastName}` : auth.user.username || auth.user.email}</span>
					</li>
					<li role="menuitem">
						<button onclick={goToDashboard} type="button">Dashboard</button>
					</li>
					<li role="menuitem">
						<button onclick={handleLogout} type="button" disabled={logoutLoading} aria-busy={logoutLoading}>
							{#if logoutLoading}
								<span class="d-loading d-loading-spinner d-loading-xs" aria-hidden="true"></span>
							{/if}
							<span>Logout</span>
						</button>
					</li>
				</ul>
			</details>
		{:else}
			<Button variant="ghost" onClick={goToLogin}>Log In</Button>
			<Button variant="primary" onClick={goToRegister}>Sign Up</Button>
		{/if}
	</div>
</div>

