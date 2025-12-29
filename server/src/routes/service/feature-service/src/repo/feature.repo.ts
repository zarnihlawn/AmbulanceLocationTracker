import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  feature,
  type Feature,
  type NewFeature,
} from '../schema/feature.schema';
import { eq } from 'drizzle-orm';

export class FeatureRepository {
  constructor(private db: NodePgDatabase<any>) {}

  async create(data: NewFeature): Promise<Feature> {
    const result = await this.db
      .insert(feature)
      .values(data)
      .returning();

    if (!result[0]) {
      throw new Error('Failed to create feature');
    }

    return result[0];
  }

  async findAll(): Promise<Feature[]> {
    return await this.db.select().from(feature);
  }

  async findById(id: string): Promise<Feature | null> {
    const [result] = await this.db
      .select()
      .from(feature)
      .where(eq(feature.id, id))
      .limit(1);
    return result || null;
  }

  async update(
    id: string,
    data: Partial<NewFeature>,
  ): Promise<Feature | null> {
    const [result] = await this.db
      .update(feature)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(feature.id, id))
      .returning();
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(feature)
      .where(eq(feature.id, id))
      .returning();
    return result.length > 0;
  }
}
