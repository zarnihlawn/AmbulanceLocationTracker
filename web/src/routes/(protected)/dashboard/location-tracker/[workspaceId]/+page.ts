import type { PageLoad } from './$types';
import { getWorkspaceById } from '$lib/utils/workspace';
import { getOrganizationById } from '$lib/utils/organization';

export const load: PageLoad = async ({ params, fetch }) => {
	const workspaceId = params.workspaceId;

	try {
		const workspace = await getWorkspaceById(workspaceId, fetch);
		const organization = await getOrganizationById(workspace.organizationId, fetch);

		return {
			workspaceId,
			workspace,
			organization
		};
	} catch (error) {
		return {
			workspaceId,
			workspace: null,
			organization: null
		};
	}
};

