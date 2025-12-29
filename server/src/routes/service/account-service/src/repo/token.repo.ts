import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  refreshTokens,
  type RefreshToken,
  type NewRefreshToken,
} from '../schema/token.schema';

export class RefreshTokenRepository {
  constructor(private db: NodePgDatabase<any>) {}

  async create(
    data: NewRefreshToken,
  ): Promise<RefreshToken> {
    const result = await this.db
      .insert(refreshTokens)
      .values(data)
      .returning();

    if (!result[0]) {
      throw new Error('Failed to create account');
    }
    return result[0];
  }

  async findByToken(
    token: string,
  ): Promise<RefreshToken | null> {
    const [result] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token))
      .limit(1);
    return result || null;
  }

  async findByUserId(
    userId: string,
  ): Promise<RefreshToken[]> {
    return await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, userId));
  }

  async revokeToken(token: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.token, token));
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.userId, userId));
  }

  async deleteExpired(): Promise<number> {
    const result = await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.expiresAt, new Date()));
    return result.rowCount || 0;
  }

  async deleteByToken(token: string): Promise<boolean> {
    const result = await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, token))
      .returning();
    return result.length > 0;
  }
}
