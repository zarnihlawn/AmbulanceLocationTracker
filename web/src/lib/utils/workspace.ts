import { API_ENDPOINTS } from '$lib/config/api';
import { fetchWithAuth } from '$lib/utils/api';
import type {
	CreateWorkspacePayload,
	Workspace,
	UpdateWorkspacePayload
} from '$lib/types/workspace';

export async function getWorkspacesByOrganization(
	organizationId: string
): Promise<Workspace[]> {
	const response = await fetchWithAuth(
		`${API_ENDPOINTS.workspace}/organizationId/${organizationId}`,
		{
			method: 'GET'
		}
	);

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err?.error || err?.message || 'Failed to load workspaces');
	}

	return response.json();
}

export async function getWorkspaceById(id: string, fetchFn: typeof fetch = fetch): Promise<Workspace> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.workspace}/${id}`, {
		method: 'GET'
	}, fetchFn);

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err?.error || err?.message || 'Failed to load workspace');
	}

	return response.json();
}

export async function createWorkspace(
	organizationId: string,
	data: CreateWorkspacePayload
): Promise<Workspace> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.workspace}/`, {
		method: 'POST',
		body: JSON.stringify({
			...data,
			organizationId
		})
	});

	const json = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(json?.error || json?.message || 'Failed to create workspace');
	}

	return json as Workspace;
}

export async function updateWorkspace(
	id: string,
	data: UpdateWorkspacePayload
): Promise<Workspace> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.workspace}/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});

	const json = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(json?.error || json?.message || 'Failed to update workspace');
	}

	return json as Workspace;
}

export async function deleteWorkspace(id: string): Promise<void> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.workspace}/${id}`, {
		method: 'DELETE'
	});

	if (!response.ok) {
		const json = await response.json().catch(() => ({}));
		throw new Error(json?.error || json?.message || 'Failed to delete workspace');
	}
}

