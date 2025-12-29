<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { Workspace } from '$lib/types/workspace';
	import type { Feature } from '$lib/types/feature';
	import { getWorkspacesByOrganization, createWorkspace, updateWorkspace, deleteWorkspace } from '$lib/utils/workspace';
	import { getFeatures, getFeatureById } from '$lib/utils/feature';

	const { data } = $props();
	const orgId = $derived(data.orgId as string | null);
	const orgName = $derived(data.orgName as string | null);

	let workspaces = $state<Workspace[]>([]);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

	let features = $state<Feature[]>([]);
	let featuresLoading = $state(false);
	let featuresError = $state<string | null>(null);

	// Map to store feature info for each workspace
	let workspaceFeatures = $state<Map<string, Feature>>(new Map());

	let createDialog: HTMLDialogElement;
	let creating = $state(false);
	let newName = $state('');
	let newDescription = $state('');
	let selectedFeatureId = $state<string>('');
	let createError = $state<string | null>(null);

	let editDialog: HTMLDialogElement;
	let editing = $state(false);
	let editingWorkspace = $state<Workspace | null>(null);
	let editName = $state('');
	let editDescription = $state('');
	let editFeatureId = $state<string>('');
	let editError = $state<string | null>(null);

	let deleteDialog: HTMLDialogElement;
	let deleting = $state(false);
	let deletingWorkspace = $state<Workspace | null>(null);
	let deleteConfirmationName = $state('');
	let deleteError = $state<string | null>(null);

	onMount(async () => {
		if (!orgId) {
			loadError = 'Organization ID is required';
			loading = false;
			return;
		}

		loadError = null;
		loading = true;
		try {
			workspaces = await getWorkspacesByOrganization(orgId);
			// Load feature information for each workspace
			const featurePromises = workspaces.map(async (workspace) => {
				try {
					const feature = await getFeatureById(workspace.featureId);
					workspaceFeatures = new Map(workspaceFeatures.set(workspace.id, feature));
				} catch (error) {
					console.error(`Failed to load feature for workspace ${workspace.id}:`, error);
				}
			});
			await Promise.all(featurePromises);
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to load workspaces';
		} finally {
			loading = false;
		}
	});

	async function loadFeatures() {
		featuresError = null;
		featuresLoading = true;
		try {
			features = await getFeatures();
		} catch (error) {
			featuresError = error instanceof Error ? error.message : 'Failed to load features';
		} finally {
			featuresLoading = false;
		}
	}

	async function openCreate() {
		newName = '';
		newDescription = '';
		selectedFeatureId = '';
		createError = null;
		creating = true;
		await loadFeatures();
		createDialog?.showModal();
	}

	function closeCreate() {
		creating = false;
		createDialog?.close();
	}

	async function handleCreateWorkspace() {
		const name = newName.trim();
		const description = newDescription.trim();
		if (!name || !description) {
			createError = 'Name and description are required.';
			return;
		}

		if (!selectedFeatureId) {
			createError = 'Please select one feature for this workspace.';
			return;
		}

		if (!orgId) {
			createError = 'Organization ID is required.';
			return;
		}

		createError = null;
		try {
			const workspace = await createWorkspace(orgId, {
				name,
				description,
				featureId: selectedFeatureId
			});
			workspaces = [...workspaces, workspace];
			// Load feature info for the new workspace
			try {
				const feature = await getFeatureById(workspace.featureId);
				workspaceFeatures = new Map(workspaceFeatures.set(workspace.id, feature));
			} catch (error) {
				console.error(`Failed to load feature for new workspace:`, error);
			}
			closeCreate();
		} catch (error) {
			createError = error instanceof Error ? error.message : 'Failed to create workspace';
		}
	}

	function navigateToWorkspace(workspace: Workspace) {
		const feature = workspaceFeatures.get(workspace.id);
		if (!feature) {
			console.error('Feature not found for workspace', workspace.id);
			return;
		}

		const featureName = feature.name.toLowerCase().trim();
		const normalizedName = featureName.replace(/\s+/g, '-');

		// Route based on feature name - check for location tracker variants
		if (
			featureName === 'location tracker' ||
			featureName === 'location-tracker' ||
			normalizedName === 'location-tracker'
		) {
			goto(resolve(`/dashboard/location-tracker/${workspace.id}`));
		} else {
			// Generic feature workspace route for other features
			goto(resolve(`/dashboard/workspace/${workspace.id}?feature=${encodeURIComponent(normalizedName)}`));
		}
	}

	async function openEdit(workspace: Workspace, event: MouseEvent) {
		event.stopPropagation();
		editingWorkspace = workspace;
		editName = workspace.name;
		editDescription = workspace.description;
		editFeatureId = workspace.featureId;
		editError = null;
		editing = true;
		await loadFeatures();
		editDialog?.showModal();
	}

	function closeEdit() {
		editing = false;
		editingWorkspace = null;
		editName = '';
		editDescription = '';
		editFeatureId = '';
		editError = null;
		editDialog?.close();
	}

	async function handleUpdateWorkspace() {
		if (!editingWorkspace) return;

		const name = editName.trim();
		const description = editDescription.trim();
		if (!name || !description) {
			editError = 'Name and description are required.';
			return;
		}

		if (!editFeatureId) {
			editError = 'Please select one feature for this workspace.';
			return;
		}

		editError = null;
		try {
			const updated = await updateWorkspace(editingWorkspace.id, {
				name,
				description,
				featureId: editFeatureId
			});
			workspaces = workspaces.map(ws => ws.id === updated.id ? updated : ws);
			// Update feature info for the updated workspace
			try {
				const feature = await getFeatureById(updated.featureId);
				workspaceFeatures = new Map(workspaceFeatures.set(updated.id, feature));
			} catch (error) {
				console.error(`Failed to load feature for updated workspace:`, error);
			}
			closeEdit();
		} catch (error) {
			editError = error instanceof Error ? error.message : 'Failed to update workspace';
		}
	}

	function openDelete(workspace: Workspace, event: MouseEvent) {
		event.stopPropagation();
		deletingWorkspace = workspace;
		deleteConfirmationName = '';
		deleteError = null;
		deleting = false;
		deleteDialog?.showModal();
	}

	function closeDelete() {
		deleting = false;
		deletingWorkspace = null;
		deleteConfirmationName = '';
		deleteError = null;
		deleteDialog?.close();
	}

	async function handleDeleteWorkspace() {
		if (!deletingWorkspace) return;

		if (deleteConfirmationName !== deletingWorkspace.name) {
			deleteError = 'Name does not match. Please type the workspace name to confirm.';
			return;
		}

		deleteError = null;
		deleting = true;
		try {
			await deleteWorkspace(deletingWorkspace.id);
			workspaces = workspaces.filter(ws => ws.id !== deletingWorkspace!.id);
			workspaceFeatures.delete(deletingWorkspace.id);
			closeDelete();
		} catch (error) {
			deleteError = error instanceof Error ? error.message : 'Failed to delete workspace';
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Organization Workspace - Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-base-200 flex">
	<Sidebar active="organization" />

	<main class="flex-1 p-4">
		<div class="max-w-5xl mx-auto space-y-6">
			<header class="flex items-center justify-between gap-2">
				<div>
					<h1 class="text-2xl font-bold">{orgName ?? 'Workspaces'}</h1>
					<p class="text-sm text-base-content/60">
						Manage workspaces for this organization.
					</p>
				</div>
				{#if orgId}
					<button type="button" class="d-btn d-btn-primary d-btn-sm gap-2" onclick={openCreate}>
						<span class="text-lg leading-none">+</span>
						<span class="hidden sm:inline">New workspace</span>
					</button>
				{/if}
			</header>

			<dialog bind:this={createDialog} class="d-modal d-modal-middle">
				<div class="d-modal-box max-w-md space-y-4">
					<h2 class="d-card-title">Create workspace</h2>
					<div class="space-y-2">
						<label for="workspace-name" class="text-sm font-medium">Name</label>
						<input
							id="workspace-name"
							type="text"
							class="d-input d-input-bordered w-full"
							placeholder="Workspace name"
							bind:value={newName}
						/>
					</div>
					<div class="space-y-2">
						<label for="workspace-description" class="text-sm font-medium">Description</label>
						<textarea
							id="workspace-description"
							class="d-textarea d-textarea-bordered w-full"
							rows="3"
							placeholder="Short description (required)"
							bind:value={newDescription}
						></textarea>
					</div>
					<div class="space-y-2">
						<label for="workspace-feature" class="text-sm font-medium">Feature <span class="text-error">*</span></label>
						<p class="text-xs text-base-content/60">Select one feature for this workspace</p>
						{#if featuresLoading}
							<div class="flex items-center gap-2 text-sm text-base-content/70">
								<span class="d-loading d-loading-spinner d-loading-sm" aria-hidden="true"></span>
								<span>Loading features...</span>
							</div>
						{:else if featuresError}
							<p class="text-sm text-error">{featuresError}</p>
						{:else}
							<select
								id="workspace-feature"
								class="d-select d-select-bordered w-full"
								bind:value={selectedFeatureId}
								required
							>
								<option value="">Select a feature</option>
								{#each features as feature (feature.id)}
									<option value={feature.id}>{feature.name}</option>
								{/each}
							</select>
						{/if}
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
							onclick={handleCreateWorkspace}
							disabled={!newName.trim() || !newDescription.trim() || !selectedFeatureId}
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
					<h2 class="d-card-title">Edit workspace</h2>
					<div class="space-y-2">
						<label for="edit-workspace-name" class="text-sm font-medium">Name</label>
						<input
							id="edit-workspace-name"
							type="text"
							class="d-input d-input-bordered w-full"
							placeholder="Workspace name"
							bind:value={editName}
						/>
					</div>
					<div class="space-y-2">
						<label for="edit-workspace-description" class="text-sm font-medium">Description</label>
						<textarea
							id="edit-workspace-description"
							class="d-textarea d-textarea-bordered w-full"
							rows="3"
							placeholder="Short description (required)"
							bind:value={editDescription}
						></textarea>
					</div>
					<div class="space-y-2">
						<label for="edit-workspace-feature" class="text-sm font-medium">Feature <span class="text-error">*</span></label>
						<p class="text-xs text-base-content/60">Select one feature for this workspace</p>
						{#if featuresLoading}
							<div class="flex items-center gap-2 text-sm text-base-content/70">
								<span class="d-loading d-loading-spinner d-loading-sm" aria-hidden="true"></span>
								<span>Loading features...</span>
							</div>
						{:else if featuresError}
							<p class="text-sm text-error">{featuresError}</p>
						{:else}
							<select
								id="edit-workspace-feature"
								class="d-select d-select-bordered w-full"
								bind:value={editFeatureId}
								required
							>
								<option value="">Select a feature</option>
								{#each features as feature (feature.id)}
									<option value={feature.id}>{feature.name}</option>
								{/each}
							</select>
						{/if}
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
							onclick={handleUpdateWorkspace}
							disabled={!editName.trim() || !editDescription.trim() || !editFeatureId}
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
					<h2 class="d-card-title">Delete workspace</h2>
					{#if deletingWorkspace}
						<p class="text-sm text-base-content/70">
							Are you sure you want to delete <strong>{deletingWorkspace.name}</strong>? This action cannot be undone.
						</p>
						<p class="text-sm text-base-content/60 mt-2">
							Type <strong>{deletingWorkspace.name}</strong> to confirm:
						</p>
						<input
							type="text"
							class="d-input d-input-bordered w-full"
							placeholder="Type workspace name to confirm"
							bind:value={deleteConfirmationName}
							disabled={deleting}
							onkeydown={(e) => {
								if (e.key === 'Enter' && deleteConfirmationName === deletingWorkspace?.name && !deleting) {
									handleDeleteWorkspace();
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
							onclick={handleDeleteWorkspace}
							disabled={deleting || deleteConfirmationName !== deletingWorkspace?.name}
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
						<span>Loading workspaces...</span>
					</div>
				{:else if loadError}
					<div class="d-alert d-alert-error">
						<span>{loadError}</span>
					</div>
				{:else if !orgId}
					<div class="d-alert d-alert-warning">
						<span>Organization ID is required to view workspaces.</span>
					</div>
				{:else if workspaces.length === 0}
					<div class="text-sm text-base-content/70">
						No workspaces yet. Create one to get started.
					</div>
				{:else}
					<div class="grid gap-4 md:grid-cols-2">
						{#each workspaces as workspace (workspace.id)}
							<div
								class="d-card bg-base-100 shadow-md hover:bg-base-200 transition-colors"
							>
								<div class="d-card-body">
									<div class="flex items-start justify-between gap-2">
										<div
											class="flex-1 cursor-pointer"
											role="button"
											tabindex="0"
											onclick={() => navigateToWorkspace(workspace)}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													navigateToWorkspace(workspace);
												}
											}}
										>
											<h3 class="d-card-title">{workspace.name}</h3>
											{#if workspace.description}
												<p class="text-sm text-base-content/70">
													{workspace.description}
												</p>
											{/if}
											{#if workspaceFeatures.get(workspace.id)}
												<p class="text-xs text-base-content/50 mt-2">
													Feature: {workspaceFeatures.get(workspace.id)?.name}
												</p>
											{/if}
										</div>
										<div class="flex gap-1">
											<button
												type="button"
												class="d-btn d-btn-sm d-btn-ghost"
												onclick={(e) => openEdit(workspace, e)}
												title="Edit workspace"
											>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
											</button>
											<button
												type="button"
												class="d-btn d-btn-sm d-btn-ghost text-error"
												onclick={(e) => openDelete(workspace, e)}
												title="Delete workspace"
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


