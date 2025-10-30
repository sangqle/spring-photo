export interface Photo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  url: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PhotoMetadata {
  id: string;
  photoId: string;
  width: number;
  height: number;
  format: string;
  size: number; // in bytes
}