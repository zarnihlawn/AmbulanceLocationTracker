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
	import { getLocationTrackerDeviceById } from '$lib/utils/location-tracker-device';
	import { getWorkspaceById } from '$lib/utils/workspace';
	import { getOrganizationById } from '$lib/utils/organization';
	import { getLocationTrackerTasksByDeviceId, createLocationTrackerTask, deleteLocationTrackerTask } from '$lib/utils/location-tracker-task';
	import type { LocationTrackerTask, CreateLocationTrackerTaskPayload } from '$lib/types/location-tracker-task';

	const { data } = $props();
	const deviceId = $derived(data.deviceId as string);
	const workspaceId = $derived(data.workspaceId as string);

	// Load data client-side
	let device = $state<LocationTrackerDevice | null>(null);
	let workspace = $state<Workspace | null>(null);
	let organization = $state<Organization | null>(null);

	let currentLocation = $state<{ latitude: number; longitude: number; timestamp: string } | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let map = $state<google.maps.Map | null>(null);
	let marker: google.maps.marker.AdvancedMarkerElement | null = null;
	let targetMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
	let routePolylines: google.maps.Polyline[] = [];
	let mapContainer: HTMLDivElement;
	let pollingInterval: ReturnType<typeof setInterval> | null = null;
	let taskPollingInterval: ReturnType<typeof setInterval> | null = null;
	const POLLING_INTERVAL_MS = 5000; // Poll every 5 seconds
	const TASK_POLLING_INTERVAL_MS = 10000; // Poll tasks every 10 seconds

	// Task management
	let tasks = $state<LocationTrackerTask[]>([]);
	let showTaskModal = $state(false);
	let taskType = $state<'text' | 'location'>('text');
	let taskTitle = $state('');
	let taskDescription = $state('');
	let taskTargetLat = $state('');
	let taskTargetLng = $state('');
	let creatingTask = $state(false);
	let loadingTasks = $state(false);

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

	// Reactive effect to update map when location changes
	$effect(() => {
		if (map && currentLocation) {
			// Always update marker - create if it doesn't exist
			updateMarker(currentLocation.latitude, currentLocation.longitude, true);
		}
	});

	// Reactive effect to update routes when tasks change
	$effect(() => {
		if (map && tasks.length > 0 && currentLocation) {
			updateRoutes();
		}
	});

	// Reactive effect to update routes when location changes
	$effect(() => {
		if (map && currentLocation && tasks.some(t => t.status === 'accepted' && t.type === 'location')) {
			updateRoutes();
		}
	});

	onMount(async () => {
		// Load device, workspace, and organization data first
		try {
			device = await getLocationTrackerDeviceById(deviceId);
			if (!device) {
				error = 'Device not found';
				loading = false;
				return;
			}

			// Load workspace and organization
			if (device.workspaceId) {
				try {
					workspace = await getWorkspaceById(device.workspaceId);
					if (workspace?.organizationId) {
						try {
							organization = await getOrganizationById(workspace.organizationId);
						} catch (err) {
							console.error('[Frontend] Failed to load organization:', err);
						}
					}
				} catch (err) {
					console.error('[Frontend] Failed to load workspace:', err);
				}
			}
		} catch (err) {
			console.error('[Frontend] Failed to load device data:', err);
			error = 'Failed to load device information';
			loading = false;
			return;
		}

		// Load Google Maps script with geometry library for route decoding
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

		// Load initial location first
		await loadLatestLocation();

		// If we have a location, ensure map centers on it after initialization
		if (currentLocation && map) {
			setTimeout(() => {
				if (map) {
					map.panTo({ lat: currentLocation.latitude, lng: currentLocation.longitude });
				}
			}, 200);
		}

		// Start polling for location updates
		startLocationPolling();

		// Load tasks
		await loadTasks();

		// Start polling for task updates
		startTaskPolling();

		loading = false;
	});

	onDestroy(() => {
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
		if (taskPollingInterval) {
			clearInterval(taskPollingInterval);
			taskPollingInterval = null;
		}
		// Clean up markers when component is destroyed
		if (marker) {
			marker.map = null;
			marker = null;
		}
		// Clean up target markers
		targetMarkers.forEach(m => {
			if (m) {
				m.map = null;
			}
		});
		targetMarkers = [];
		// Clean up route polylines
		routePolylines.forEach(polyline => {
			if (polyline) {
				polyline.setMap(null);
			}
		});
		routePolylines = [];
		// Clean up map
		if (map) {
			// Google Maps doesn't require explicit cleanup, but we can null it
			map = null;
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
				// Initial load - don't animate, just set position
				updateMarker(currentLocation.latitude, currentLocation.longitude, false);
				// Then smoothly center on it
				setTimeout(() => {
					if (map) {
						map.panTo({ lat: currentLocation.latitude, lng: currentLocation.longitude });
					}
				}, 100);
			}
		} catch (err) {
			console.error('[Frontend] Error initializing map:', err);
			error = `Failed to initialize Google Map: ${err instanceof Error ? err.message : 'Unknown error'}`;
		}
	}

	function updateMarker(lat: number, lng: number, animate: boolean = true) {
		if (!map || typeof window === 'undefined' || !(window as any).google) {
			return;
		}

		const google = (window as any).google;
		const position = { lat, lng };

		// Always ensure marker exists - recreate if needed
		if (!marker) {
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
		} else {
			// Update existing marker position
			marker.position = position;
		}

		// Smoothly animate camera to marker position
		if (animate) {
			map.panTo(position);
		} else {
			map.setCenter(position);
		}
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
					const previousLocation = currentLocation;
					currentLocation = {
						latitude: location.latitude,
						longitude: location.longitude,
						timestamp: location.createdAt,
					};

					if (map) {
						// Always update marker and smoothly animate camera to new location
						updateMarker(location.latitude, location.longitude, true);

						// If this is a significant move, also adjust zoom slightly for better visibility
						if (previousLocation) {
							const distance = calculateDistance(
								previousLocation.latitude,
								previousLocation.longitude,
								location.latitude,
								location.longitude
							);

							// If moved more than 100 meters, ensure good zoom level
							if (distance > 100) {
								const currentZoom = map.getZoom() || 15;
								if (currentZoom < 14) {
									map.setZoom(15);
								}
							}
						}
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

	function startTaskPolling() {
		if (!device?.id) {
			return;
		}

		// Clear any existing interval
		if (taskPollingInterval) {
			clearInterval(taskPollingInterval);
		}

		// Poll for task updates
		taskPollingInterval = setInterval(async () => {
			await loadTasks();
		}, TASK_POLLING_INTERVAL_MS);
	}

	/**
	 * Calculate distance between two coordinates in meters using Haversine formula
	 */
	function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
		const R = 6371e3; // Earth's radius in meters
		const φ1 = (lat1 * Math.PI) / 180;
		const φ2 = (lat2 * Math.PI) / 180;
		const Δφ = ((lat2 - lat1) * Math.PI) / 180;
		const Δλ = ((lon2 - lon1) * Math.PI) / 180;

		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c; // Distance in meters
	}

	async function loadTasks() {
		if (!device?.id) return;

		loadingTasks = true;
		try {
			tasks = await getLocationTrackerTasksByDeviceId(device.id);
		} catch (err) {
			console.error('[Frontend] Error loading tasks:', err);
		} finally {
			loadingTasks = false;
		}
	}

	function openTaskModal(type: 'text' | 'location' = 'text') {
		taskType = type;
		taskTitle = '';
		taskDescription = '';
		taskTargetLat = '';
		taskTargetLng = '';

		// If location type and we have current location, pre-fill
		if (type === 'location' && currentLocation) {
			taskTargetLat = currentLocation.latitude.toString();
			taskTargetLng = currentLocation.longitude.toString();
		}

		showTaskModal = true;
	}

	function closeTaskModal() {
		showTaskModal = false;
		taskTitle = '';
		taskDescription = '';
		taskTargetLat = '';
		taskTargetLng = '';
	}

	async function handleCreateTask() {
		if (!device?.id || !taskTitle.trim()) {
			error = 'Task title is required';
			return;
		}

		if (taskType === 'location' && (!taskTargetLat || !taskTargetLng)) {
			error = 'Target location is required for location tasks';
			return;
		}

		creatingTask = true;
		try {
			const payload: CreateLocationTrackerTaskPayload = {
				deviceId: device.id,
				type: taskType,
				title: taskTitle.trim(),
				description: taskDescription.trim() || undefined,
			};

			if (taskType === 'location') {
				payload.targetLatitude = taskTargetLat;
				payload.targetLongitude = taskTargetLng;
			}

			await createLocationTrackerTask(payload);
			await loadTasks();
			closeTaskModal();
		} catch (err) {
			console.error('[Frontend] Error creating task:', err);
			error = err instanceof Error ? err.message : 'Failed to create task';
		} finally {
			creatingTask = false;
		}
	}

	async function handleDeleteTask(taskId: string) {
		if (!confirm('Are you sure you want to delete this task?')) {
			return;
		}

		try {
			await deleteLocationTrackerTask(taskId);
			await loadTasks();
		} catch (err) {
			console.error('[Frontend] Error deleting task:', err);
			error = err instanceof Error ? err.message : 'Failed to delete task';
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'pending':
				return 'badge-warning';
			case 'accepted':
				return 'badge-success';
			case 'rejected':
				return 'badge-error';
			case 'na':
				return 'badge-info';
			case 'completed':
				return 'badge-success';
			default:
				return 'badge-ghost';
		}
	}

	function formatDate(dateString: string | null) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleString();
	}

	/**
	 * Decode Google Maps encoded polyline string to array of LatLng objects
	 */
	function decodePolyline(encoded: string): google.maps.LatLngLiteral[] {
		const poly: google.maps.LatLngLiteral[] = [];
		let index = 0;
		const len = encoded.length;
		let lat = 0;
		let lng = 0;

		while (index < len) {
			let b: number;
			let shift = 0;
			let result = 0;
			do {
				b = encoded.charCodeAt(index++) - 63;
				result = result | ((b & 0x1f) << shift);
				shift += 5;
			} while (b >= 0x20);
			const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
			lat += dlat;

			shift = 0;
			result = 0;
			do {
				b = encoded.charCodeAt(index++) - 63;
				result = result | ((b & 0x1f) << shift);
				shift += 5;
			} while (b >= 0x20);
			const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
			lng += dlng;

			poly.push({ lat: lat / 1e5, lng: lng / 1e5 });
		}

		return poly;
	}

	async function updateRoutes() {
		if (!map || !currentLocation || typeof window === 'undefined' || !(window as any).google) {
			return;
		}

		const google = (window as any).google;

		// Clear existing routes and target markers
		routePolylines.forEach(polyline => {
			if (polyline) {
				polyline.setMap(null);
			}
		});
		routePolylines = [];

		targetMarkers.forEach(m => {
			if (m) {
				m.map = null;
			}
		});
		targetMarkers = [];

		// Get accepted location tasks
		const acceptedLocationTasks = tasks.filter(
			t => t.status === 'accepted' && t.type === 'location' && t.targetLatitude && t.targetLongitude
		);

		if (acceptedLocationTasks.length === 0) {
			return;
		}

		// Process each accepted location task
		for (const task of acceptedLocationTasks) {
			try {
				const targetLat = parseFloat(task.targetLatitude!);
				const targetLng = parseFloat(task.targetLongitude!);

				if (isNaN(targetLat) || isNaN(targetLng)) {
					continue;
				}

				// Add target marker
				const targetPinElement = new google.maps.marker.PinElement({
					background: '#EA4335',
					borderColor: '#C5221F',
					glyphColor: '#FFFFFF',
					scale: 1.2,
				});

				const targetMarker = new google.maps.marker.AdvancedMarkerElement({
					map,
					position: { lat: targetLat, lng: targetLng },
					title: `Target: ${task.title}`,
					content: targetPinElement.element,
				});
				targetMarkers.push(targetMarker);

				// Fetch routes from Google Directions API
				const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
				const destination = `${targetLat},${targetLng}`;
				const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;

				const response = await fetch(url);
				const data = await response.json();

				if (data.status === 'OK' && data.routes && data.routes.length > 0) {
					const routes = data.routes.slice(0, 5); // Max 5 routes
					const routeDistances = routes.map((r: any) => r.legs[0].distance.value);
					const minDistance = Math.min(...routeDistances);
					const maxDistance = Math.max(...routeDistances);

					routes.forEach((route: any, index: number) => {
						const routePath = route.overview_polyline.points;
						// Decode polyline manually (since geometry library encoding may not be available)
						const decodedPath = decodePolyline(routePath);

						const distance = route.legs[0].distance.value;
						const ratio = maxDistance > minDistance
							? (distance - minDistance) / (maxDistance - minDistance)
							: 0;

						// Color gradient: Green -> Yellow -> Orange -> Red
						let color: string;
						if (routes.length === 1) {
							color = '#4CAF50'; // Green for single route
						} else {
							if (ratio <= 0.33) {
								// Green to Yellow
								const localRatio = ratio / 0.33;
								const r = Math.round(76 + (255 - 76) * localRatio);
								const g = Math.round(175 + (235 - 175) * localRatio);
								const b = Math.round(80 + (59 - 80) * localRatio);
								color = `rgb(${r}, ${g}, ${b})`;
							} else if (ratio <= 0.66) {
								// Yellow to Orange
								const localRatio = (ratio - 0.33) / 0.33;
								const r = 255;
								const g = Math.round(235 + (152 - 235) * localRatio);
								const b = Math.round(59 + (0 - 59) * localRatio);
								color = `rgb(${r}, ${g}, ${b})`;
							} else {
								// Orange to Red
								const localRatio = (ratio - 0.66) / 0.34;
								const r = Math.round(255 + (244 - 255) * localRatio);
								const g = Math.round(152 + (67 - 152) * localRatio);
								const b = Math.round(0 + (54 - 0) * localRatio);
								color = `rgb(${r}, ${g}, ${b})`;
							}
						}

						const polyline = new google.maps.Polyline({
							path: decodedPath,
							geodesic: true,
							strokeColor: color,
							strokeOpacity: 0.8,
							strokeWeight: 6,
							map: map,
						});

						routePolylines.push(polyline);
					});

					// Adjust camera to show both origin and destination
					const bounds = new google.maps.LatLngBounds();
					bounds.extend({ lat: currentLocation.latitude, lng: currentLocation.longitude });
					bounds.extend({ lat: targetLat, lng: targetLng });
					map.fitBounds(bounds, { padding: 50 });
				}
			} catch (err) {
				console.error('[Frontend] Error loading routes for task:', err);
			}
		}
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

			<!-- Tasks Section - Below Map -->
			<div class="d-card bg-base-100 shadow-md">
				<div class="d-card-body">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-xl font-bold">Tasks</h2>
						<div class="flex gap-2">
							<button
								type="button"
								class="d-btn d-btn-primary d-btn-sm"
								onclick={() => openTaskModal('text')}
							>
								+ Text Task
							</button>
							<button
								type="button"
								class="d-btn d-btn-primary d-btn-sm"
								onclick={() => openTaskModal('location')}
							>
								+ Location Task
							</button>
						</div>
					</div>

					{#if loadingTasks}
						<div class="flex justify-center py-8">
							<span class="d-loading d-loading-spinner d-loading-md"></span>
						</div>
					{:else if tasks.length === 0}
						<p class="text-sm text-base-content/70 text-center py-8">No tasks assigned yet.</p>
					{:else}
						<div class="space-y-3">
							{#each tasks as task (task.id)}
								<div class="border border-base-300 rounded-lg p-4 {task.status === 'completed' ? 'bg-success/10' : task.status === 'rejected' ? 'bg-error/10' : task.status === 'accepted' ? 'bg-primary/10' : ''}">
									<div class="flex items-start justify-between gap-4">
										<div class="flex-1">
											<div class="flex items-center gap-2 mb-2">
												<span class="d-badge {getStatusColor(task.status)}">{task.status}</span>
												<span class="d-badge d-badge-outline">{task.type}</span>
												<h3 class="font-semibold">{task.title}</h3>
											</div>
											{#if task.description}
												<p class="text-sm text-base-content/70 mb-2">{task.description}</p>
											{/if}
											{#if task.type === 'location' && task.targetLatitude && task.targetLongitude}
												<div class="text-xs text-primary mb-2 font-medium">
													📍 Target: {parseFloat(task.targetLatitude).toFixed(6)}, {parseFloat(task.targetLongitude).toFixed(6)}
													{#if task.status === 'accepted'}
														<span class="ml-2 text-success">(Routes shown on map)</span>
													{/if}
												</div>
											{/if}
											{#if task.responseMessage}
												<div class="text-sm text-base-content/70 italic mb-2">
													Response: {task.responseMessage}
												</div>
											{/if}
											<div class="text-xs text-base-content/50">
												Created: {formatDate(task.createdAt)}
												{#if task.respondedAt}
													| Responded: {formatDate(task.respondedAt)}
												{/if}
												{#if task.completedAt}
													| Completed: {formatDate(task.completedAt)}
												{/if}
											</div>
										</div>
										<button
											type="button"
											class="d-btn d-btn-ghost d-btn-sm d-btn-square"
											onclick={() => handleDeleteTask(task.id)}
											title="Delete task"
										>
											🗑️
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>

<!-- Task Creation Modal -->
{#if showTaskModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={closeTaskModal}>
		<div class="d-card bg-base-100 shadow-xl max-w-md w-full mx-4" onclick={(e) => e.stopPropagation()}>
			<div class="d-card-body">
				<h3 class="d-card-title mb-4">
					Create {taskType === 'location' ? 'Location' : 'Text'} Task
				</h3>

				<div class="space-y-4">
					<div>
						<label for="task-title" class="d-label">
							<span class="d-label-text">Title *</span>
						</label>
						<input
							id="task-title"
							type="text"
							class="d-input d-input-bordered w-full"
							bind:value={taskTitle}
							placeholder="Enter task title"
						/>
					</div>

					<div>
						<label for="task-description" class="d-label">
							<span class="d-label-text">Description</span>
						</label>
						<textarea
							id="task-description"
							class="d-textarea d-textarea-bordered w-full"
							bind:value={taskDescription}
							placeholder="Enter task description"
							rows="3"
						></textarea>
					</div>

					{#if taskType === 'location'}
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="task-lat" class="d-label">
									<span class="d-label-text">Latitude *</span>
								</label>
								<input
									id="task-lat"
									type="text"
									class="d-input d-input-bordered w-full"
									bind:value={taskTargetLat}
									placeholder="0.000000"
								/>
							</div>
							<div>
								<label for="task-lng" class="d-label">
									<span class="d-label-text">Longitude *</span>
								</label>
								<input
									id="task-lng"
									type="text"
									class="d-input d-input-bordered w-full"
									bind:value={taskTargetLng}
									placeholder="0.000000"
								/>
							</div>
						</div>
						{#if currentLocation}
							<button
								type="button"
								class="d-btn d-btn-sm d-btn-outline w-full"
								onclick={() => {
									taskTargetLat = currentLocation!.latitude.toString();
									taskTargetLng = currentLocation!.longitude.toString();
								}}
							>
								Use Current Location
							</button>
						{/if}
					{/if}

					<div class="flex gap-2 justify-end mt-6">
						<button
							type="button"
							class="d-btn d-btn-ghost"
							onclick={closeTaskModal}
							disabled={creatingTask}
						>
							Cancel
						</button>
						<button
							type="button"
							class="d-btn d-btn-primary"
							onclick={handleCreateTask}
							disabled={creatingTask || !taskTitle.trim()}
						>
							{#if creatingTask}
								<span class="d-loading d-loading-spinner d-loading-sm"></span>
								Creating...
							{:else}
								Create Task
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

