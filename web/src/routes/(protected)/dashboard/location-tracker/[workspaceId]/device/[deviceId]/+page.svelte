<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { LocationTrackerDevice } from '$lib/types/location-tracker-device';
	import type { Workspace } from '$lib/types/workspace';
	import type { Organization } from '$lib/types/organization';
	import { API_ENDPOINTS } from '$lib/config/api';
	import { fetchWithAuth } from '$lib/utils/api';

	const { data } = $props();
	const deviceId = $derived(data.deviceId as string);
	const workspaceId = $derived(data.workspaceId as string);
	const device = $derived(data.device as LocationTrackerDevice | null);
	const workspace = $derived(data.workspace as Workspace | null);
	const organization = $derived(data.organization as Organization | null);

	let currentLocation = $state<{ latitude: number; longitude: number; timestamp: string } | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let map = $state<google.maps.Map | null>(null);
	let marker: google.maps.marker.AdvancedMarkerElement | null = null;
	let mapContainer: HTMLDivElement;
	let pollingInterval: ReturnType<typeof setInterval> | null = null;
	const POLLING_INTERVAL_MS = 5000; // Poll every 5 seconds

	// Google Maps API Key (use VITE_GOOGLE_MAPS_API_KEY environment variable)
	const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
	
	// Declare google types
	declare global {
		interface Window {
			google: typeof google;
		}
	}

		// Reactive effect to initialize map when container is available
		$effect(() => {
			if (mapContainer && !map && typeof window !== 'undefined' && (window as any).google?.maps) {
				// Use setTimeout to ensure DOM is fully ready
				setTimeout(() => {
					initMap();
				}, 50);
			}
		});

	onMount(async () => {
		if (!device?.id) {
			error = 'Device not found';
			loading = false;
			return;
		}

		// Load Google Maps script
		try {
			await loadGoogleMaps();
		} catch (err) {
			error = 'Failed to load Google Maps. Please check your API key configuration.';
			loading = false;
			console.error('[Frontend] Google Maps loading error:', err);
			return;
		}

		// Wait for DOM to be ready
		await tick();

		// Try to initialize map if container is already available
		if (mapContainer && !map) {
			initMap();
		}

		// Load initial location
		await loadLatestLocation();

		// Start polling for location updates
		startLocationPolling();

		loading = false;
	});

	onDestroy(() => {
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
	});

	function loadGoogleMaps(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!GOOGLE_MAPS_API_KEY) {
				const error = 'Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.';
				console.error('[Frontend]', error);
				reject(new Error(error));
				return;
			}

			// Check if Google Maps is already loaded and ready
			const google = (window as any).google;
			if (typeof window !== 'undefined' && google && google.maps && typeof google.maps.Map === 'function' &&
				google.maps.marker && typeof google.maps.marker.AdvancedMarkerElement === 'function') {
				resolve();
				return;
			}

			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async`;
			script.async = true;
			script.defer = true;
			
			script.onload = () => {
				// Wait for Google Maps to be fully initialized
				const checkReady = () => {
					const google = (window as any).google;
					if (google && google.maps && typeof google.maps.Map === 'function' && 
						google.maps.marker && typeof google.maps.marker.AdvancedMarkerElement === 'function') {
						resolve();
					} else {
						setTimeout(checkReady, 50);
					}
				};
				checkReady();
			};
			
			script.onerror = (error) => {
				console.error('[Frontend] Failed to load Google Maps script:', error);
				reject(new Error('Failed to load Google Maps'));
			};
			
			document.head.appendChild(script);
		});
	}

	function initMap() {
		if (typeof window === 'undefined') {
			console.error('[Frontend] Window is undefined');
			return;
		}

		const google = (window as any).google;
		
		// Check if Google Maps is fully loaded
		if (!google || !google.maps || typeof google.maps.Map !== 'function') {
			setTimeout(() => initMap(), 200);
			return;
		}

		// Check if AdvancedMarkerElement is available
		if (!google.maps.marker || typeof google.maps.marker.AdvancedMarkerElement !== 'function') {
			setTimeout(() => initMap(), 200);
			return;
		}

		if (!mapContainer) {
			console.error('[Frontend] Map container element not found');
			error = 'Map container not found';
			return;
		}

		// Ensure container has dimensions
		const rect = mapContainer.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) {
			setTimeout(() => initMap(), 100);
			return;
		}

		const defaultCenter = currentLocation
			? { lat: currentLocation.latitude, lng: currentLocation.longitude }
			: { lat: 16.8661, lng: 96.1951 }; // Default to Yangon, Myanmar

		try {
			// Verify Map constructor exists
			if (typeof google.maps.Map !== 'function') {
				throw new Error('google.maps.Map is not a constructor');
			}

			map = new google.maps.Map(mapContainer, {
				mapId: 'LOCATION_TRACKER_MAP', // Required for Advanced Markers
				center: defaultCenter,
				zoom: 15,
				mapTypeControl: true,
				streetViewControl: true,
				fullscreenControl: true,
			});

			// Trigger resize to ensure map renders properly
			setTimeout(() => {
				if (map && google.maps.event) {
					google.maps.event.trigger(map, 'resize');
				}
			}, 100);

			if (currentLocation) {
				updateMarker(currentLocation.latitude, currentLocation.longitude);
			}
		} catch (err) {
			console.error('[Frontend] Error initializing map:', err);
			error = `Failed to initialize Google Map: ${err instanceof Error ? err.message : 'Unknown error'}`;
		}
	}

	function updateMarker(lat: number, lng: number) {
		if (!map || typeof window === 'undefined' || !(window as any).google) {
			return;
		}
		
		const google = (window as any).google;
		const position = { lat, lng };

		if (marker) {
			marker.position = position;
		} else {
			// Create a pin element for the marker
			const pinElement = new google.maps.marker.PinElement({
				background: '#4285F4',
				borderColor: '#1976D2',
				glyphColor: '#FFFFFF',
				scale: 1.2,
			});

			marker = new google.maps.marker.AdvancedMarkerElement({
				map,
				position,
				title: device?.name || 'Device Location',
				content: pinElement.element,
			});
		}

		// Center map on marker
		map.setCenter(position);
	}

	async function loadLatestLocation() {
		if (!device?.id) {
			console.warn('[Frontend] Cannot load latest location: device ID is missing');
			return;
		}

		try {
			const url = `${API_ENDPOINTS.locationTrackerTracking}/device/${device.id}/latest`;
			const response = await fetchWithAuth(url);

			if (response.ok) {
				const location = await response.json();
				
				// Only update if location has changed
				const hasChanged = !currentLocation || 
					currentLocation.latitude !== location.latitude || 
					currentLocation.longitude !== location.longitude ||
					currentLocation.timestamp !== location.createdAt;
				
				if (hasChanged) {
					currentLocation = {
						latitude: location.latitude,
						longitude: location.longitude,
						timestamp: location.createdAt,
					};
					
					if (map) {
						updateMarker(location.latitude, location.longitude);
					}
				}
			} else if (response.status === 404) {
				// No location data yet - this is normal for new devices
			}
		} catch (err) {
			console.error('[Frontend] Error loading latest location:', err);
		}
	}

	function startLocationPolling() {
		if (!device?.id) {
			return;
		}

		// Clear any existing interval
		if (pollingInterval) {
			clearInterval(pollingInterval);
		}

		// Poll for location updates
		pollingInterval = setInterval(async () => {
			await loadLatestLocation();
		}, POLLING_INTERVAL_MS);
	}
</script>

<svelte:head>
	<title>Device Location - Location Tracker</title>
</svelte:head>

<div class="min-h-screen bg-base-200 flex">
	<Sidebar active="organization" />

	<main class="flex-1 p-4">
		<div class="max-w-7xl mx-auto space-y-6">
			<header class="flex items-center justify-between gap-2">
				<div>
					<h1 class="text-2xl font-bold">Device Location</h1>
					{#if organization && workspace && device}
						<p class="text-sm text-base-content/60">
							{organization.name} / {workspace.name} / {device.name || 'Device'}
						</p>
					{:else}
						<p class="text-sm text-base-content/60">Loading...</p>
					{/if}
				</div>
				<button
					type="button"
					class="d-btn d-btn-ghost d-btn-sm"
					onclick={() => goto(resolve(`/dashboard/location-tracker/${workspaceId}`))}
				>
					← Back to Devices
				</button>
			</header>

			{#if error}
				<div class="d-alert d-alert-error">
					<span>{error}</span>
				</div>
			{/if}
			
			<div class="grid gap-6 lg:grid-cols-3">
				<!-- Map Container - Always render so it can be bound -->
				<div class="lg:col-span-2">
					<div class="d-card bg-base-100 shadow-md">
						<div class="d-card-body p-0">
							<div
								bind:this={mapContainer}
								class="w-full h-[600px] rounded-lg relative overflow-hidden"
								role="img"
								aria-label="Device location map"
							>
								{#if loading || !map}
									<div class="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10 pointer-events-none">
										<div class="flex items-center gap-2 text-base-content/70">
											<span class="d-loading d-loading-spinner d-loading-md" aria-hidden="true"></span>
											<span>Loading map...</span>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Location Info -->
				<div class="space-y-4">
					<div class="d-card bg-base-100 shadow-md">
						<div class="d-card-body">
							<h3 class="d-card-title">Location Information</h3>
							{#if currentLocation}
								<div class="space-y-2 text-sm mt-4">
									<div class="flex items-center justify-between">
										<span class="text-base-content/70">Latitude:</span>
										<span class="font-mono">{currentLocation.latitude.toFixed(6)}</span>
									</div>
									<div class="flex items-center justify-between">
										<span class="text-base-content/70">Longitude:</span>
										<span class="font-mono">{currentLocation.longitude.toFixed(6)}</span>
									</div>
									<div class="flex items-center justify-between">
										<span class="text-base-content/70">Last Update:</span>
										<span class="text-xs">{new Date(currentLocation.timestamp).toLocaleString()}</span>
									</div>
								</div>
							{:else}
								<p class="text-sm text-base-content/70 mt-4">No location data available yet.</p>
							{/if}
						</div>
					</div>

					{#if device}
						<div class="d-card bg-base-100 shadow-md">
							<div class="d-card-body">
								<h3 class="d-card-title">Device Information</h3>
								<div class="space-y-2 text-sm mt-4">
									<div class="flex items-center justify-between">
										<span class="text-base-content/70">Name:</span>
										<span>{device.name || 'N/A'}</span>
									</div>
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
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>

