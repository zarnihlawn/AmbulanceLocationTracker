<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { Workspace } from '$lib/types/workspace';
	import type { Organization } from '$lib/types/organization';
	import type { LocationTrackerDevice } from '$lib/types/location-tracker-device';
	import {
		getLocationTrackerDevicesByWorkspaceId,
		createLocationTrackerDeviceWithSecretKey,
		acceptLocationTrackerDevice,
		updateLocationTrackerDevice,
		deleteLocationTrackerDevice
	} from '$lib/utils/location-tracker-device';

	const { data } = $props();
	const workspaceId = $derived(data.workspaceId as string);
	const workspace = $derived(data.workspace as Workspace | null);
	const organization = $derived(data.organization as Organization | null);

	let devices = $state<LocationTrackerDevice[]>([]);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

	let creating = $state(false);
	let createError = $state<string | null>(null);
	let createdDevice = $state<LocationTrackerDevice | null>(null);

	// Accept device dialog
	let acceptDialog: HTMLDialogElement;
	let acceptingDevice = $state<LocationTrackerDevice | null>(null);
	let acceptName = $state('');
	let acceptDescription = $state('');
	let accepting = $state(false);
	let acceptError = $state<string | null>(null);

	// Edit device dialog
	let editDialog: HTMLDialogElement;
	let editingDevice = $state<LocationTrackerDevice | null>(null);
	let editName = $state('');
	let editDescription = $state('');
	let editing = $state(false);
	let editError = $state<string | null>(null);

	// Delete device dialog
	let deleteDialog: HTMLDialogElement;
	let deletingDevice = $state<LocationTrackerDevice | null>(null);
	let deleting = $state(false);
	let deleteError = $state<string | null>(null);

	onMount(async () => {
		await loadDevices();
	});

	onDestroy(() => {
		if (copyFeedbackTimeout) {
			clearTimeout(copyFeedbackTimeout);
		}
	});

	async function loadDevices() {
		loadError = null;
		loading = true;
		try {
			devices = await getLocationTrackerDevicesByWorkspaceId(workspaceId);
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to load devices';
		} finally {
			loading = false;
		}
	}

	function generateSecretKey(): string {
		// Generate a random 32-character alphanumeric key
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < 32; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	async function handleAddTrackerDevice() {
		if (!workspace) {
			createError = 'Workspace information is required';
			return;
		}

		createError = null;
		creating = true;
		createdDevice = null;

		try {
			const secretKey = generateSecretKey();
			const newDevice = await createLocationTrackerDeviceWithSecretKey({
				workspaceId: workspace.id,
				secretKey
			});

			createdDevice = newDevice;
			await loadDevices(); // Reload devices list
		} catch (error) {
			createError = error instanceof Error ? error.message : 'Failed to create device';
		} finally {
			creating = false;
		}
	}

	async function copyToClipboard(text: string) {
		if (!text) {
			return;
		}

		try {
			// Try modern clipboard API first
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(text);
				showCopyFeedback('Copied to clipboard!');
				return;
			}

			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = text;
			textArea.style.position = 'fixed';
			textArea.style.left = '-999999px';
			textArea.style.top = '-999999px';
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			try {
				const successful = document.execCommand('copy');
				if (successful) {
					showCopyFeedback('Copied to clipboard!');
				} else {
					showCopyFeedback('Failed to copy. Please copy manually.', true);
				}
			} catch (err) {
				console.error('Fallback copy failed:', err);
				showCopyFeedback('Failed to copy. Please copy manually.', true);
			} finally {
				document.body.removeChild(textArea);
			}
		} catch (err) {
			console.error('Copy to clipboard failed:', err);
			showCopyFeedback('Failed to copy. Please copy manually.', true);
		}
	}

	let copyFeedback = $state<{ message: string; isError: boolean } | null>(null);
	let copyFeedbackTimeout: ReturnType<typeof setTimeout> | null = null;

	function showCopyFeedback(message: string, isError: boolean = false) {
		copyFeedback = { message, isError };

		// Clear existing timeout
		if (copyFeedbackTimeout) {
			clearTimeout(copyFeedbackTimeout);
		}

		// Hide feedback after 3 seconds
		copyFeedbackTimeout = setTimeout(() => {
			copyFeedback = null;
		}, 3000);
	}

	function openAcceptDialog(device: LocationTrackerDevice) {
		acceptingDevice = device;
		acceptName = device.name || '';
		acceptDescription = device.description || '';
		acceptError = null;
		acceptDialog?.showModal();
	}

	function closeAcceptDialog() {
		acceptingDevice = null;
		acceptName = '';
		acceptDescription = '';
		acceptError = null;
		acceptDialog?.close();
	}

	async function handleAcceptDevice() {
		if (!acceptingDevice) {
			return;
		}

		const name = acceptName.trim();
		if (!name) {
			acceptError = 'Name is required';
			return;
		}

		acceptError = null;
		accepting = true;

		try {
			await acceptLocationTrackerDevice(acceptingDevice.id, {
				name,
				description: acceptDescription.trim() || undefined
			});
			await loadDevices(); // Reload devices list
			closeAcceptDialog();
		} catch (error) {
			acceptError = error instanceof Error ? error.message : 'Failed to accept device';
		} finally {
			accepting = false;
		}
	}

	function openEditDialog(device: LocationTrackerDevice) {
		editingDevice = device;
		editName = device.name || '';
		editDescription = device.description || '';
		editError = null;
		editDialog?.showModal();
	}

	function closeEditDialog() {
		editingDevice = null;
		editName = '';
		editDescription = '';
		editError = null;
		editDialog?.close();
	}

	async function handleUpdateDevice() {
		if (!editingDevice) {
			return;
		}

		editError = null;
		editing = true;

		try {
			await updateLocationTrackerDevice(editingDevice.id, {
				name: editName.trim() || undefined,
				description: editDescription.trim() || undefined
			});
			await loadDevices(); // Reload devices list
			closeEditDialog();
		} catch (error) {
			editError = error instanceof Error ? error.message : 'Failed to update device';
		} finally {
			editing = false;
		}
	}

	function openDeleteDialog(device: LocationTrackerDevice) {
		deletingDevice = device;
		deleteError = null;
		deleteDialog?.showModal();
	}

	function closeDeleteDialog() {
		deletingDevice = null;
		deleteError = null;
		deleteDialog?.close();
	}

	async function handleDeleteDevice() {
		if (!deletingDevice) {
			return;
		}

		deleteError = null;
		deleting = true;

		try {
			await deleteLocationTrackerDevice(deletingDevice.id);
			await loadDevices(); // Reload devices list
			closeDeleteDialog();
			// Device deleted successfully - the Android app will detect this and redirect
		} catch (error) {
			deleteError = error instanceof Error ? error.message : 'Failed to delete device';
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Location Tracker - Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-base-200 flex">
	<Sidebar active="organization" />

	<main class="flex-1 p-4">
		<div class="max-w-5xl mx-auto space-y-6">
			<header class="flex items-center justify-between gap-2">
				<div>
					<h1 class="text-2xl font-bold">Location Tracker</h1>
					{#if organization && workspace}
						<p class="text-sm text-base-content/60">
							{organization.name} / {workspace.name}
						</p>
					{:else}
						<p class="text-sm text-base-content/60">
							Loading...
						</p>
					{/if}
				</div>
				<button
					type="button"
					class="d-btn d-btn-primary d-btn-sm gap-2"
					onclick={handleAddTrackerDevice}
					disabled={creating || !workspace}
				>
					{#if creating}
						<span class="d-loading d-loading-spinner d-loading-xs" aria-hidden="true"></span>
					{:else}
						<span class="text-lg leading-none">+</span>
					{/if}
					<span class="hidden sm:inline">Add Tracker Device</span>
				</button>
			</header>

			{#if createError}
				<div class="d-alert d-alert-error">
					<span>{createError}</span>
				</div>
			{/if}

			{#if copyFeedback}
				<div class="d-alert {copyFeedback.isError ? 'd-alert-error' : 'd-alert-success'} d-alert-sm">
					<span>{copyFeedback.message}</span>
				</div>
			{/if}

			{#if createdDevice}
				<div class="d-alert d-alert-success">
					<div class="flex-1">
						<h3 class="font-bold">Device Created!</h3>
						<div class="text-sm mt-2 space-y-2">
							<div class="flex items-center justify-between gap-2">
								<span class="font-medium">Workspace ID:</span>
								<div class="flex items-center gap-2">
									<code class="text-xs bg-base-200 px-2 py-1 rounded">
										{workspaceId}
									</code>
									<button
										type="button"
										class="d-btn d-btn-xs d-btn-ghost"
										onclick={() => copyToClipboard(workspaceId)}
										title="Copy to clipboard"
									>
										Copy
									</button>
								</div>
							</div>
							<div class="flex items-center justify-between gap-2">
								<span class="font-medium">Secret Key (One-time password):</span>
								<div class="flex items-center gap-2">
									<code class="text-xs bg-base-200 px-2 py-1 rounded break-all">
										{createdDevice.secretKey}
									</code>
									<button
										type="button"
										class="d-btn d-btn-xs d-btn-ghost"
										onclick={() => copyToClipboard(createdDevice.secretKey || '')}
										title="Copy to clipboard"
									>
										Copy
									</button>
								</div>
							</div>
							<p class="text-xs text-base-content/70 mt-3">
								Use these credentials in your Android app. The app needs to provide: Workspace ID, Device Key (from the app), and this Secret Key. You can accept the device now or wait for the Android app to register first.
							</p>
							<div class="d-alert d-alert-warning mt-3">
								<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
								<span class="text-xs font-medium">⚠️ Important: This secret key will only be shown once. Save it now before closing this message!</span>
							</div>
							<div class="flex justify-end gap-2 mt-3">
								<button
									type="button"
									class="d-btn d-btn-primary d-btn-sm"
									onclick={() => {
										acceptingDevice = createdDevice;
										acceptName = '';
										acceptDescription = '';
										acceptError = null;
										acceptDialog?.showModal();
									}}
								>
									Accept Now
								</button>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<section class="min-h-[200px]">
				{#if loading}
					<div class="flex items-center gap-2 text-sm text-base-content/70">
						<span class="d-loading d-loading-spinner d-loading-sm" aria-hidden="true"></span>
						<span>Loading devices...</span>
					</div>
				{:else if loadError}
					<div class="d-alert d-alert-error">
						<span>{loadError}</span>
					</div>
				{:else if devices.length === 0}
					<div class="text-sm text-base-content/70">
						No devices yet. Click "Add Tracker Device" to create one.
					</div>
				{:else}
					<div class="grid gap-4 md:grid-cols-2">
						{#each devices as device (device.id)}
							<div class="d-card bg-base-100 shadow-md">
								<div class="d-card-body">
									<h3 class="d-card-title">
										{device.name || (device.deviceKey ? device.deviceKey.substring(0, 8) + '...' : 'Device ' + device.id.substring(0, 8))}
									</h3>
									{#if device.description}
										<p class="text-sm text-base-content/70">{device.description}</p>
									{/if}
									<div class="space-y-1 text-sm mt-2">
										{#if device.deviceKey}
											<div class="flex items-center justify-between">
												<span class="text-base-content/70">Device Key:</span>
												<code class="text-xs bg-base-200 px-2 py-1 rounded">
													{device.deviceKey.substring(0, 16)}...
												</code>
											</div>
										{:else}
											<div class="flex items-center justify-between">
												<span class="text-base-content/70">Status:</span>
												<span class="badge badge-info">Not Registered</span>
											</div>
										{/if}
										{#if device.deviceModel}
											<div class="flex items-center justify-between">
												<span class="text-base-content/70">Model:</span>
												<span>{device.deviceModel}</span>
											</div>
										{/if}
										{#if device.deviceOs}
											<div class="flex items-center justify-between">
												<span class="text-base-content/70">OS:</span>
												<span>{device.deviceOs} {device.deviceOsVersion || ''}</span>
											</div>
										{/if}
										<div class="flex items-center justify-between">
											<span class="text-base-content/70">Status:</span>
											<span class="badge {device.isAccepted ? 'badge-success' : 'badge-warning'}">
												{device.isAccepted ? 'Accepted' : 'Pending'}
											</span>
										</div>
									</div>
									<div class="d-card-actions justify-end mt-4">
										{#if device.isAccepted && device.deviceKey}
											<a
												href={`/dashboard/location-tracker/${workspaceId}/device/${device.id}`}
												class="d-btn d-btn-primary d-btn-sm"
											>
												View Location
											</a>
										{/if}
										{#if !device.isAccepted}
											<button
												type="button"
												class="d-btn d-btn-primary d-btn-sm"
												onclick={() => openAcceptDialog(device)}
											>
												Accept Device
											</button>
										{:else}
											<button
												type="button"
												class="d-btn d-btn-sm d-btn-ghost"
												onclick={() => openEditDialog(device)}
												title="Edit device"
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
											</button>
										{/if}
										<button
											type="button"
											class="d-btn d-btn-error d-btn-sm d-btn-ghost"
											onclick={() => openDeleteDialog(device)}
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Accept Device Dialog -->
				<dialog bind:this={acceptDialog} class="d-modal d-modal-middle">
					<div class="d-modal-box max-w-md space-y-4">
						<h2 class="d-card-title">Accept Device</h2>
						<div class="space-y-2">
							<label for="device-name" class="text-sm font-medium">Name <span class="text-error">*</span></label>
							<input
								id="device-name"
								type="text"
								class="d-input d-input-bordered w-full"
								placeholder="Device name"
								bind:value={acceptName}
							/>
						</div>
						<div class="space-y-2">
							<label for="device-description" class="text-sm font-medium">Description</label>
							<textarea
								id="device-description"
								class="d-textarea d-textarea-bordered w-full"
								rows="3"
								placeholder="Device description (optional)"
								bind:value={acceptDescription}
							></textarea>
						</div>
						{#if acceptError}
							<p class="text-sm text-error">{acceptError}</p>
						{/if}
						<div class="flex justify-end gap-2">
							<button
								type="button"
								class="d-btn d-btn-ghost"
								onclick={closeAcceptDialog}
								disabled={accepting}
							>
								Cancel
							</button>
							<button
								type="button"
								class="d-btn d-btn-primary"
								onclick={handleAcceptDevice}
								disabled={!acceptName.trim() || accepting}
							>
								{#if accepting}
									<span class="d-loading d-loading-spinner d-loading-xs" aria-hidden="true"></span>
								{/if}
								Accept
							</button>
						</div>
					</div>
					<form method="dialog" class="d-modal-backdrop">
						<button onclick={closeAcceptDialog}>close</button>
					</form>
				</dialog>

				<!-- Edit Device Dialog -->
				<dialog bind:this={editDialog} class="d-modal d-modal-middle">
					<div class="d-modal-box max-w-md space-y-4">
						<h2 class="d-card-title">Edit Device</h2>
						<div class="space-y-2">
							<label for="edit-device-name" class="text-sm font-medium">Name</label>
							<input
								id="edit-device-name"
								type="text"
								class="d-input d-input-bordered w-full"
								placeholder="Device name"
								bind:value={editName}
							/>
						</div>
						<div class="space-y-2">
							<label for="edit-device-description" class="text-sm font-medium">Description</label>
							<textarea
								id="edit-device-description"
								class="d-textarea d-textarea-bordered w-full"
								rows="3"
								placeholder="Device description (optional)"
								bind:value={editDescription}
							></textarea>
						</div>
						{#if editError}
							<p class="text-sm text-error">{editError}</p>
						{/if}
						<div class="flex justify-end gap-2">
							<button
								type="button"
								class="d-btn d-btn-ghost"
								onclick={closeEditDialog}
								disabled={editing}
							>
								Cancel
							</button>
							<button
								type="button"
								class="d-btn d-btn-primary"
								onclick={handleUpdateDevice}
								disabled={editing}
							>
								{#if editing}
									<span class="d-loading d-loading-spinner d-loading-xs" aria-hidden="true"></span>
								{/if}
								Update
							</button>
						</div>
					</div>
					<form method="dialog" class="d-modal-backdrop">
						<button onclick={closeEditDialog}>close</button>
					</form>
				</dialog>

				<!-- Delete Device Dialog -->
				<dialog bind:this={deleteDialog} class="d-modal d-modal-middle">
					<div class="d-modal-box max-w-md space-y-4">
						<h2 class="d-card-title">Delete Device</h2>
						<p class="text-base-content/70">
							Are you sure you want to delete this device? This action cannot be undone.
						</p>
						{#if deletingDevice}
							<div class="bg-base-200 p-3 rounded">
								<p class="text-sm font-medium">
									{deletingDevice.name || (deletingDevice.deviceKey ? deletingDevice.deviceKey.substring(0, 8) + '...' : 'Device')}
								</p>
								{#if deletingDevice.deviceModel}
									<p class="text-xs text-base-content/70 mt-1">{deletingDevice.deviceModel}</p>
								{/if}
							</div>
						{/if}
						{#if deleteError}
							<p class="text-sm text-error">{deleteError}</p>
						{/if}
						<div class="flex justify-end gap-2">
							<button
								type="button"
								class="d-btn d-btn-ghost"
								onclick={closeDeleteDialog}
								disabled={deleting}
							>
								Cancel
							</button>
							<button
								type="button"
								class="d-btn d-btn-error"
								onclick={handleDeleteDevice}
								disabled={deleting}
							>
								{#if deleting}
									<span class="d-loading d-loading-spinner d-loading-xs" aria-hidden="true"></span>
								{/if}
								Delete
							</button>
						</div>
					</div>
					<form method="dialog" class="d-modal-backdrop">
						<button onclick={closeDeleteDialog}>close</button>
					</form>
				</dialog>
			</section>
		</div>
	</main>
</div>
