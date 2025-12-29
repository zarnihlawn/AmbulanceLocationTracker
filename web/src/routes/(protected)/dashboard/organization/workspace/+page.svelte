<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { Workspace } from '$lib/types/workspace';
	import type { Feature } from '$lib/types/feature';
	import { getWorkspacesByOrganization, createWorkspace } from '$lib/utils/workspace';
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
								role="button"
								tabindex="0"
								class="d-card bg-base-100 shadow-md cursor-pointer hover:bg-base-200 transition-colors"
								onclick={() => navigateToWorkspace(workspace)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										navigateToWorkspace(workspace);
									}
								}}
							>
								<div class="d-card-body">
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
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	</main>
</div>


