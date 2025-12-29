import { API_ENDPOINTS } from '$lib/config/api';
import { fetchWithAuth } from '$lib/utils/api';
import type {
	CreateOrganizationPayload,
	Organization,
	UpdateOrganizationPayload
} from '$lib/types/organization';

export async function getOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.organization}/ownerId/${ownerId}`, {
		method: 'GET'
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err?.error || err?.message || 'Failed to load organizations');
	}

	return response.json();
}

export async function getOrganizationById(id: string, fetchFn: typeof fetch = fetch): Promise<Organization> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.organization}/${id}`, {
		method: 'GET'
	}, fetchFn);

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err?.error || err?.message || 'Failed to load organization');
	}

	return response.json();
}

export async function createOrganization(
	data: CreateOrganizationPayload & { ownerId: string }
): Promise<Organization> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.organization}/`, {
		method: 'POST',
		body: JSON.stringify(data)
	});

	const json = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(json?.error || json?.message || 'Failed to create organization');
	}

	return json as Organization;
}

export async function updateOrganization(
	id: string,
	data: UpdateOrganizationPayload
): Promise<Organization> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.organization}/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});

	const json = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(json?.error || json?.message || 'Failed to update organization');
	}

	return json as Organization;
}

export async function deleteOrganization(id: string): Promise<void> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.organization}/${id}`, {
		method: 'DELETE'
	});

	if (!response.ok) {
		const json = await response.json().catch(() => ({}));
		throw new Error(json?.error || json?.message || 'Failed to delete organization');
	}
}

