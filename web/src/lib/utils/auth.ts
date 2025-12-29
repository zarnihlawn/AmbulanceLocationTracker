import { browser } from '$app/environment';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export interface StoredUser {
	id: string;
	email: string;
	username?: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	level?: number;
	nrc?: string;
	phoneNumber?: string;
	address?: string;
}

// Access Token functions
export function getAccessToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
	if (!browser) return;
	localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
	if (!browser) return;
	localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Refresh Token functions
export function getRefreshToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
	if (!browser) return;
	localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function removeRefreshToken(): void {
	if (!browser) return;
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// User functions
export function getUser(): StoredUser | null {
	if (!browser) return null;
	const userStr = localStorage.getItem(USER_KEY);
	if (!userStr) return null;
	try {
		return JSON.parse(userStr);
	} catch {
		return null;
	}
}

export function setUser(user: StoredUser): void {
	if (!browser) return;
	localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeUser(): void {
	if (!browser) return;
	localStorage.removeItem(USER_KEY);
}

// Combined functions
export function setTokens(accessToken: string, refreshToken: string): void {
	setAccessToken(accessToken);
	setRefreshToken(refreshToken);
}

export function removeTokens(): void {
	removeAccessToken();
	removeRefreshToken();
}

export function isAuthenticated(): boolean {
	return getAccessToken() !== null && getUser() !== null;
}

export function logout(): void {
	removeTokens();
	removeUser();
}

// Legacy support (for backward compatibility)
export function getAuthToken(): string | null {
	return getAccessToken();
}

export function setAuthToken(token: string): void {
	setAccessToken(token);
}

export function removeAuthToken(): void {
	removeAccessToken();
}

