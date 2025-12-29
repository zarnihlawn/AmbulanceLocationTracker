export interface CreateLocationTrackingDto {
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
}

export interface LocationTrackingResponse {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  createdAt: string;
}

