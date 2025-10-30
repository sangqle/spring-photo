export interface Photo {
  id: string;
  userId?: string;
  title?: string;
  description?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PhotoMetadata {
  id: string;
  photoId: string;
  width: number;
  height: number;
  format: string;
  size: number; // in bytes
}