<script lang="ts">
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { updateAccount } from '$lib/utils/api';

	const auth = getAuthContext();
	const user = $derived(auth.user);

	const themes = ['light', 'dark', 'cupcake', 'bumblebee'] as const;
	type Theme = (typeof themes)[number];
	type Font = 'system' | 'serif' | 'mono';
	type FontSize = 'sm' | 'md' | 'lg';

	let selectedTheme = $state<Theme>('light');
	let selectedFont = $state<Font>('system');
	let fontSize = $state<FontSize>('md');

	let firstName = $state('');
	let lastName = $state('');
	let username = $state('');
	let email = $state('');
	let nrc = $state('');
	let phoneNumber = $state('');
	let address = $state('');
	let savingAccount = $state(false);
	let accountError = $state<string | null>(null);
	let accountSaved = $state(false);

	let changePasswordDialog: HTMLDialogElement | null = null;
	let newPassword = $state('');
	let confirmPassword = $state('');
	let savingPassword = $state(false);
	let passwordError = $state<string | null>(null);
	let passwordSaved = $state(false);

	function getUserInitial() {
		if (!user) return '?';
		const source = user.firstName || user.username || user.email;
		if (!source) return '?';
		return source[0]?.toUpperCase() ?? '?';
	}

	$effect(() => {
		if (user) {
			firstName = user.firstName ?? '';
			lastName = user.lastName ?? '';
			username = user.username ?? '';
			email = user.email ?? '';
			nrc = user.nrc ?? '';
			phoneNumber = user.phoneNumber ?? '';
			address = user.address ?? '';
		}
	});

	async function handleSaveAccount() {
		if (!user) return;
		accountError = null;
		accountSaved = false;
		savingAccount = true;

		try {
			await updateAccount(user.id, {
				firstName: firstName || undefined,
				lastName: lastName || undefined,
				username: username || undefined,
				email: email || undefined,
				nrc: nrc || undefined,
				phoneNumber: phoneNumber || undefined,
				address: address || undefined
			});

			// Refresh auth context and notify other components
			auth.refresh();
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new Event('auth-changed'));
			}

			accountSaved = true;
		} catch (error) {
			accountError =
				error instanceof Error ? error.message : 'Failed to update account';
		} finally {
			savingAccount = false;
		}
	}

	function applyTheme(theme: Theme) {
		selectedTheme = theme;
		document.documentElement.setAttribute('data-theme', theme);

		if (typeof window !== 'undefined') {
			localStorage.setItem('dashboard.theme', theme);
		}
	}

	function applyFont(font: Font) {
		selectedFont = font;
		const root = document.documentElement;
		root.classList.remove('font-sans', 'font-serif', 'font-mono');
		if (font === 'system') root.classList.add('font-sans');
		if (font === 'serif') root.classList.add('font-serif');
		if (font === 'mono') root.classList.add('font-mono');

		if (typeof window !== 'undefined') {
			localStorage.setItem('dashboard.font', font);
		}
	}

	function applyFontSize(size: FontSize) {
		fontSize = size;
		const root = document.documentElement;
		root.classList.remove('text-sm', 'text-base', 'text-lg');
		if (size === 'sm') root.classList.add('text-sm');
		if (size === 'md') root.classList.add('text-base');
		if (size === 'lg') root.classList.add('text-lg');
		if (typeof window !== 'undefined') {
			localStorage.setItem('dashboard.fontSize', size);
		}
	}

	onMount(() => {
		if (typeof window === 'undefined') return;

		const storedTheme = localStorage.getItem('dashboard.theme') as Theme | null;
		const storedFont = localStorage.getItem('dashboard.font') as Font | null;
		const storedFontSize = localStorage.getItem('dashboard.fontSize') as FontSize | null;

		if (storedTheme && themes.includes(storedTheme)) {
			applyTheme(storedTheme);
		} else {
			applyTheme(selectedTheme);
		}

		if (storedFont) {
			applyFont(storedFont);
		} else {
			applyFont(selectedFont);
		}

		if (storedFontSize) {
			applyFontSize(storedFontSize);
		} else {
			applyFontSize(fontSize);
		}
	});

	function openChangePassword() {
		passwordError = null;
		passwordSaved = false;
		newPassword = '';
		confirmPassword = '';
		changePasswordDialog?.showModal();
	}

	function closeChangePassword() {
		changePasswordDialog?.close();
	}

	async function handleChangePassword(event: SubmitEvent) {
		event.preventDefault();
		if (!user) return;
		passwordError = null;
		passwordSaved = false;

		if (!newPassword || !confirmPassword) {
			passwordError = 'Please fill in all password fields.';
			return;
		}
		if (newPassword !== confirmPassword) {
			passwordError = 'New password and confirmation do not match.';
			return;
		}
		if (newPassword.length < 8) {
			passwordError = 'New password must be at least 8 characters.';
			return;
		}

		savingPassword = true;
		try {
			await updateAccount(user.id, {
				newPassword,
				confirmPassword
			});
			passwordSaved = true;
			newPassword = '';
			confirmPassword = '';
		} catch (error) {
			passwordError = error instanceof Error ? error.message : 'Failed to change password';
		} finally {
			savingPassword = false;
		}
	}
