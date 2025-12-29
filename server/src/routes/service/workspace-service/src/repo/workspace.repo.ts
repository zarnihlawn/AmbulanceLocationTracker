import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  workspaces,
  type NewWorkspace,
  type Workspace,
} from '../schema/workspace.schema';
import { eq } from 'drizzle-orm';

export class WorkspaceRepository {
  constructor(private db: NodePgDatabase<any>) {}

  async create(data: NewWorkspace): Promise<Workspace> {
    const result = await this.db
      .insert(workspaces)
      .values(data)
      .returning();

    if (!result[0]) {
      throw new Error('Failed to create workspace');
    }

    return result[0];
  }

  async findAll(): Promise<Workspace[]> {
    return await this.db.select().from(workspaces);
  }

  async findById(id: string): Promise<Workspace | null> {
    const [result] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);

    return result || null;
  }

  async findByOrganizationId(
    id: string,
  ): Promise<Workspace[]> {
    return await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.organizationId, id));
  }

  async update(
    id: string,
    data: Partial<NewWorkspace>,
  ): Promise<Workspace | null> {
    const [result] = await this.db
      .update(workspaces)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workspaces.id, id))
      .returning();
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(workspaces)
      .where(eq(workspaces.id, id))
      .returning();
    return result.length > 0;
  }
}
