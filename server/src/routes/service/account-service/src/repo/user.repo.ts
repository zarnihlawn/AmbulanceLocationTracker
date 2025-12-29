import { eq, or } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  userSchema,
  type User,
  type NewUser,
} from '../schema/user.schema';

export class UserRepository {
  constructor(private db: NodePgDatabase<any>) {}

  async create(data: NewUser): Promise<User> {
    const result = await this.db
      .insert(userSchema)
      .values(data)
      .returning();

    if (!result[0]) {
      throw new Error('Failed to create user');
    }

    return result[0];
  }

  async findAll(): Promise<User[]> {
    return await this.db.select().from(userSchema);
  }

  async findById(id: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, id))
      .limit(1);
    return result || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email))
      .limit(1);
    return result || null;
  }

  async findByUsername(
    username: string,
  ): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.username, username))
      .limit(1);
    return result || null;
  }

  async findByEmailOrUsername(
    emailOrUsername: string,
  ): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(userSchema)
      .where(
        or(
          eq(userSchema.email, emailOrUsername),
          eq(userSchema.username, emailOrUsername),
        ),
      )
      .limit(1);
    return result || null;
  }

  async findByNrc(nrc: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.nrc, nrc))
      .limit(1);
    return result || null;
  }

  async findByPhoneNumber(
    phoneNumber: string,
  ): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.phoneNumber, phoneNumber))
      .limit(1);
    return result || null;
  }

  async findByPasswordResetToken(
    resetToken: string,
  ): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.passwordResetToken, resetToken))
      .limit(1);
    return result || null;
  }


  async update(
    id: string,
    data: Partial<NewUser>,
  ): Promise<User | null> {
    const [result] = await this.db
      .update(userSchema)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userSchema.id, id))
      .returning();
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(userSchema)
      .where(eq(userSchema.id, id))
      .returning();
    return result.length > 0;
  }
}
