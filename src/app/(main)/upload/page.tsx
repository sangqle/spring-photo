'use client';

import React, { useState } from 'react';
import PhotoUploader from '../../../components/photos/PhotoUploader';

const UploadPage = () => {
  const [uploadStatus, setUploadStatus] = useState('');

  const handleUploadComplete = (status: string) => {
    setUploadStatus(status);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Upload Your Photos</h1>
          <p className="text-gray-400 text-lg">
            Share your best work with the community
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-800 bg-card p-8">
          <PhotoUploader onUploadComplete={handleUploadComplete} />
          {uploadStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              uploadStatus.includes('success') 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {uploadStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;