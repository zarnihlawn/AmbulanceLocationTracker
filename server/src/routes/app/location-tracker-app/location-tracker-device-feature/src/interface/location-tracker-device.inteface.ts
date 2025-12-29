export interface CreateLocationTrackerDeviceDto {
  workspaceId: string;
  deviceKey: string;
  secretKey: string; // One-time password from website
  deviceOs: string;
  deviceOsVersion: string;
  deviceModel: string;
  appVersion: string;
}

export interface UpdateLocationTrackerDeviceDto {
  name?: string;
  description?: string;
}

export interface AcceptLocationTrackerDeviceDto {
  id: string;
  name: string;
  description?: string;
}

export interface LocationTrackerDeviceResponse {
  id: string;
  workspaceId: string;
  secretKey: string | null;
  deviceKey: string | null;
  deviceOs: string | null;
  deviceOsVersion: string | null;
  deviceModel: string | null;
  appVersion: string | null;
  name: string | null;
  description: string | null;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}
