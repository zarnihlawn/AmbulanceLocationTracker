export type LocationTrackerDevice = {
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
};

export type CreateLocationTrackerDeviceWithSecretKeyPayload = {
	workspaceId: string;
	secretKey: string;
};

export type AcceptLocationTrackerDevicePayload = {
	name: string;
	description?: string;
};

export type UpdateLocationTrackerDevicePayload = {
	name?: string;
	description?: string;
};

