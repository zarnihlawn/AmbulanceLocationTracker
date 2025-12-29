import type { VisitorRepository } from '../repo/visitor.repo';
import type { NewVisitor } from '../schema/visitor.schema';

export interface VisitorData {
  ipAddress: string;
  fromUrl: string;
  toUrl?: string;
  method: string;
  userAgent?: string;
  referer?: string;
  statusCode?: number;
  responseTime?: number;
}

export class VisitorService {
  private readonly MAX_LOGS = 100;

  constructor(private visitorRepo: VisitorRepository) {}

  async logVisit(data: VisitorData): Promise<void> {
    try {
      const newLog: NewVisitor = {
        ipAddress: data.ipAddress,
        fromUrl: data.fromUrl,
        toUrl: data.toUrl || null,
        method: data.method,
        userAgent: data.userAgent || null,
        referer: data.referer || null,
        statusCode: data.statusCode || null,
        responseTime: data.responseTime || null,
      };

      await this.visitorRepo.create(newLog);

      // Cleanup: keep only the latest MAX_LOGS records
      await this.cleanup();
    } catch (error: any) {
      // Suppress table-not-found errors (migrations may not have run yet)
      if (error?.code === '42P01') {
        // Table doesn't exist yet - migrations haven't run
        return;
      }
      // Log other errors but don't fail the request
      console.error('Failed to log visitor:', error);
    }
  }

  async getAllLogs(
    limit: number = this.MAX_LOGS,
  ): Promise<any[]> {
    try {
      return await this.visitorRepo.findAll(limit);
    } catch (error: any) {
      if (error?.code === '42P01') {
        // Table doesn't exist yet
        return [];
      }
      throw error;
    }
  }

  async getLogCount(): Promise<number> {
    try {
      return await this.visitorRepo.count();
    } catch (error: any) {
      if (error?.code === '42P01') {
        // Table doesn't exist yet
        return 0;
      }
      throw error;
    }
  }

  private async cleanup(): Promise<void> {
    try {
      const count = await this.visitorRepo.count();
      if (count > this.MAX_LOGS) {
        const deleted = await this.visitorRepo.deleteOldest(
          this.MAX_LOGS,
        );
        console.log(
          `Cleaned up ${deleted} old visitor logs, keeping ${this.MAX_LOGS} latest`,
        );
      }
    } catch (error: any) {
      // Suppress table-not-found errors
      if (error?.code === '42P01') {
        return;
      }
      console.error(
        'Failed to cleanup visitor logs:',
        error,
      );
    }
  }
}
