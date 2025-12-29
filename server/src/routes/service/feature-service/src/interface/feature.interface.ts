export interface CreateFeatureDto {
  authorId: string;
  name: string;
  description: string;
}

export interface UpdateFeatureDto {
  id: string;
  authorId: string;
  name: string;
  description: string;
}

export interface FeatureResponse {
  id: string;
  authorId: string;
  name: string;
  description: string;
  createdAt: string;
  updateAt: string;
}
