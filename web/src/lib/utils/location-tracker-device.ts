import { fetchWithAuth } from '$lib/utils/api';
import type {
	CreateLocationTrackerDeviceWithSecretKeyPayload,
	AcceptLocationTrackerDevicePayload,
	UpdateLocationTrackerDevicePayload,
	LocationTrackerDevice
} from '$lib/types/location-tracker-device';

const LOCATION_TRACKER_DEVICE_ENDPOINT = '/api/location-tracker-device';

export async function getLocationTrackerDevicesByWorkspaceId(
	workspaceId: string
): Promise<LocationTrackerDevice[]> {
	const response = await fetchWithAuth(
		`${LOCATION_TRACKER_DEVICE_ENDPOINT}/workspaceId/${workspaceId}`,
		{
			method: 'GET'
		}
	);

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err?.error || err?.message || 'Failed to load devices');
	}

	return response.json();
}

export async function createLocationTrackerDeviceWithSecretKey(
	data: CreateLocationTrackerDeviceWithSecretKeyPayload
): Promise<LocationTrackerDevice> {
	const response = await fetchWithAuth(`${LOCATION_TRACKER_DEVICE_ENDPOINT}/with-secret-key`, {
		method: 'POST',
		body: JSON.stringify(data)
	});

	const json = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(json?.error || json?.message || 'Failed to create device');
	}

	return json as LocationTrackerDevice;
}

export async function acceptLocationTrackerDevice(
	deviceId: string,
	data: AcceptLocationTrackerDevicePayload
): Promise<LocationTrackerDevice> {
	const response = await fetchWithAuth(`${LOCATION_TRACKER_DEVICE_ENDPOINT}/${deviceId}/accept`, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});

	const json = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(json?.error || json?.message || 'Failed to accept device');
	}

	return json as LocationTrackerDevice;
}

export async function updateLocationTrackerDevice(
	deviceId: string,
	data: UpdateLocationTrackerDevicePayload
): Promise<LocationTrackerDevice> {
	const response = await fetchWithAuth(`${LOCATION_TRACKER_DEVICE_ENDPOINT}/${deviceId}`, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});

	const json = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(json?.error || json?.message || 'Failed to update device');
	}

	return json as LocationTrackerDevice;
}

export async function deleteLocationTrackerDevice(
	deviceId: string
): Promise<void> {
	const response = await fetchWithAuth(`${LOCATION_TRACKER_DEVICE_ENDPOINT}/${deviceId}`, {
		method: 'DELETE'
	});

	if (!response.ok) {
		const json = await response.json().catch(() => ({}));
		throw new Error(json?.error || json?.message || 'Failed to delete device');
	}
}

export async function getLocationTrackerDeviceById(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<LocationTrackerDevice | null> {
	const response = await fetchWithAuth(`${LOCATION_TRACKER_DEVICE_ENDPOINT}/${id}`, {
		method: 'GET'
	}, fetchFn);

	if (!response.ok) {
		if (response.status === 404) {
			return null; // Device not found - return null instead of throwing
		}
		const err = await response.json().catch(() => ({}));
		const errorMessage = err?.error || err?.message || 'Failed to load device';
		throw new Error(`Location Tracker Device with id ${id} not found: ${errorMessage}`);
	}

	return response.json();
}

