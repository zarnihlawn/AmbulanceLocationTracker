<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import type { Organization } from '$lib/types/organization';
	import { createOrganization, getOrganizationsByOwner } from '$lib/utils/organization';

	const auth = getAuthContext();
	const user = $derived(auth.user);

	let organizations = $state<Organization[]>([]);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

	let createDialog: HTMLDialogElement;
	let creating = $state(false);
	let newName = $state('');
	let newDescription = $state('');
	let createError = $state<string | null>(null);

	onMount(async () => {
		loadError = null;
		loading = true;
		try {
			if (!user) {
				throw new Error('Missing user context');
			}
			organizations = await getOrganizationsByOwner(user.id);
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to load organizations';
		} finally {
			loading = false;
		}
	});

	function openCreate() {
		newName = '';
		newDescription = '';
		createError = null;
		creating = true;
		createDialog?.showModal();
	}

	function closeCreate() {
		creating = false;
		createDialog?.close();
	}

	async function handleCreateOrganization() {
		const name = newName.trim();
		const description = newDescription.trim();
		if (!name || !description) {
			createError = 'Name and description are required.';
			return;
		}

		createError = null;
		try {
			if (!user) {
				throw new Error('Missing user context');
			}

			const org = await createOrganization({
				ownerId: user.id,
				name,
				description,
				profile: null,
				banner: null
			});
			organizations = [...organizations, org];
			closeCreate();
		} catch (error) {
			createError = error instanceof Error ? error.message : 'Failed to create organization';
		}
	}

	function openServices(org: Organization) {
		goto(resolve(`/dashboard/organization/workspace?orgId=${org.id}`));
	}
</script>

<svelte:head>
	<title>Organization - Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-base-200 flex">
	<Sidebar active="organization" />

	<main class="flex-1 p-4">
		<div class="max-w-5xl mx-auto space-y-6">
			<header class="flex items-center justify-between gap-2">
				<div>
					<h1 class="text-2xl font-bold">Organization</h1>
					<p class="text-sm text-base-content/60">Manage your organizations</p>
				</div>
				<button type="button" class="d-btn d-btn-primary d-btn-sm gap-2" onclick={openCreate}>
					<span class="text-lg leading-none">+</span>
					<span class="hidden sm:inline">New organization</span>
				</button>
			</header>

			<dialog bind:this={createDialog} class="d-modal d-modal-middle">
				<div class="d-modal-box max-w-md space-y-4">
					<h2 class="d-card-title">Create organization</h2>
					<div class="space-y-2">
						<label for="org-name" class="text-sm font-medium">Name</label>
						<input
							id="org-name"
							type="text"
							class="d-input d-input-bordered w-full"
							placeholder="Organization name"
							bind:value={newName}
						/>
					</div>
					<div class="space-y-2">
						<label for="org-description" class="text-sm font-medium">Description</label>
						<textarea
							id="org-description"
							class="d-textarea d-textarea-bordered w-full"
							rows="3"
							placeholder="Short description (required)"
							bind:value={newDescription}
						></textarea>
					</div>
					{#if createError}
						<p class="text-sm text-error">{createError}</p>
					{/if}
					<div class="flex justify-end gap-2">
						<button
							type="button"
							class="d-btn d-btn-ghost"
							onclick={closeCreate}
						>
							Cancel
						</button>
						<button
							type="button"
							class="d-btn d-btn-primary"
							onclick={handleCreateOrganization}
							disabled={!newName.trim() || !newDescription.trim()}
						>
							Create
						</button>
					</div>
				</div>
				<form method="dialog" class="d-modal-backdrop">
					<button onclick={closeCreate}>close</button>
				</form>
			</dialog>

			<section class="min-h-[200px]">
				{#if loading}
					<div class="flex items-center gap-2 text-sm text-base-content/70">
						<span class="d-loading d-loading-spinner d-loading-sm" aria-hidden="true"></span>
						<span>Loading organizations...</span>
					</div>
				{:else if loadError}
					<div class="d-alert d-alert-error">
						<span>{loadError}</span>
					</div>
				{:else if organizations.length === 0}
					<div class="text-sm text-base-content/70">No organizations yet. Create one to get started.</div>
				{:else}
					<div class="grid gap-4 md:grid-cols-2">
						{#each organizations as org (org.id)}
							<div
								role="button"
								tabindex="0"
								class="d-card bg-base-100 shadow-md cursor-pointer hover:bg-base-200 transition-colors"
								onclick={() => openServices(org)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										openServices(org);
									}
								}}
							>
								<div class="d-card-body">
									<h3 class="d-card-title">{org.name}</h3>
									{#if org.description}
										<p class="text-sm text-base-content/70">
											{org.description}
										</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	</main>
</div>


