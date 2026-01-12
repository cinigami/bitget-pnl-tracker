import { createWorker, Worker, RecognizeResult } from 'tesseract.js';
import { OCRResult, ParsedTradeData } from '@/types';
import { parseOCRText } from './parsing';

let worker: Worker | null = null;

export async function initializeOCR(
  onProgress?: (progress: number) => void
): Promise<void> {
  if (worker) return;

  worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress * 100);
      }
    },
  });
}

export async function processImage(
  imageSource: string | File | Blob,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  if (!worker) {
    await initializeOCR(onProgress);
  }

  if (!worker) {
    throw new Error('Failed to initialize OCR worker');
  }

  const result: RecognizeResult = await worker.recognize(imageSource);

  const text = result.data.text;
  const confidence = result.data.confidence;
  const rawLines = text.split('\n').filter((line) => line.trim());

  const parsedData = parseOCRText(text);

  return {
    text,
    confidence,
    parsedData,
    rawLines,
  };
}

export async function terminateOCR(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

export function preprocessImageForOCR(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let totalBrightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalBrightness += (r + g + b) / 3;
  }
  const avgBrightness = totalBrightness / (data.length / 4);
  const isDarkMode = avgBrightness < 128;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    let enhanced = gray;
    if (isDarkMode) {
      enhanced = 255 - gray;
    }

    enhanced = enhanced < 128 ? 0 : 255;

    data[i] = enhanced;
    data[i + 1] = enhanced;
    data[i + 2] = enhanced;
  }

  ctx.putImageData(imageData, 0, 0);
}
