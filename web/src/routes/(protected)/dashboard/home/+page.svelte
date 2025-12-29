<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';

	const auth = getAuthContext();
	const user = $derived(auth.user);

	onMount(() => {
		// Ensure auth context is refreshed when page loads
		auth.refresh();
	});
</script>

<svelte:head>
	<title>Dashboard - Pun Hlaing Account</title>
</svelte:head>

<div class="min-h-screen bg-base-200 flex">
	<Sidebar active="home" />
	<!-- Main content -->
	<main class="flex-1 p-4">
		<div class="max-w-5xl mx-auto space-y-4">
			<div class="flex items-center justify-between gap-2">
				<div>
					<h1 class="text-2xl font-bold">Dashboard</h1>
					<p class="text-sm text-base-content/60">Home overview</p>
				</div>
			</div>

			{#if user}
				<Card
					title="Welcome, {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email}!"
				>
					<p class="text-base-content/70">
						You have successfully logged in to the Auth Server Frontend.
					</p>
					<div class="mt-4">
						<div class="d-stats d-stats-vertical sm:d-stats-horizontal shadow w-full">
							<div class="d-stat">
								<div class="d-stat-title">User ID</div>
								<div class="d-stat-value text-sm break-all">{user.id}</div>
							</div>
							<div class="d-stat">
								<div class="d-stat-title">Email</div>
								<div class="d-stat-value text-sm break-all">{user.email}</div>
							</div>
							{#if user.username}
								<div class="d-stat">
									<div class="d-stat-title">Username</div>
									<div class="d-stat-value text-sm">{user.username}</div>
								</div>
							{/if}
							{#if user.level}
								<div class="d-stat">
									<div class="d-stat-title">Level</div>
									<div class="d-stat-value">{user.level}</div>
								</div>
							{/if}
						</div>
					</div>
				</Card>
			{:else}
				<Card title="Loading...">
					<div class="flex justify-center">
						<span class="d-loading d-loading-spinner d-loading-lg"></span>
					</div>
				</Card>
			{/if}
		</div>
	</main>
</div>


