<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import type { RegisterData, AuthError } from '$lib/types/auth';
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

	let firstName = $state('');
	let lastName = $state('');
	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let nrc = $state('');
	let phoneNumber = $state('');
	let address = $state('');
	let loading = $state(false);
	let error = $state<AuthError | null>(null);

	function validateForm(): string | null {
		if (password !== confirmPassword) {
			return 'Passwords do not match';
		}
		if (password.length < 8) {
			return 'Password must be at least 8 characters';
		}
		return null;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		error = null;

		const validationError = validateForm();
		if (validationError) {
			error = { message: validationError };
			loading = false;
			return;
		}

		try {
			const registerData: RegisterData = {
				...(email && { email }),
				...(username && { username }),
				...(password && { password }),
				...(firstName && { firstName }),
				...(lastName && { lastName }),
				...(nrc.trim() && { nrc: nrc.trim() }),
				...(phoneNumber.trim() && { phoneNumber: phoneNumber.trim() }),
				...(address.trim() && { address: address.trim() })
			};

			const response = await fetch(API_ENDPOINTS.register, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(registerData)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				error = {
					message: errorData.message || errorData.error || 'Registration failed'
				};
				return;
			}

			const data = await response.json();
			console.log('Register response:', data);

			// Store tokens and user data if provided (registration might auto-login)
			if (data.accessToken && data.refreshToken) {
				setTokens(data.accessToken, data.refreshToken);
			}
			if (data.user) {
				setUser(data.user);
				console.log('User stored:', data.user);
			} else if (data.id || data.email) {
				// Fallback: create user object from response if user object not provided
				const userData = {
					id: data.id || '',
					email: data.email || email,
					username: data.username || username,
					firstName: data.firstName || firstName,
					lastName: data.lastName || lastName
				};
				setUser(userData);
			}
			// Refresh auth context and wait for it to update
			if (auth) {
				auth.refresh();
				// Dispatch custom event to notify other components
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new Event('auth-changed'));
				}
				// Small delay to ensure context is updated
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			// Redirect to login page after successful registration
			// Use invalidateAll to force page reload with new data
			const { invalidateAll } = await import('$app/navigation');
			await invalidateAll();
			goto(resolve('/login'));
		} catch (err) {
			error = { message: err instanceof Error ? err.message : 'An error occurred' };
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign Up - Pun Hlaing Account</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
	<div class="w-full max-w-2xl">
		<Card title="Create Account">
			{#if error}
				<Alert type="error" message={error.message} />
			{/if}

			<form onsubmit={handleSubmit} class="space-y-4" novalidate>
				<Input
					type="text"
					label="First Name"
					name="firstName"
					placeholder="Enter your first name (optional)"
					bind:value={firstName}
					disabled={loading}
				/>

				<Input
					type="text"
					label="Last Name"
					name="lastName"
					placeholder="Enter your last name (optional)"
					bind:value={lastName}
					disabled={loading}
				/>

				<Input
					type="text"
					label="Username"
					name="username"
					placeholder="Enter your username (optional)"
					bind:value={username}
					disabled={loading}
				/>

				<Input
					type="email"
					label="Email"
					name="email"
					placeholder="Enter your email (optional)"
					bind:value={email}
					disabled={loading}
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

				<Input
					type="password"
					label="Confirm Password"
					name="confirmPassword"
					placeholder="Confirm your password"
					bind:value={confirmPassword}
					disabled={loading}
					required
				/>

				<Input
					type="text"
					label="NRC"
					name="nrc"
					placeholder="Enter your NRC (optional)"
					bind:value={nrc}
					disabled={loading}
				/>

				<Input
					type="tel"
					label="Phone Number"
					name="phoneNumber"
					placeholder="Enter your phone number (optional)"
					bind:value={phoneNumber}
					disabled={loading}
				/>

				<div class="form-control w-full">
					<label class="label" for="address">
						<span class="label-text">Address</span>
					</label>
					<textarea
						id="address"
						name="address"
						placeholder="Enter your address (optional)"
						bind:value={address}
						disabled={loading}
						class="d-textarea d-textarea-bordered w-full"
						rows="3"
					></textarea>
				</div>

				<Button type="submit" variant="primary" block loading={loading} disabled={loading}>
					Sign Up
				</Button>

				<div class="text-center mt-4">
					<p class="text-sm">
						Already have an account?
						<a href={resolve('/login')} class="link link-primary" tabindex={loading ? -1 : 0}> Sign in</a>
					</p>
				</div>
			</form>
		</Card>
	</div>
</div>

