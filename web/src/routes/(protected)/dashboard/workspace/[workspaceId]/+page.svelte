<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';

	const { data } = $props();
	const workspaceId = data.workspaceId as string;
	const feature = data.feature as string | null;
</script>

<svelte:head>
	<title>{feature ? feature.charAt(0).toUpperCase() + feature.slice(1).replace(/-/g, ' ') : 'Workspace'} - Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-base-200 flex">
	<Sidebar active="organization" />

	<main class="flex-1 p-4">
		<div class="max-w-5xl mx-auto space-y-6">
			<header class="flex items-center justify-between gap-2">
				<div>
					<h1 class="text-2xl font-bold">
						{feature ? feature.charAt(0).toUpperCase() + feature.slice(1).replace(/-/g, ' ') : 'Workspace'}
					</h1>
					<p class="text-sm text-base-content/60">
						Workspace ID: {workspaceId}
					</p>
				</div>
			</header>

			<section class="min-h-[200px]">
				<div class="d-card bg-base-100 shadow-md">
					<div class="d-card-body">
						<h2 class="d-card-title">Workspace</h2>
						<p class="text-base-content/70">
							This is the workspace page for feature: {feature || 'Unknown'}
						</p>
						<p class="text-base-content/70">
							Workspace ID: {workspaceId}
						</p>
						<p class="text-sm text-base-content/50 mt-4">
							Feature-specific functionality will be implemented here.
						</p>
					</div>
				</div>
			</section>
		</div>
	</main>
</div>

