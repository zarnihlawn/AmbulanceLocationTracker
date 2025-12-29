import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';
import type { StoredUser } from '$lib/utils/auth';
import { getUser as getStoredUser, isAuthenticated as checkAuth, getAccessToken } from '$lib/utils/auth';

const AUTH_CONTEXT_KEY = Symbol('auth');

class AuthContext {
	user = $state<StoredUser | null>(null);
	
	get isAuthenticated() {
		return this.user !== null;
	}

	refresh() {
		if (browser) {
			const hasToken = getAccessToken() !== null;
			const storedUser = getStoredUser();
			console.log('Auth refresh - hasToken:', hasToken, 'storedUser:', storedUser);
			this.user = hasToken && storedUser ? storedUser : null;
		}
	}

	constructor() {
		if (browser) {
			this.refresh();
		}
	}
}

export type { AuthContext };

export function setAuthContext(): AuthContext {
	const context = new AuthContext();
	setContext(AUTH_CONTEXT_KEY, context);
	return context;
}

export function getAuthContext(): AuthContext {
	return getContext(AUTH_CONTEXT_KEY);
}

