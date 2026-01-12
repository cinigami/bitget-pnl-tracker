'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  isProcessing: boolean;
}

export function DropZone({ onFilesAdded, isProcessing }: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!isProcessing && acceptedFiles.length > 0) {
        onFilesAdded(acceptedFiles);
      }
    },
    [onFilesAdded, isProcessing]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    disabled: isProcessing,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer ${
        isDragActive
          ? 'border-accent-green bg-accent-green/10'
          : isProcessing
          ? 'border-dark-600 bg-dark-800/50 cursor-not-allowed'
          : 'border-dark-600 hover:border-dark-500 hover:bg-dark-800/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isDragActive ? 'bg-accent-green/20' : 'bg-dark-700'
          }`}
        >
          {isDragActive ? (
            <ImageIcon size={28} className="text-accent-green" />
          ) : (
            <Upload size={28} className="text-dark-400" />
          )}
        </div>
        <p className="text-dark-200 font-medium mb-1">
          {isDragActive
            ? 'Drop your screenshots here'
            : isProcessing
            ? 'Processing images...'
            : 'Drag & drop Bitget PnL screenshots'}
        </p>
        <p className="text-dark-500 text-sm">
          {isProcessing ? 'Please wait' : 'or click to browse (PNG, JPG, WEBP)'}
        </p>
      </div>
    </div>
  );
}
