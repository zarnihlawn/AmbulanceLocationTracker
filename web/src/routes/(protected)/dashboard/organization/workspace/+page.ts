import type { PageLoad } from './$types';
import { getOrganizationById } from '$lib/utils/organization';

export const load: PageLoad = async ({ url, fetch }) => {
	const orgId = url.searchParams.get('orgId');

	if (!orgId) {
		return {
			orgId: null,
			orgName: null
		};
	}

	try {
		const organization = await getOrganizationById(orgId, fetch);
		return {
			orgId,
			orgName: organization.name
		};
	} catch (error) {
		return {
			orgId,
			orgName: null
		};
	}
};


