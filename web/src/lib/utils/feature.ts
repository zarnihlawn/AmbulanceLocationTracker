import { API_ENDPOINTS } from '$lib/config/api';
import { fetchWithAuth } from '$lib/utils/api';
import type { Feature } from '$lib/types/feature';

export type CreateFeaturePayload = {
	name: string;
	description?: string | null;
};

export async function getFeatures(): Promise<Feature[]> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.feature}`, {
		method: 'GET'
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err?.error || err?.message || 'Failed to load features');
	}

	return response.json();
}

export async function getFeatureById(id: string): Promise<Feature> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.feature}/${id}`, {
		method: 'GET'
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err?.error || err?.message || 'Failed to load feature');
	}

	return response.json();
}

export async function createFeature(data: CreateFeaturePayload): Promise<Feature> {
	const response = await fetchWithAuth(`${API_ENDPOINTS.feature}/`, {
		method: 'POST',
		body: JSON.stringify(data)
	});

	const json = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(json?.error || json?.message || 'Failed to create feature');
	}

	return json as Feature;
}

