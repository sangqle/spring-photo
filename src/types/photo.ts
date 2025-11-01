export interface Photo {
  id: string;
  userId?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  title?: string;
  description?: string;
  fileName?: string;
  url?: string;
  fileType?: string;
  fileSize?: number;
  createdAt?: string;
  updatedAt?: string;
  uploadedAt?: string;
  metadata?: PhotoMetadata;
  processingStatus?: string;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
}

export interface PhotoMetadata {
  width?: number;
  height?: number;
  aspectRatio?: number;
  cameraMake?: string | null;
  cameraModel?: string | null;
  lens?: string | null;
  iso?: number | null;
  aperture?: string | null;
  shutterSpeed?: string | null;
  focalLength?: string | null;
  gpsLatitude?: number | null;
  gpsLongitude?: number | null;
  location?: string | null;
  dateTaken?: string | null;
}