</script>

<svelte:head>
	<title>Settings - Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-base-200 flex">
	<Sidebar active="settings" />
	<main class="flex-1 p-4">
		<div class="max-w-5xl mx-auto space-y-6">
			<header class="flex items-center justify-between gap-2">
				<div>
					<h1 class="text-2xl font-bold">Settings</h1>
					<p class="text-sm text-base-content/60">Customize your dashboard experience</p>
				</div>
				{#if user}
					<p class="text-xs text-base-content/60">Signed in as {user.email}</p>
				{/if}
			</header>

			<section class="grid gap-4 md:grid-cols-2">
				<!-- Theme settings -->
				<div class="d-card bg-base-100 shadow-lg">
					<div class="d-card-body">
						<h2 class="d-card-title">Theme</h2>
						<p class="text-sm text-base-content/70">Choose your preferred color theme.</p>
						<div class="mt-3 grid grid-cols-2 gap-2">
							{#each themes as theme (theme)}
								<button
									type="button"
									class={[
										'd-btn d-btn-sm justify-start',
										selectedTheme === theme ? 'd-btn-primary' : 'd-btn-ghost'
									]}
									onclick={() => applyTheme(theme)}
								>
									<span class="capitalize">{theme}</span>
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Font family settings -->
				<div class="d-card bg-base-100 shadow-lg">
					<div class="d-card-body">
						<h2 class="d-card-title">Font</h2>
						<p class="text-sm text-base-content/70">Pick the font style for the app.</p>
						<div class="mt-3 d-join d-join-horizontal">
							<button
								type="button"
								class={['d-btn d-join-item', selectedFont === 'system' ? 'd-btn-primary' : 'd-btn-ghost']}
								onclick={() => applyFont('system')}
							>
								System
							</button>
							<button
								type="button"
								class={['d-btn d-join-item', selectedFont === 'serif' ? 'd-btn-primary' : 'd-btn-ghost']}
								onclick={() => applyFont('serif')}
							>
								Serif
							</button>
							<button
								type="button"
								class={['d-btn d-join-item', selectedFont === 'mono' ? 'd-btn-primary' : 'd-btn-ghost']}
								onclick={() => applyFont('mono')}
							>
								Mono
							</button>
						</div>
					</div>
				</div>
			</section>

			<!-- Font size settings -->
			<section class="d-card bg-base-100 shadow-lg">
				<div class="d-card-body">
					<h2 class="d-card-title">Font size</h2>
					<p class="text-sm text-base-content/70">Adjust the base font size for the interface.</p>
					<div class="mt-3 d-join d-join-horizontal">
						<button
							type="button"
							class={['d-btn d-join-item', fontSize === 'sm' ? 'd-btn-primary' : 'd-btn-ghost']}
							onclick={() => applyFontSize('sm')}
						>
							Small
						</button>
						<button
							type="button"
							class={['d-btn d-join-item', fontSize === 'md' ? 'd-btn-primary' : 'd-btn-ghost']}
							onclick={() => applyFontSize('md')}
						>
							Medium
						</button>
						<button
							type="button"
							class={['d-btn d-join-item', fontSize === 'lg' ? 'd-btn-primary' : 'd-btn-ghost']}
							onclick={() => applyFontSize('lg')}
						>
							Large
						</button>
					</div>

					<p class="mt-4 text-sm text-base-content/70">
						Preview text will look like this. The quick brown fox jumps over the lazy dog.
					</p>
				</div>
			</section>

			<!-- Account settings -->
			<section class="d-card bg-base-100 shadow-lg">
				<div class="d-card-body flex flex-col gap-4 sm:flex-row sm:items-center">
					<div class="d-avatar placeholder">
						<div class="bg-neutral text-neutral-content rounded-full w-16 h-16 flex items-center justify-center text-2xl">
							<span aria-hidden="true">{getUserInitial()}</span>
						</div>
					</div>

					<div class="flex-1 space-y-2">
						<h2 class="d-card-title">Account</h2>
						{#if user}
							<div class="mt-2 grid gap-4 sm:grid-cols-2">
								<div class="space-y-1">
									<p class="text-xs text-base-content/60">First name</p>
									<input
										type="text"
										class="d-input d-input-bordered w-full"
										placeholder="First name"
										bind:value={firstName}
									/>
								</div>
								<div class="space-y-1">
									<p class="text-xs text-base-content/60">Last name</p>
									<input
										type="text"
										class="d-input d-input-bordered w-full"
										placeholder="Last name"
										bind:value={lastName}
									/>
								</div>
								<div class="space-y-1">
									<p class="text-xs text-base-content/60">Username</p>
									<input
										type="text"
										class="d-input d-input-bordered w-full"
										placeholder="Username"
										bind:value={username}
									/>
								</div>
								<div class="space-y-1">
									<p class="text-xs text-base-content/60">Email</p>
									<input
										type="email"
										class="d-input d-input-bordered w-full"
										placeholder="Email"
										bind:value={email}
									/>
								</div>
								<div class="space-y-1">
									<p class="text-xs text-base-content/60">NRC</p>
									<input
										type="text"
										class="d-input d-input-bordered w-full"
										placeholder="NRC"
										bind:value={nrc}
									/>
								</div>
								<div class="space-y-1">
									<p class="text-xs text-base-content/60">Phone number</p>
									<input
										type="tel"
										class="d-input d-input-bordered w-full"
										placeholder="Phone number"
										bind:value={phoneNumber}
									/>
								</div>
								<div class="space-y-1 sm:col-span-2">
									<p class="text-xs text-base-content/60">Address</p>
									<textarea
										class="d-textarea d-textarea-bordered w-full"
										placeholder="Address"
										rows="2"
										bind:value={address}
									></textarea>
								</div>

								{#if user.level !== undefined}
									<div class="space-y-1">
										<p class="text-xs text-base-content/60">Level</p>
										<p class="text-sm font-medium">Level {user.level}</p>
									</div>
								{/if}
							</div>

							<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div class="space-y-1 text-sm">
									{#if accountError}
										<p class="text-error">{accountError}</p>
									{/if}
									{#if accountSaved}
										<p class="text-success">Account details updated.</p>
									{/if}
								</div>

								<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
									<button
										type="button"
										class="d-btn d-btn-outline w-full sm:w-auto"
										onclick={openChangePassword}
									>
										Change password
									</button>

									<button
										type="button"
										class="d-btn d-btn-primary w-full sm:w-auto"
										onclick={handleSaveAccount}
										disabled={savingAccount}
									>
										{#if savingAccount}
											<span class="d-loading d-loading-spinner d-loading-xs" aria-hidden="true"></span>
										{/if}
										<span>Save changes</span>
									</button>
								</div>
							</div>
						{:else}
							<p class="text-sm text-base-content/60">
								Account details are unavailable. Please sign in again.
							</p>
						{/if}
					</div>
				</div>
			</section>
		</div>
	</main>
</div>

<dialog class="d-modal" bind:this={changePasswordDialog}>
	<div class="d-modal-box space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-bold">Change password</h3>
			<button type="button" class="d-btn d-btn-ghost d-btn-sm" onclick={closeChangePassword}>
				✕
			</button>
		</div>

		<form class="space-y-3" onsubmit={handleChangePassword}>
			<label class="d-form-control w-full space-y-1">
				<span class="d-label-text text-xs text-base-content/70">New password</span>
				<input
					type="password"
					class="d-input d-input-bordered w-full"
					placeholder="New password"
					bind:value={newPassword}
					required
					minlength="8"
				/>
			</label>

			<label class="d-form-control w-full space-y-1">
				<span class="d-label-text text-xs text-base-content/70">Confirm new password</span>
				<input
					type="password"
					class="d-input d-input-bordered w-full"
					placeholder="Confirm new password"
					bind:value={confirmPassword}
					required
					minlength="8"
				/>
			</label>

			{#if passwordError}
				<p class="text-error text-sm">{passwordError}</p>
			{/if}
			{#if passwordSaved}
				<p class="text-success text-sm">Password updated.</p>
			{/if}

			<div class="flex justify-end gap-2 pt-2">
				<button type="button" class="d-btn d-btn-ghost" onclick={closeChangePassword}>
					Cancel
				</button>
				<button type="submit" class="d-btn d-btn-primary" disabled={savingPassword}>
					{#if savingPassword}
						<span class="d-loading d-loading-spinner d-loading-xs" aria-hidden="true"></span>
					{/if}
					<span>Update password</span>
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="d-modal-backdrop">
		<button aria-label="Close"></button>
	</form>
</dialog>


