export type Workspace = {
	id: string;
	organizationId: string;
	featureId: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
};

export type CreateWorkspacePayload = {
	name: string;
	description: string;
	featureId: string;
};

export type UpdateWorkspacePayload = Partial<CreateWorkspacePayload>;

