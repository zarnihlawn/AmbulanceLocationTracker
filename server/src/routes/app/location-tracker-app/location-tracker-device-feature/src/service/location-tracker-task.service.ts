import type { LocationTrackerTaskRepository } from '../repo/location-tracker-task.repo';
import type {
  CreateLocationTrackerTaskDto,
  UpdateTaskStatusDto,
} from '../interface/location-tracker-task.interface';

export class LocationTrackerTaskService {
  constructor(
    private taskRepo: LocationTrackerTaskRepository,
  ) {}

  async createTask(data: CreateLocationTrackerTaskDto) {
    // Validate location task
    if (data.type === 'location') {
      if (!data.targetLatitude || !data.targetLongitude) {
        throw new Error(
          'targetLatitude and targetLongitude are required for location tasks',
        );
      }
    }

    const task = await this.taskRepo.create({
      deviceId: data.deviceId,
      type: data.type,
      title: data.title,
      description: data.description || null,
      targetLatitude: data.targetLatitude || null,
      targetLongitude: data.targetLongitude || null,
      status: 'pending',
      metadata: data.metadata || null,
    });

    return task;
  }

  async getTaskById(id: string) {
    return await this.taskRepo.findById(id);
  }

  async getTasksByDeviceId(deviceId: string, limit: number = 100) {
    return await this.taskRepo.findByDeviceId(deviceId, limit);
  }

  async getPendingTasksByDeviceId(deviceId: string, limit: number = 100) {
    return await this.taskRepo.findByDeviceIdAndStatus(deviceId, 'pending', limit);
  }

  async updateTaskStatus(
    id: string,
    data: UpdateTaskStatusDto,
  ) {
    return await this.taskRepo.updateStatus(
      id,
      data.status,
      data.responseMessage,
    );
  }

  async deleteTask(id: string) {
    return await this.taskRepo.delete(id);
  }
}

