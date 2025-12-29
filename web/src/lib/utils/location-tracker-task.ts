import { fetchWithAuth } from '$lib/utils/api';
import type { LocationTrackerTask, CreateLocationTrackerTaskPayload } from '$lib/types/location-tracker-task';
import { API_ENDPOINTS } from '$lib/config/api';

const TASK_ENDPOINT = `${API_ENDPOINTS.locationTrackerDevice}/task`;

export async function getLocationTrackerTasksByDeviceId(
	deviceId: string
): Promise<LocationTrackerTask[]> {
	const response = await fetchWithAuth(
		`${TASK_ENDPOINT}/device/${deviceId}`,
		{
			method: 'GET'
		}
	);

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err?.error || err?.message || 'Failed to load tasks');
	}

	return response.json();
}

export async function createLocationTrackerTask(
	data: CreateLocationTrackerTaskPayload
): Promise<LocationTrackerTask> {
	const response = await fetchWithAuth(TASK_ENDPOINT, {
		method: 'POST',
		body: JSON.stringify(data)
	});

	const json = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(json?.error || json?.message || 'Failed to create task');
	}

	return json as LocationTrackerTask;
}

export async function deleteLocationTrackerTask(
	taskId: string
): Promise<void> {
	const response = await fetchWithAuth(`${TASK_ENDPOINT}/${taskId}`, {
		method: 'DELETE'
	});

	if (!response.ok) {
		const json = await response.json().catch(() => ({}));
		throw new Error(json?.error || json?.message || 'Failed to delete task');
	}
}

