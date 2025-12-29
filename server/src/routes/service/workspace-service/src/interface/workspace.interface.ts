export interface CreateWorkspaceDto {
  organizationId: string;
  featureId: string;
  name: string;
  description: string;
}

export interface UpdateWorkspaceDto {
  organizationId?: string;
  featureId?: string;
  name?: string;
  description?: string;
}

export interface WorkspaceResponse {
  id: string;
  organizationId: string;
  featureId: string;
  name: string;
  descrption: string;
  createdAt: string;
  updatedAt: string;
}
