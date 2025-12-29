import { env } from '$env/dynamic/public';
import { browser } from '$app/environment';

// Defaults for local/SSR usage when env is not provided
const DEFAULT_API_PROTOCOL = 'http';
const DEFAULT_API_HOST = '192.168.100.16';
const DEFAULT_API_PORT = '1025';

// Prefer browser proxy in frontend, then explicit env overrides on server, then fallback defaults
const getApiBaseUrl = () => {
	if (browser) {
		// In the browser we rely on Vite/SvelteKit proxy with relative paths
		return '';
	}

	// On the server (SSR/adapters), use env when provided
	if (env.PUBLIC_API_BASE_URL) {
		return env.PUBLIC_API_BASE_URL;
	}

	if (env.PUBLIC_API_HOST) {
		const protocol = env.PUBLIC_API_PROTOCOL || DEFAULT_API_PROTOCOL;
		const port = env.PUBLIC_API_PORT ? `:${env.PUBLIC_API_PORT}` : '';
		return `${protocol}://${env.PUBLIC_API_HOST}${port}`;
	}

	// SSR fallback
	return `${DEFAULT_API_PROTOCOL}://${DEFAULT_API_HOST}:${DEFAULT_API_PORT}`;
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
	register: `${API_BASE_URL}/api/account`,
	login: `${API_BASE_URL}/api/account/login`,
	refresh: `${API_BASE_URL}/api/account/refresh`,
	logout: `${API_BASE_URL}/api/account/logout`,
	forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`, // Update this when you have the endpoint
	organization: `${API_BASE_URL}/api/organization`,
	workspace: `${API_BASE_URL}/api/workspace`,
	feature: `${API_BASE_URL}/api/feature`,
	locationTrackerDevice: `${API_BASE_URL}/api/location-tracker-device`,
	locationTrackerTracking: `${API_BASE_URL}/api/location-tracker-tracking`
};

