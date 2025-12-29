import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { desc, sql, notInArray } from 'drizzle-orm';
import {
  visitorSchema,
  type NewVisitor,
  type Visitor,
} from '../schema/visitor.schema';

export class VisitorRepository {
  constructor(private db: NodePgDatabase<any>) {}

  async create(data: NewVisitor): Promise<Visitor> {
    const result = await this.db
      .insert(visitorSchema)
      .values(data)
      .returning();

    if (!result[0]) {
      throw new Error('Failed to create visitor');
    }

    return result[0];
  }

  async findAll(limit: number): Promise<Visitor[]> {
    return await this.db
      .select()
      .from(visitorSchema)
      .orderBy(desc(visitorSchema.createdAt))
      .limit(limit);
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(visitorSchema);
    return Number(result[0]?.count || 0);
  }

  async deleteOldest(keepCount: number): Promise<number> {
    // Get IDs of records to keep (newest ones)
    const recordsToKeep = await this.db
      .select({ id: visitorSchema.id })
      .from(visitorSchema)
      .orderBy(desc(visitorSchema.createdAt))
      .limit(keepCount);

    const idsToKeep = recordsToKeep.map((r) => r.id);

    // Delete all records not in the keep list
    if (idsToKeep.length === 0) {
      return 0;
    }

    const result = await this.db
      .delete(visitorSchema)
      .where(notInArray(visitorSchema.id, idsToKeep))
      .returning();

    return result.length;
  }
}
