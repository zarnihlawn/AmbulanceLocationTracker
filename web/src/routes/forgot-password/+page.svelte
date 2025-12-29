<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { API_ENDPOINTS } from '$lib/config/api';

	let email = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		error = null;
		success = false;

		try {
			const response = await fetch(API_ENDPOINTS.forgotPassword, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				error = errorData.message || errorData.error || 'Failed to send reset email';
				return;
			}

			success = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			loading = false;
		}
	}

	function goToLogin() {
		goto(resolve('/login'));
	}
</script>

<svelte:head>
	<title>Forgot Password - Pun Hlaing Account</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
	<div class="w-full max-w-md">
		<Card title="Reset Password">
			{#if success}
				<Alert type="success" message="Password reset email sent! Check your inbox." />
				<div class="mt-4">
					<Button variant="primary" block onClick={goToLogin} disabled={loading}>
						Back to Login
					</Button>
				</div>
			{:else}
				<p class="text-sm text-base-content/70 mb-4">
					Enter your email address and we'll send you a link to reset your password.
				</p>

				{#if error}
					<Alert type="error" message={error} />
				{/if}

				<form onsubmit={handleSubmit} class="space-y-4" novalidate>
					<Input
						type="email"
						label="Email"
						name="email"
						placeholder="Enter your email"
						bind:value={email}
						disabled={loading}
						required
					/>

					<Button type="submit" variant="primary" block loading={loading} disabled={loading}>
						Send Reset Link
					</Button>

					<div class="text-center mt-4">
						<a href={resolve('/login')} class="link link-primary text-sm" tabindex={loading ? -1 : 0}>Back to Login</a>
					</div>
				</form>
			{/if}
		</Card>
	</div>
</div>

