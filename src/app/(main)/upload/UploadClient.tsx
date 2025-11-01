'use client';

import React, { useState } from 'react';
import PhotoUploader from '@/components/photos/PhotoUploader';

const UploadClient: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState('');

  const handleUploadComplete = (status: string) => {
    setUploadStatus(status);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Upload Your Photos</h1>
          <p className="text-lg text-gray-400">Share your best work with the community</p>
        </div>

        <div className="rounded-lg border border-gray-800 bg-card p-8">
          <PhotoUploader onUploadComplete={handleUploadComplete} />
          {uploadStatus ? (
            <div
              className={`mt-4 rounded-lg p-4 ${
                uploadStatus.includes('success')
                  ? 'border border-green-500/20 bg-green-500/10 text-green-400'
                  : 'border border-red-500/20 bg-red-500/10 text-red-400'
              }`}
            >
              {uploadStatus}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UploadClient;
