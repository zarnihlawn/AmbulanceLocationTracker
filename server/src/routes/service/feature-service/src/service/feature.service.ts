import type {
  CreateFeatureDto,
  FeatureResponse,
  UpdateFeatureDto,
} from '../interface/feature.interface';
import type { FeatureRepository } from '../repo/feature.repo';

export class FeatureService {
  constructor(private featureRepo: FeatureRepository) {}

  async createFeature(data: CreateFeatureDto) {
    const feature = await this.featureRepo.create(data);
    return feature;
  }

  async getFeature() {
    const allFeature = await this.featureRepo.findAll();
    return allFeature;
  }

  async getFeatureById(id: string) {
    const feature = await this.featureRepo.findById(id);

    if (!feature) {
      throw new Error(
        `Feature Item with id ${id} not found`,
      );
    }

    return feature;
  }

  async updateFeature(id: string, data: UpdateFeatureDto) {
    const existing = await this.featureRepo.findById(id);
    if (!existing) {
      throw new Error(`Feature with id ${id} not found`);
    }

    const updated = await this.featureRepo.update(id, data);

    if (!updated) {
      throw new Error(
        `Failed to update feature with id ${id}`,
      );
    }

    return updated;
  }

  async deleteFeature(id: string) {
    const existing = await this.featureRepo.findById(id);

    if (!existing) {
      throw new Error(`Feature with id ${id} not found`);
    }

    return await this.featureRepo.delete(id);
  }
}
