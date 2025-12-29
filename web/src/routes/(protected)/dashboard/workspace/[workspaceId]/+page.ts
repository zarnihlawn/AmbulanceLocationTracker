import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
	const workspaceId = params.workspaceId;
	const feature = url.searchParams.get('feature');

	return {
		workspaceId,
		feature
	};
};

