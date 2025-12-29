import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from '../interface/workspace.interface';
import type { WorkspaceRepository } from '../repo/workspace.repo';

export class WorkspaceService {
  constructor(private workspaceRepo: WorkspaceRepository) {}

  async createWorkspace(data: CreateWorkspaceDto) {
    if (
      !data.organizationId ||
      !data.featureId ||
      !data.name
    ) {
      throw new Error(
        "Organization Id, Feature Id, Name can't be empty",
      );
    }

    const workspace = await this.workspaceRepo.create(data);

    return workspace;
  }

  async getWorkspace() {
    const allWorkspaces =
      await this.workspaceRepo.findAll();
    return allWorkspaces;
  }

  async getWorkspaceById(id: string) {
    const workspace = await this.workspaceRepo.findById(id);
    if (!workspace) {
      throw new Error(`Workspace with id ${id} not found`);
    }
    return workspace;
  }

  async getWorkspacesByOrganizationId(id: string) {
    const workspaces =
      await this.workspaceRepo.findByOrganizationId(id);
    return workspaces;
  }

  async updateWorkspace(
    id: string,
    data: UpdateWorkspaceDto,
  ) {
    const existing = await this.workspaceRepo.findById(id);
    if (!existing) {
      throw new Error(`Workspace with id ${id} not found`);
    }

    // Only validate fields that are being updated (not undefined)
    if (data.name !== undefined && data.name !== null && !data.name.trim()) {
      throw new Error('Name cannot be empty');
    }
    if (data.description !== undefined && data.description !== null && !data.description.trim()) {
      throw new Error('Description cannot be empty');
    }

    const updated = await this.workspaceRepo.update(
      id,
      data,
    );

    if (!updated) {
      throw new Error(`Failed to update workspace with id ${id}`);
    }

    return updated;
  }

  async deleteWorkspace(id: string) {
    const existing = await this.workspaceRepo.findById(id);

    if (!existing) {
      throw new Error(`Workspace with id ${id} not found`);
    }

    return await this.workspaceRepo.delete(id);
  }
}
