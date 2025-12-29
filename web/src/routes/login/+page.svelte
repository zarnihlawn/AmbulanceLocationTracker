<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import type { LoginCredentials, AuthError } from '$lib/types/auth';
	import { setTokens, setUser } from '$lib/utils/auth';
	import { API_ENDPOINTS } from '$lib/config/api';
	import { getAuthContext } from '$lib/stores/auth.svelte';

	// Get auth context during component initialization
	let auth;
	try {
		auth = getAuthContext();
	} catch {
		auth = null;
	}

	let emailOrUsername = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state<AuthError | null>(null);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		error = null;

		try {
			const credentials: LoginCredentials = { emailOrUsername, password };
			const response = await fetch(API_ENDPOINTS.login, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credentials)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				error = {
					message: errorData.message || errorData.error || 'Login failed'
				};
				return;
			}

			const data = await response.json();
			console.log('Login response:', data);
			
			// Store tokens and user data according to API guide
			if (data.accessToken && data.refreshToken) {
				setTokens(data.accessToken, data.refreshToken);
			}
			if (data.user) {
				setUser(data.user);
				console.log('User stored:', data.user);
			}
			
			// Refresh auth context and wait a bit for it to update
			if (auth) {
				auth.refresh();
				// Dispatch custom event to notify other components
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new Event('auth-changed'));
				}
				// Small delay to ensure context is updated
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			
			// Use invalidateAll to force page reload with new data
			const { invalidateAll } = await import('$app/navigation');
			await invalidateAll();
			goto(resolve('/dashboard'));
		} catch (err) {
			error = { message: err instanceof Error ? err.message : 'An error occurred' };
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Log In - Pun Hlaing Account</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
	<div class="w-full max-w-md">
		<Card title="Sign In">
			{#if error}
				<Alert type="error" message={error.message} />
			{/if}

			<form onsubmit={handleSubmit} class="space-y-4" novalidate>
				<Input
					type="text"
					label="Email or Username"
					name="emailOrUsername"
					placeholder="Enter your email or username"
					bind:value={emailOrUsername}
					disabled={loading}
					required
				/>

				<Input
					type="password"
					label="Password"
					name="password"
					placeholder="Enter your password"
					bind:value={password}
					disabled={loading}
					required
				/>

				<div class="flex justify-end">
					<a href={resolve('/forgot-password')} class="link link-primary text-sm" tabindex={loading ? -1 : 0}>
						Forgot password?
					</a>
				</div>

				<Button type="submit" variant="primary" block loading={loading} disabled={loading}>
					Sign In
				</Button>

				<div class="text-center mt-4">
					<p class="text-sm">
						Don't have an account?
						<a href={resolve('/register')} class="link link-primary" tabindex={loading ? -1 : 0}> Sign up</a>
					</p>
				</div>
			</form>
		</Card>
	</div>
</div>

