export interface LocationTrackerTask {
	id: string;
	deviceId: string;
	type: 'text' | 'location';
	title: string;
	description: string | null;
	targetLatitude: string | null;
	targetLongitude: string | null;
	status: 'pending' | 'accepted' | 'rejected' | 'na' | 'completed';
	responseMessage: string | null;
	metadata: Record<string, any> | null;
	createdAt: string;
	updatedAt: string;
	completedAt: string | null;
	respondedAt: string | null;
}

export interface CreateLocationTrackerTaskPayload {
	deviceId: string;
	type: 'text' | 'location';
	title: string;
	description?: string;
	targetLatitude?: string;
	targetLongitude?: string;
	metadata?: Record<string, any>;
}

