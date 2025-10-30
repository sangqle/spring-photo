'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface PhotoUploaderProps {
  onUploadComplete?: (status: string) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setError(null);

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please upload an image file');
      }
    }
  }, []);

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setSelectedFile(null);
      setPreview(null);
      setError(null);
      onUploadComplete?.('Photo uploaded successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!preview && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative rounded-lg border-2 border-dashed p-12 text-center transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-card-darker hover:border-gray-600'}
          `}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                <Upload className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xl font-semibold text-white">
                {isDragging ? 'Drop your photo here' : 'Drag and drop your photo'}
              </p>
              <p className="text-gray-400">or click to browse</p>
            </div>
            <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF (Max 10MB)</p>
          </div>
        </div>
      )}

      {preview && (
        <div className="relative rounded-lg border border-gray-800 bg-card-darker p-4">
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-6 top-6 rounded-full bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="shrink-0">
              <img src={preview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{selectedFile?.name}</p>
              <p className="text-sm text-gray-400">
                {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : '--'} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {selectedFile && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-600/50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Upload Photo</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default PhotoUploader;