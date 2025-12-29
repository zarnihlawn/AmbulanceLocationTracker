export interface CreateOrganizationDto {
  ownerId: string;
  name: string;
  description: string;
  profile: string;
  banner: string;
}

export interface UpdateOrganizationDto {
  ownerId: string;
  name: string;
  description: string;
  profile: string;
  banner: string;
}

export interface OrganizationResponse {
  id: string;
  ownerId: string;
  name: string;
  profile: string;
  banner: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
