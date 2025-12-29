import type { PageLoad } from './$types';
import { browser } from '$app/environment';

// Disable SSR for this page to avoid CORS issues
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
	// Return only params - data will be loaded client-side
	return {
		deviceId: params.deviceId,
		workspaceId: params.workspaceId
	};
};

