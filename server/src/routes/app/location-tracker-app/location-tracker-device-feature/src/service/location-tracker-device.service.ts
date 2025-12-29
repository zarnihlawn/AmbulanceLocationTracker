import type {
  CreateLocationTrackerDeviceDto,
  UpdateLocationTrackerDeviceDto,
  AcceptLocationTrackerDeviceDto,
} from '../interface/location-tracker-device.inteface';
import type { LocationTrackerDeviceRepository } from '../repo/location-tracker-device.repo';

export class LocationTrackerDeviceService {
  constructor(
    private locationTrackerDeviceRepo: LocationTrackerDeviceRepository,
  ) {}

  // Create device with secret key (from website)
  async createLocationTrackerDeviceWithSecretKey(data: {
    workspaceId: string;
    secretKey: string;
  }) {
    if (!data.workspaceId || !data.secretKey) {
      throw new Error(
        "Workspace Id and Secret Key can't be empty",
      );
    }

    const locationTrackerDevice =
      await this.locationTrackerDeviceRepo.create({
        workspaceId: data.workspaceId,
        secretKey: data.secretKey,
        isAccepted: false,
      });

    return locationTrackerDevice;
  }

  // Register device from Android app (with secret key validation)
  async createLocationTrackerDevice(
    data: CreateLocationTrackerDeviceDto,
  ) {
    if (
      !data.workspaceId ||
      !data.deviceKey ||
      !data.secretKey ||
      !data.deviceOs ||
      !data.deviceOsVersion ||
      !data.deviceModel ||
      !data.appVersion
    ) {
      throw new Error(
        "Workspace Id, Device Key, Secret Key, Device OS, Device OS Version, Device Model, App Version can't be empty",
      );
    }

    // Validate secret key exists and matches workspace
    const existingDevice =
      await this.locationTrackerDeviceRepo.findBySecretKeyAndWorkspaceId(
        data.secretKey,
        data.workspaceId,
      );

    if (!existingDevice) {
      throw new Error('Invalid secret key or workspace ID');
    }

    if (existingDevice.deviceKey) {
      throw new Error('Secret key has already been used');
    }

    // Update the existing device with device information
    const updated =
      await this.locationTrackerDeviceRepo.update(
        existingDevice.id,
        {
          deviceKey: data.deviceKey,
          deviceOs: data.deviceOs,
          deviceOsVersion: data.deviceOsVersion,
          deviceModel: data.deviceModel,
          appVersion: data.appVersion,
          isAccepted: false, // Still pending acceptance
        },
      );

    if (!updated) {
      throw new Error('Failed to register device');
    }

    return updated;
  }

  async getLocationTrackerDevices() {
    const allLocationTrackerDevices =
      await this.locationTrackerDeviceRepo.findAll();
    return allLocationTrackerDevices;
  }

  async getLocationTrackerDeviceById(id: string) {
    const locationTrackerDevice =
      await this.locationTrackerDeviceRepo.findById(id);
    if (!locationTrackerDevice) {
      throw new Error(
        `Location Tracker Device with id ${id} not found`,
      );
    }
    return locationTrackerDevice;
  }

  async getLocationTrackerDevicesByWorkspaceId(
    workspaceId: string,
  ) {
    const locationTrackerDevices =
      await this.locationTrackerDeviceRepo.findByWorkspaceId(
        workspaceId,
      );
    return locationTrackerDevices;
  }

  async updateLocationTrackerDevice(
    id: string,
    data: UpdateLocationTrackerDeviceDto,
  ) {
    const existing =
      await this.locationTrackerDeviceRepo.findById(id);
    if (!existing) {
      throw new Error(
        `Location Tracker Device with id ${id} not found`,
      );
    }

    const updated =
      await this.locationTrackerDeviceRepo.update(id, data);

    return updated;
  }

  async acceptLocationTrackerDevice(
    id: string,
    data: AcceptLocationTrackerDeviceDto,
  ) {
    const existing =
      await this.locationTrackerDeviceRepo.findById(id);
    if (!existing) {
      throw new Error(
        `Location Tracker Device with id ${id} not found`,
      );
    }

    if (existing.isAccepted) {
      throw new Error('Device has already been accepted');
    }

    const updated =
      await this.locationTrackerDeviceRepo.update(id, {
        name: data.name,
        description: data.description || null,
        isAccepted: true,
      });

    if (!updated) {
      throw new Error('Failed to accept device');
    }

    return updated;
  }

  async getLocationTrackerDeviceByDeviceKey(
    deviceKey: string,
  ) {
    const device =
      await this.locationTrackerDeviceRepo.findByDeviceKey(
        deviceKey,
      );
    if (!device) {
      throw new Error(`Device with device key not found`);
    }
    return device;
  }

  async deleteLocationTrackerDevice(id: string) {
    const existing =
      await this.locationTrackerDeviceRepo.findById(id);

    if (!existing) {
      throw new Error(
        `Location Tracker Device with id ${id} not found`,
      );
    }

    return await this.locationTrackerDeviceRepo.delete(id);
  }
}
