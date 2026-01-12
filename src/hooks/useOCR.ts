'use client';

import { useState, useCallback } from 'react';
import { UploadedImage, Trade, OCRResult } from '@/types';
import { processImage, initializeOCR } from '@/utils/ocr';
import { calculateOverallConfidence, needsReview } from '@/utils/parsing';
import { v4 as uuidv4 } from 'uuid';

export function useOCR() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const initialize = useCallback(async () => {
    if (isInitialized || isInitializing) return;

    setIsInitializing(true);
    try {
      await initializeOCR();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize OCR:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitialized, isInitializing]);

  const processUploadedImage = useCallback(
    async (
      image: UploadedImage,
      onProgress: (progress: number) => void
    ): Promise<{ ocrResult: OCRResult; trade: Trade | null }> => {
      if (!isInitialized) {
        await initialize();
      }

      const ocrResult = await processImage(image.preview, onProgress);

      const { parsedData } = ocrResult;

      if (
        parsedData.timestamp.value &&
        parsedData.symbol.value &&
        parsedData.realizedPnl.value !== null
      ) {
        const pnl = parsedData.realizedPnl.value as number;
        const result = pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';

        const trade: Trade = {
          id: uuidv4(),
          timestamp: parsedData.timestamp.value as string,
          symbol: parsedData.symbol.value as string,
          side: (parsedData.side.value as 'long' | 'short') || 'unknown',
          realizedPnl: pnl,
          fees: parsedData.fees.value as number | null,
          roi: parsedData.roi.value as number | null,
          result,
          needsReview: needsReview(parsedData),
          confidence: {
            timestamp: parsedData.timestamp.confidence,
            symbol: parsedData.symbol.confidence,
            pnl: parsedData.realizedPnl.confidence,
            overall: calculateOverallConfidence(parsedData),
          },
          sourceImageId: image.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return { ocrResult, trade };
      }

      return { ocrResult, trade: null };
    },
    [isInitialized, initialize]
  );

  return {
    isInitialized,
    isInitializing,
    initialize,
    processUploadedImage,
  };
}
