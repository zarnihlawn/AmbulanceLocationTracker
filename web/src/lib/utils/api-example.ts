/**
 * Example usage of fetchWithAuth for making authenticated API requests
 * 
 * This file shows how to use the fetchWithAuth utility for authenticated requests.
 * The fetchWithAuth function automatically:
 * - Adds Authorization header with Bearer token
 * - Handles 401 responses by refreshing the token
 * - Retries the request with the new token
 */

import { fetchWithAuth } from './api';
import { API_ENDPOINTS } from '$lib/config/api';

/**
 * Example: Get current user profile
 */
export async function getCurrentUser() {
	const response = await fetchWithAuth(`${API_ENDPOINTS.register}`, {
		method: 'GET'
	});

	if (!response.ok) {
		throw new Error('Failed to fetch user');
	}

	return response.json();
}

/**
 * Example: Update user profile
 */
export async function updateUserProfile(userData: {
	firstName?: string;
	lastName?: string;
	email?: string;
}) {
	const response = await fetchWithAuth(`${API_ENDPOINTS.register}`, {
		method: 'PUT',
		body: JSON.stringify(userData)
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || 'Failed to update profile');
	}

	return response.json();
}

/**
 * Example: Make any authenticated API call
 */
export async function makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}) {
	const response = await fetchWithAuth(endpoint, options);
	
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || 'Request failed');
	}

	return response.json();
}

