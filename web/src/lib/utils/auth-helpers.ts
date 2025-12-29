/**
 * Helper functions to check authentication status
 * 
 * Usage examples:
 * 
 * 1. In any component:
 * ```ts
 * import { getAuthContext } from '$lib/stores/auth';
 * const auth = getAuthContext();
 * // Use auth.user, auth.isAuthenticated, auth.refresh()
 * ```
 * 
 * 2. Check if logged in:
 * ```ts
 * if (auth.isAuthenticated) {
 *   // User is logged in
 * }
 * ```
 * 
 * 3. Get user info:
 * ```ts
 * const user = auth.user;
 * if (user) {
 *   console.log(user.email, user.username);
 * }
 * ```
 */

import { getAuthContext } from '$lib/stores/auth.svelte';
import { isAuthenticated, getUser } from '$lib/utils/auth';

/**
 * Quick check if user is authenticated (uses localStorage directly)
 * Use this for one-time checks, not reactive state
 */
export function checkAuthStatus(): boolean {
	return isAuthenticated();
}

/**
 * Get current user (uses localStorage directly)
 * Use this for one-time access, not reactive state
 */
export function getCurrentUser() {
	return getUser();
}

/**
 * Get auth context for reactive state
 * Use this in components when you need reactive updates
 */
export function useAuth() {
	try {
		return getAuthContext();
	} catch {
		// Context not available (e.g., outside component tree)
		return null;
	}
}

