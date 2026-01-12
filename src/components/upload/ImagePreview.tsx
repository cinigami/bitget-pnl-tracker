'use client';

import React from 'react';
import { UploadedImage } from '@/types';
import { CheckCircle, AlertCircle, Loader2, X, AlertTriangle } from 'lucide-react';

interface ImagePreviewProps {
  image: UploadedImage;
  onRemove: (id: string) => void;
  onEdit: (image: UploadedImage) => void;
}

export function ImagePreview({ image, onRemove, onEdit }: ImagePreviewProps) {
  const getStatusIcon = () => {
    switch (image.status) {
      case 'pending':
        return <div className="w-5 h-5 rounded-full bg-dark-600" />;
      case 'processing':
        return <Loader2 size={20} className="text-accent-blue animate-spin" />;
      case 'completed':
        return image.trade?.needsReview ? (
          <AlertTriangle size={20} className="text-accent-yellow" />
        ) : (
          <CheckCircle size={20} className="text-accent-green" />
        );
      case 'error':
        return <AlertCircle size={20} className="text-accent-red" />;
    }
  };

  const getStatusText = () => {
    switch (image.status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return `Processing ${Math.round(image.progress)}%`;
      case 'completed':
        return image.trade?.needsReview ? 'Needs Review' : 'Completed';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className="relative group bg-dark-800 border border-dark-700 rounded-lg overflow-hidden">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={image.preview}
          alt="Screenshot"
          className="w-full h-full object-cover"
        />
        {image.status === 'processing' && (
          <div className="absolute inset-0 bg-dark-950/70 flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={32} className="text-accent-green animate-spin mx-auto mb-2" />
              <p className="text-sm text-dark-200">{Math.round(image.progress)}%</p>
            </div>
          </div>
        )}
        <button
          onClick={() => onRemove(image.id)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-dark-900/80 text-dark-300 hover:text-white hover:bg-dark-900 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm text-dark-300">{getStatusText()}</span>
          </div>
        </div>
        {image.status === 'completed' && image.trade && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">Symbol</span>
              <span className="text-dark-200 font-medium">{image.trade.symbol}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">PnL</span>
              <span
                className={`font-medium ${
                  image.trade.realizedPnl >= 0 ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                {image.trade.realizedPnl >= 0 ? '+' : ''}
                {image.trade.realizedPnl.toFixed(2)} USDT
              </span>
            </div>
            {(image.trade.needsReview ||
              image.trade.confidence.overall !== 'high') && (
              <button
                onClick={() => onEdit(image)}
                className="w-full mt-2 py-1.5 text-sm text-accent-yellow hover:text-accent-yellow/80 border border-accent-yellow/30 hover:bg-accent-yellow/10 rounded-lg transition-colors"
              >
                Review & Edit
              </button>
            )}
          </div>
        )}
        {image.status === 'error' && (
          <p className="text-sm text-accent-red">{image.error || 'Failed to process'}</p>
        )}
      </div>
    </div>
  );
}
