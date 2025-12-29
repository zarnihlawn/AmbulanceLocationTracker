import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  organizations,
  type NewOrganization,
  type Organization,
} from '../schema/organization.schema';
import { eq } from 'drizzle-orm';

export class OrganizationRepository {
  constructor(private db: NodePgDatabase<any>) {}

  async create(
    data: NewOrganization,
  ): Promise<Organization> {
    const result = await this.db
      .insert(organizations)
      .values(data)
      .returning();

    if (!result[0]) {
      throw new Error('Failed to create organization');
    }

    return result[0];
  }

  async findAll(): Promise<Organization[]> {
    return await this.db.select().from(organizations);
  }

  async findById(id: string): Promise<Organization | null> {
    const [result] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    return result || null;
  }

  async findByOwnerId(id: string): Promise<Organization[]> {
    return await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerId, id));
  }

  async update(
    id: string,
    data: Partial<NewOrganization>,
  ): Promise<Organization | null> {
    const [result] = await this.db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning();
    return result.length > 0;
  }
}
