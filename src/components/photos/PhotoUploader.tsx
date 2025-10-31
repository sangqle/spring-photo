'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PhotoUploaderProps {
  onUploadComplete?: (status: string) => void;
}

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface PhotoDraft {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
  status: UploadStatus;
  statusMessage?: string;
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
        status: 'pending',
        statusMessage: 'Ready to upload',
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

  const pendingUploadCount = drafts.filter((draft) => draft.status !== 'success').length;

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
    setDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id !== id) {
          return draft;
        }

        const nextDraft: PhotoDraft = {
          ...draft,
          ...updates,
        };

        if (draft.status === 'error') {
          nextDraft.status = 'pending';
          nextDraft.statusMessage = 'Ready to upload';
        }

        return nextDraft;
      }),
    );
  }, []);

  const removeDraft = useCallback((id: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
  }, []);

  const handleUpload = useCallback(async () => {
    if (drafts.length === 0) {
      setError('Please add at least one photo to upload.');
      return;
    }

    const draftsToUpload = drafts.filter((draft) => draft.status !== 'uploading' && draft.status !== 'success');

    if (draftsToUpload.length === 0) {
      setError('All selected photos have already been uploaded.');
      return;
    }

    setUploading(true);
    setError(null);

    let successCount = 0;
    let errorCount = 0;

    for (const draft of draftsToUpload) {
      setDrafts((prev) =>
        prev.map((item) =>
          item.id === draft.id
            ? {
              ...item,
              status: 'uploading',
              statusMessage: 'Uploading...',
            }
            : item,
        ),
      );

      const formData = new FormData();
      formData.append('files', draft.file, draft.file.name);
      formData.append(
        'metadata',
        JSON.stringify([
          {
            id: draft.id,
            title: draft.title,
            description: draft.description,
            originalName: draft.file.name,
            size: draft.file.size,
            type: draft.file.type,
          },
        ]),
      );

      try {
        const response = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData,
        });

        const contentType = response.headers.get('content-type') ?? '';
        const isJson = contentType.includes('application/json');
        const payload = isJson ? await response.json() : await response.text();

        if (!response.ok) {
          const message =
            isJson && payload && typeof payload === 'object' && 'error' in payload
              ? (payload as { error?: string; message?: string }).error ?? (payload as { message?: string }).message
              : typeof payload === 'string'
                ? payload
                : 'Upload failed';
          throw new Error(message ?? 'Upload failed');
        }

        const successMessage =
          isJson && payload && typeof payload === 'object' && 'message' in payload
            ? (payload as { message?: string }).message
            : typeof payload === 'string'
              ? payload
              : undefined;

        const resolvedSuccessMessage = successMessage && successMessage.trim().length > 0
          ? successMessage
          : 'Uploaded successfully';

        successCount += 1;
        setDrafts((prev) =>
          prev.map((item) =>
            item.id === draft.id
              ? {
                ...item,
                status: 'success',
                statusMessage: resolvedSuccessMessage,
              }
              : item,
          ),
        );
      } catch (err) {
        errorCount += 1;
        const message = err instanceof Error ? err.message : 'Upload failed';
        const resolvedErrorMessage = message && message.trim().length > 0 ? message : 'Upload failed';
        setDrafts((prev) =>
          prev.map((item) =>
            item.id === draft.id
              ? {
                ...item,
                status: 'error',
                statusMessage: resolvedErrorMessage,
              }
              : item,
          ),
        );
      }
    }

    setUploading(false);

    if (successCount > 0) {
      onUploadComplete?.(`Uploaded ${successCount} photo${successCount > 1 ? 's' : ''} successfully!`);
    }

    if (errorCount > 0) {
      setError(
        errorCount === draftsToUpload.length
          ? 'Upload failed for all selected photos. Please review the errors above.'
          : 'Some photos failed to upload. Please review the errors above.',
      );
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
          {drafts.map((draft) => {
            const badgeLabel =
              draft.status === 'success'
                ? 'Uploaded'
                : draft.status === 'uploading'
                  ? 'Uploading'
                  : draft.status === 'error'
                    ? 'Error'
                    : 'Pending';

            const badgeStyles =
              draft.status === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                : draft.status === 'uploading'
                  ? 'border-blue-400/40 bg-blue-500/15 text-blue-200'
                  : draft.status === 'error'
                    ? 'border-red-500/40 bg-red-500/15 text-red-200'
                    : 'border-white/10 bg-black/40 text-gray-300';

            const statusIcon =
              draft.status === 'success'
                ? (<CheckCircle2 className="h-4 w-4 text-emerald-300" />)
                : draft.status === 'error'
                  ? (<AlertCircle className="h-4 w-4 text-red-300" />)
                  : draft.status === 'uploading'
                    ? (<Loader2 className="h-4 w-4 animate-spin text-blue-300" />)
                    : (<Upload className="h-4 w-4 text-gray-400" />);

            const statusTextClass =
              draft.status === 'success'
                ? 'text-emerald-200'
                : draft.status === 'error'
                  ? 'text-red-300'
                  : draft.status === 'uploading'
                    ? 'text-blue-200'
                    : 'text-gray-300';

            const isReadOnly = uploading || draft.status === 'uploading' || draft.status === 'success';
            const canRemove = !uploading && draft.status !== 'uploading';
            const statusMessage = draft.statusMessage ?? 'Ready to upload';

            return (
              <div
                key={draft.id}
                className="rounded-2xl border border-gray-800 bg-card-darker p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="relative h-36 w-full overflow-hidden rounded-xl bg-card md:h-40 md:w-48">
                    <img src={draft.preview} alt={draft.title} className="h-full w-full object-cover" />
                    <span
                      className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${badgeStyles}`}
                    >
                      {badgeLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDraft(draft.id)}
                      disabled={!canRemove}
                      className={`absolute right-3 top-3 rounded-full p-2 transition-colors ${canRemove
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'cursor-not-allowed bg-gray-700/40 text-gray-500'
                      }`}
                      aria-label="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {draft.status === 'uploading' ? (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-200" />
                      </div>
                    ) : null}
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
                        disabled={isReadOnly}
                        className={`w-full rounded-lg border border-gray-700 bg-card px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isReadOnly ? 'cursor-not-allowed opacity-70' : ''}`}
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
                        disabled={isReadOnly}
                        className={`w-full rounded-lg border border-gray-700 bg-card px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isReadOnly ? 'cursor-not-allowed opacity-70' : ''}`}
                        placeholder="Tell viewers about this image"
                      />
                    </div>

                    <p className="text-sm text-gray-500">
                      {draft.file.type || 'image/*'} • {formatSize(draft.file.size)}
                    </p>

                    <div className="flex items-center gap-2 text-sm">
                      {statusIcon}
                      <span className={`font-medium ${statusTextClass}`}>{statusMessage}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
          disabled={uploading || pendingUploadCount === 0}
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-600/50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : pendingUploadCount > 0 ? (
            <>
              <Upload className="h-5 w-5" />
              <span>Upload {pendingUploadCount} Photo{pendingUploadCount > 1 ? 's' : ''}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 text-emerald-200" />
              <span>All photos uploaded</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default PhotoUploader;