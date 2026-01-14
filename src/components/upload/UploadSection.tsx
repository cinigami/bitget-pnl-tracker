'use client';

import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UploadedImage, Trade } from '@/types';
import { useTrades } from '@/context/TradesContext';
import { useOCR } from '@/hooks/useOCR';
import { DropZone } from './DropZone';
import { ImagePreview } from './ImagePreview';
import { EditTradeModal } from './EditTradeModal';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

export function UploadSection() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingImage, setEditingImage] = useState<UploadedImage | null>(null);
  const [duplicateAlert, setDuplicateAlert] = useState<{
    trade: Trade;
    existing: Trade;
  } | null>(null);

  const { addTrade, isDuplicate, updateTrade } = useTrades();
  const { processUploadedImage, isInitializing, initialize } = useOCR();

  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      const newImages: UploadedImage[] = files.map((file) => ({
        id: uuidv4(),
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
        progress: 0,
      }));

      setImages((prev) => [...prev, ...newImages]);
      setIsProcessing(true);

      await initialize();

      for (const image of newImages) {
        try {
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, status: 'processing' as const } : img
            )
          );

          const { ocrResult, trade } = await processUploadedImage(
            image,
            (progress) => {
              setImages((prev) =>
                prev.map((img) =>
                  img.id === image.id ? { ...img, progress } : img
                )
              );
            }
          );

          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    status: 'completed' as const,
                    progress: 100,
                    ocrResult,
                    trade: trade || undefined,
                  }
                : img
            )
          );

          if (trade) {
            const existing = isDuplicate(trade);
            if (existing) {
              setDuplicateAlert({ trade, existing });
            } else if (!trade.needsReview) {
              await addTrade(trade);
            }
          }
        } catch (error) {
          console.error('Error processing image:', error);
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    status: 'error' as const,
                    error: error instanceof Error ? error.message : 'Processing failed',
                  }
                : img
            )
          );
        }
      }

      setIsProcessing(false);
    },
    [addTrade, isDuplicate, initialize, processUploadedImage]
  );

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
  }, [images]);

  const handleEditSave = useCallback(
    (trade: Trade) => {
      const existing = isDuplicate(trade);
      if (existing && existing.id !== trade.id) {
        setDuplicateAlert({ trade, existing });
        return;
      }

      const existingTrade = images.find((img) => img.trade?.id === trade.id);
      if (existingTrade) {
        addTrade(trade);
      } else {
        updateTrade(trade);
      }

      setImages((prev) =>
        prev.map((img) =>
          img.trade?.id === trade.id
            ? { ...img, trade: { ...trade, needsReview: false } }
            : img
        )
      );
    },
    [addTrade, updateTrade, isDuplicate, images]
  );

  const handleDuplicateAction = useCallback(
    (action: 'skip' | 'replace' | 'add') => {
      if (!duplicateAlert) return;

      switch (action) {
        case 'replace':
          updateTrade({
            ...duplicateAlert.trade,
            id: duplicateAlert.existing.id,
          });
          break;
        case 'add':
          addTrade(duplicateAlert.trade);
          break;
      }

      setDuplicateAlert(null);
    },
    [duplicateAlert, addTrade, updateTrade]
  );

  const completedCount = images.filter(
    (img) => img.status === 'completed' && !img.trade?.needsReview
  ).length;
  const needsReviewCount = images.filter(
    (img) => img.status === 'completed' && img.trade?.needsReview
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Import Screenshots</CardTitle>
        {images.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              {completedCount > 0 && (
                <span className="flex items-center gap-1 text-accent-green">
                  <CheckCircle size={16} />
                  {completedCount} imported
                </span>
              )}
              {needsReviewCount > 0 && (
                <span className="flex items-center gap-1 text-accent-yellow">
                  <AlertTriangle size={16} />
                  {needsReviewCount} need review
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isProcessing}
            >
              <Trash2 size={16} className="mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <DropZone
          onFilesAdded={handleFilesAdded}
          isProcessing={isProcessing || isInitializing}
        />

        {images.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image) => (
              <ImagePreview
                key={image.id}
                image={image}
                onRemove={handleRemoveImage}
                onEdit={setEditingImage}
              />
            ))}
          </div>
        )}

        <EditTradeModal
          isOpen={!!editingImage}
          onClose={() => setEditingImage(null)}
          image={editingImage}
          onSave={handleEditSave}
        />

        {duplicateAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
              onClick={() => setDuplicateAlert(null)}
            />
            <div className="relative bg-dark-800 border border-dark-700 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-dark-100 mb-2">
                Duplicate Trade Detected
              </h3>
              <p className="text-dark-400 mb-4">
                A similar trade already exists: {duplicateAlert.existing.symbol} at{' '}
                {new Date(duplicateAlert.existing.timestamp).toLocaleString()} with PnL{' '}
                {duplicateAlert.existing.realizedPnl.toFixed(2)} USDT
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDuplicateAction('skip')}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDuplicateAction('replace')}
                  className="flex-1"
                >
                  Replace
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDuplicateAction('add')}
                  className="flex-1"
                >
                  Add Anyway
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
