'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface PhotoUploaderProps {
  onUploadComplete?: (status: string) => void;
}

interface PhotoDraft {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
}

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createDraft = (file: File): Promise<PhotoDraft> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: createId(),
        file,
        preview: reader.result as string,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

const formatSize = (size: number) => `${(size / 1024 / 1024).toFixed(2)} MB`;

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onUploadComplete }) => {
  const [drafts, setDrafts] = useState<PhotoDraft[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) {
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const skipped = files.length - imageFiles.length;

    if (imageFiles.length === 0) {
      setError('Please choose image files only.');
      return;
    }

    try {
      const newDrafts = await Promise.all(imageFiles.map((file) => createDraft(file)));
      setDrafts((prev) => [...prev, ...newDrafts]);
      setError(skipped > 0 ? `Skipped ${skipped} non-image file${skipped > 1 ? 's' : ''}.` : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process selected files.');
    }
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        void handleFiles(event.target.files);
        event.target.value = '';
      }
    },
    [handleFiles],
  );

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

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      if (event.dataTransfer.files) {
        void handleFiles(event.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const updateDraft = useCallback((id: string, updates: Partial<PhotoDraft>) => {
    setDrafts((prev) => prev.map((draft) => (draft.id === id ? { ...draft, ...updates } : draft)));
  }, []);

  const removeDraft = useCallback((id: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
  }, []);

  const handleUpload = useCallback(async () => {
    if (drafts.length === 0) {
      setError('Please add at least one photo to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    const count = drafts.length;
    const formData = new FormData();
    drafts.forEach((draft) => {
      formData.append('files', draft.file, draft.file.name);
    });
    formData.append(
      'metadata',
      JSON.stringify(
        drafts.map((draft) => ({
          id: draft.id,
          title: draft.title,
          description: draft.description,
          originalName: draft.file.name,
          size: draft.file.size,
          type: draft.file.type,
        })),
      ),
    );

    try {
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setDrafts([]);
      onUploadComplete?.(`Uploaded ${count} photo${count > 1 ? 's' : ''} successfully!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
    } finally {
      setUploading(false);
    }
  }, [drafts, onUploadComplete]);

  return (
    <div className="space-y-6">
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
          multiple
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
              {isDragging ? 'Drop your photos here' : 'Drag and drop your photos'}
            </p>
            <p className="text-gray-400">or click to browse — you can add multiple files</p>
          </div>
          <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF (Max 10MB each)</p>
        </div>
      </div>

      {drafts.length > 0 && (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="rounded-2xl border border-gray-800 bg-card-darker p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative h-36 w-full overflow-hidden rounded-xl bg-card md:h-40 md:w-48">
                  <img src={draft.preview} alt={draft.title} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeDraft(draft.id)}
                    className="absolute right-3 top-3 rounded-full bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300" htmlFor={`title-${draft.id}`}>
                      Title
                    </label>
                    <input
                      id={`title-${draft.id}`}
                      type="text"
                      value={draft.title}
                      onChange={(event) => updateDraft(draft.id, { title: event.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-card px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Name your photo"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300" htmlFor={`description-${draft.id}`}>
                      Description
                    </label>
                    <textarea
                      id={`description-${draft.id}`}
                      value={draft.description}
                      onChange={(event) => updateDraft(draft.id, { description: event.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-gray-700 bg-card px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Tell viewers about this image"
                    />
                  </div>

                  <p className="text-sm text-gray-500">
                    {draft.file.type || 'image/*'} • {formatSize(draft.file.size)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {drafts.length > 0 && (
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
              <span>Upload {drafts.length} Photo{drafts.length > 1 ? 's' : ''}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default PhotoUploader;