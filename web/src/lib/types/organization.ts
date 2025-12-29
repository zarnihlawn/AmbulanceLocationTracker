export type Organization = {
	id: string;
	ownerId: string;
	name: string;
	profile: string | null;
	banner: string | null;
	description: string;
	createdAt: string;
	updatedAt: string;
};

export type CreateOrganizationPayload = {
	name: string;
	description: string;
	profile?: string | null;
	banner?: string | null;
};

export type UpdateOrganizationPayload = Partial<CreateOrganizationPayload>;

