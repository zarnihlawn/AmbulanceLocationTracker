<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import type { Organization } from '$lib/types/organization';
	import { createOrganization, getOrganizationsByOwner, updateOrganization, deleteOrganization } from '$lib/utils/organization';

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

	let editDialog: HTMLDialogElement;
	let editing = $state(false);
	let editingOrg = $state<Organization | null>(null);
	let editName = $state('');
	let editDescription = $state('');
	let editError = $state<string | null>(null);

	let deleteDialog: HTMLDialogElement;
	let deleting = $state(false);
	let deletingOrg = $state<Organization | null>(null);
	let deleteConfirmationName = $state('');
	let deleteError = $state<string | null>(null);

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

	function openEdit(org: Organization, event: MouseEvent) {
		event.stopPropagation();
		editingOrg = org;
		editName = org.name;
		editDescription = org.description;
		editError = null;
		editing = true;
		editDialog?.showModal();
	}

	function closeEdit() {
		editing = false;
		editingOrg = null;
		editName = '';
		editDescription = '';
		editError = null;
		editDialog?.close();
	}

	async function handleUpdateOrganization() {
		if (!editingOrg) return;

		const name = editName.trim();
		const description = editDescription.trim();
		if (!name || !description) {
			editError = 'Name and description are required.';
			return;
		}

		editError = null;
		try {
			const updated = await updateOrganization(editingOrg.id, {
				name,
				description
			});
			organizations = organizations.map(org => org.id === updated.id ? updated : org);
			closeEdit();
		} catch (error) {
			editError = error instanceof Error ? error.message : 'Failed to update organization';
		}
	}

	function openDelete(org: Organization, event: MouseEvent) {
		event.stopPropagation();
		deletingOrg = org;
		deleteConfirmationName = '';
		deleteError = null;
		deleting = false;
		deleteDialog?.showModal();
	}

	function closeDelete() {
		deleting = false;
		deletingOrg = null;
		deleteConfirmationName = '';
		deleteError = null;
		deleteDialog?.close();
	}

	async function handleDeleteOrganization() {
		if (!deletingOrg) return;

		if (deleteConfirmationName !== deletingOrg.name) {
			deleteError = 'Name does not match. Please type the organization name to confirm.';
			return;
		}

		deleteError = null;
		deleting = true;
		try {
			await deleteOrganization(deletingOrg.id);
			organizations = organizations.filter(org => org.id !== deletingOrg!.id);
			closeDelete();
		} catch (error) {
			deleteError = error instanceof Error ? error.message : 'Failed to delete organization';
		} finally {
			deleting = false;
		}
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

			<dialog bind:this={editDialog} class="d-modal d-modal-middle">
				<div class="d-modal-box max-w-md space-y-4">
					<h2 class="d-card-title">Edit organization</h2>
					<div class="space-y-2">
						<label for="edit-org-name" class="text-sm font-medium">Name</label>
						<input
							id="edit-org-name"
							type="text"
							class="d-input d-input-bordered w-full"
							placeholder="Organization name"
							bind:value={editName}
						/>
					</div>
					<div class="space-y-2">
						<label for="edit-org-description" class="text-sm font-medium">Description</label>
						<textarea
							id="edit-org-description"
							class="d-textarea d-textarea-bordered w-full"
							rows="3"
							placeholder="Short description (required)"
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
							onclick={closeEdit}
						>
							Cancel
						</button>
						<button
							type="button"
							class="d-btn d-btn-primary"
							onclick={handleUpdateOrganization}
							disabled={!editName.trim() || !editDescription.trim()}
						>
							Update
						</button>
					</div>
				</div>
				<form method="dialog" class="d-modal-backdrop">
					<button onclick={closeEdit}>close</button>
				</form>
			</dialog>

			<dialog bind:this={deleteDialog} class="d-modal d-modal-middle">
				<div class="d-modal-box max-w-md space-y-4">
					<h2 class="d-card-title">Delete organization</h2>
					{#if deletingOrg}
						<p class="text-sm text-base-content/70">
							Are you sure you want to delete <strong>{deletingOrg.name}</strong>? This action cannot be undone.
						</p>
						<p class="text-sm text-base-content/60 mt-2">
							Type <strong>{deletingOrg.name}</strong> to confirm:
						</p>
						<input
							type="text"
							class="d-input d-input-bordered w-full"
							placeholder="Type organization name to confirm"
							bind:value={deleteConfirmationName}
							disabled={deleting}
							onkeydown={(e) => {
								if (e.key === 'Enter' && deleteConfirmationName === deletingOrg?.name && !deleting) {
									handleDeleteOrganization();
								}
							}}
						/>
					{/if}
					{#if deleteError}
						<p class="text-sm text-error">{deleteError}</p>
					{/if}
					<div class="flex justify-end gap-2">
						<button
							type="button"
							class="d-btn d-btn-ghost"
							onclick={closeDelete}
							disabled={deleting}
						>
							Cancel
						</button>
						<button
							type="button"
							class="d-btn d-btn-error"
							onclick={handleDeleteOrganization}
							disabled={deleting || deleteConfirmationName !== deletingOrg?.name}
						>
							{deleting ? 'Deleting...' : 'Delete'}
						</button>
					</div>
				</div>
				<form method="dialog" class="d-modal-backdrop">
					<button onclick={closeDelete} disabled={deleting}>close</button>
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
								class="d-card bg-base-100 shadow-md hover:bg-base-200 transition-colors"
							>
								<div class="d-card-body">
									<div class="flex items-start justify-between gap-2">
										<div
											class="flex-1 cursor-pointer"
											role="button"
											tabindex="0"
											onclick={() => openServices(org)}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													openServices(org);
												}
											}}
										>
											<h3 class="d-card-title">{org.name}</h3>
											{#if org.description}
												<p class="text-sm text-base-content/70">
													{org.description}
												</p>
											{/if}
										</div>
										<div class="flex gap-1">
											<button
												type="button"
												class="d-btn d-btn-sm d-btn-ghost"
												onclick={(e) => openEdit(org, e)}
												title="Edit organization"
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
											</button>
											<button
												type="button"
												class="d-btn d-btn-sm d-btn-ghost text-error"
												onclick={(e) => openDelete(org, e)}
												title="Delete organization"
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
											</button>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	</main>
</div>


