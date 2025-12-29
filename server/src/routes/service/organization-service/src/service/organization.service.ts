import type { OrganizationRepository } from '../repo/organization.repo';
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../type/organization.type';

export class OrganizationService {
  constructor(
    private organizationRepo: OrganizationRepository,
  ) {}

  async createOrganization(data: CreateOrganizationDto) {
    if (!data.ownerId || !data.name || !data.description) {
      throw new Error(
        "Owner Id, Name, Description can't be empty.",
      );
    }

    const organization =
      await this.organizationRepo.create(data);

    return organization;
  }

  async getOrganizations() {
    const allOrganizations =
      await this.organizationRepo.findAll();
    return allOrganizations;
  }

  async getOrganizationById(id: string) {
    const organization =
      await this.organizationRepo.findById(id);
    if (!organization) {
      throw new Error(
        `Organization with id ${id} not found`,
      );
    }
    return organization;
  }

  async getOrganizationByOwnerId(id: string) {
    const organization =
      await this.organizationRepo.findByOwnerId(id);
    if (!organization) {
      throw new Error(
        `Organization with id ${id} not found`,
      );
    }
    return organization;
  }

  async updateOrganization(
    id: string,
    data: UpdateOrganizationDto,
  ) {
    const existing =
      await this.organizationRepo.findById(id);

    if (!existing) {
      throw new Error(
        `Organization with id ${id} not found`,
      );
    }

    // Only validate fields that are being updated (not undefined)
    if (data.name !== undefined && data.name !== null && !data.name.trim()) {
      throw new Error('Name cannot be empty');
    }
    if (data.description !== undefined && data.description !== null && !data.description.trim()) {
      throw new Error('Description cannot be empty');
    }

    const updated = await this.organizationRepo.update(
      id,
      data,
    );

    if (!updated) {
      throw new Error(
        `Failed to update organization with id ${id}`,
      );
    }

    return updated;
  }

  async deleteOrganization(id: string) {
    const existing =
      await this.organizationRepo.findById(id);

    if (!existing) {
      throw new Error(
        `Organization with id ${id} not found`,
      );
    }

    return await this.organizationRepo.delete(id);
  }
}
