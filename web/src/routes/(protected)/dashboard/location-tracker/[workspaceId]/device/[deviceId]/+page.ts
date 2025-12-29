import type { PageLoad } from './$types';
import { getLocationTrackerDeviceById } from '$lib/utils/location-tracker-device';
import { getWorkspaceById } from '$lib/utils/workspace';
import { getOrganizationById } from '$lib/utils/organization';

export const load: PageLoad = async ({ params, fetch }) => {
	const deviceId = params.deviceId;
	const workspaceId = params.workspaceId;
	
	let device = null;
	let workspace = null;
	let organization = null;

	try {
		device = await getLocationTrackerDeviceById(deviceId, fetch);
		if (device) {
			workspace = await getWorkspaceById(device.workspaceId, fetch);
			if (workspace) {
				organization = await getOrganizationById(workspace.organizationId, fetch);
			}
		}
	} catch (error) {
		console.error('Failed to load device, workspace, or organization:', error);
	}

	return {
		deviceId,
		workspaceId,
		device,
		workspace,
		organization
	};
};

