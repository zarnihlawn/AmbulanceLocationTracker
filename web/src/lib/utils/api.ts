import { browser } from '$app/environment';
import { getAccessToken, getRefreshToken, setTokens, removeTokens, removeUser, setUser } from './auth';
import type { RegisterData, User } from '$lib/types/auth';
import { API_ENDPOINTS, API_BASE_URL } from '$lib/config/api';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
	if (!browser) return null;

	const refreshToken = getRefreshToken();
	if (!refreshToken) {
		// No refresh token, redirect to login
		logout();
		return null;
	}

	// If already refreshing, return the existing promise
	if (isRefreshing && refreshPromise) {
		return refreshPromise;
	}

	isRefreshing = true;
	refreshPromise = (async () => {
		try {
			const response = await fetch(API_ENDPOINTS.refresh, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refreshToken })
			});

			if (!response.ok) {
				throw new Error('Token refresh failed');
			}

			const data = await response.json();
			setTokens(data.accessToken, data.refreshToken);
			return data.accessToken;
		} catch (error) {
			// Refresh token expired or invalid - logout user
			logout();
			return null;
		} finally {
			isRefreshing = false;
			refreshPromise = null;
		}
	})();

	return refreshPromise;
}

/**
 * Logout and clear all tokens
 */
function logout() {
	removeTokens();
	removeUser();
	if (browser) {
		goto(resolve('/login'));
	}
}

/**
 * Fetch with automatic authentication and token refresh
 * Automatically adds Authorization header and handles 401 responses
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param fetchFn - Optional fetch function (use SvelteKit's fetch from load functions to avoid warnings)
 */
export async function fetchWithAuth(
	url: string,
	options: RequestInit = {},
	fetchFn: typeof fetch = fetch
): Promise<Response> {
	// Construct full URL for SSR
	let fullUrl = url;
	if (!browser) {
		// In SSR, if URL is relative, prepend API_BASE_URL
		if (url.startsWith('/')) {
			fullUrl = `${API_BASE_URL}${url}`;
		} else if (!url.startsWith('http://') && !url.startsWith('https://')) {
			fullUrl = `${API_BASE_URL}/${url}`;
		}
	}

	// In browser, we can use localStorage for tokens
	// In SSR, we need to get tokens from cookies or headers
	let accessToken: string | null = null;
	if (browser) {
		accessToken = getAccessToken();
	} else {
		// In SSR, try to get token from cookies via the request
		// For now, we'll skip auth in SSR - the gateway will handle it
		// Or you can pass tokens via headers in the fetch function
	}

	// Add Authorization header if token exists
	const headers = new Headers(options.headers);
	if (accessToken) {
		headers.set('Authorization', `Bearer ${accessToken}`);
	}
	
	// Only set Content-Type if there's a body
	if (options.body) {
		headers.set('Content-Type', 'application/json');
	}

	const response = await fetchFn(fullUrl, {
		...options,
		headers
	});

	// If token expired (401), try to refresh (only in browser)
	if (response.status === 401 && accessToken && browser) {
		const newToken = await refreshAccessToken();

		if (newToken) {
			// Retry the original request with new token
			headers.set('Authorization', `Bearer ${newToken}`);
			return fetchFn(fullUrl, {
				...options,
				headers
			});
		} else {
			// Refresh failed, user will be redirected to login
			return response;
		}
	}

	return response;
}

/**
 * Logout and revoke refresh token on server
 */
export async function logoutUser(): Promise<void> {
	if (!browser) return;

	const refreshToken = getRefreshToken();

	if (refreshToken) {
		try {
			await fetch(API_ENDPOINTS.logout, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refreshToken })
			});
		} catch (error) {
			// Continue with logout even if API call fails
			console.error('Logout API call failed:', error);
		}
	}

	logout();
}

/**
 * Update current authenticated user's account information
 */
type UpdateAccountPayload = Partial<User & RegisterData> & {
	oldPassword?: string;
	newPassword?: string;
	confirmPassword?: string;
};

export async function updateAccount(id: string, data: UpdateAccountPayload): Promise<User> {
	if (!browser) {
		throw new Error('Account update is only available in the browser');
	}

	const response = await fetchWithAuth(`${API_ENDPOINTS.register}/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(data)
	});

	const json = await response.json().catch(() => ({}));

	if (!response.ok) {
		const message = (json && (json.error || json.message)) || 'Failed to update account';
		throw new Error(message);
	}

	const updatedUser = json as User;

	// Persist updated user in localStorage for auth context
	setUser({
		id: updatedUser.id,
		email: updatedUser.email,
		username: updatedUser.username,
		firstName: updatedUser.firstName,
		lastName: updatedUser.lastName,
		name: updatedUser.name,
		level: updatedUser.level,
		nrc: updatedUser.nrc,
		phoneNumber: updatedUser.phoneNumber,
		address: updatedUser.address
	});

	return updatedUser;
}


