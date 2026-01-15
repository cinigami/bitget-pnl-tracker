'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { UploadedImage, Trade, ConfidenceLevel } from '@/types';
import { format, parseISO } from 'date-fns';

interface EditTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: UploadedImage | null;
  onSave: (trade: Trade) => void;
}

export function EditTradeModal({ isOpen, onClose, image, onSave }: EditTradeModalProps) {
  const [formData, setFormData] = useState({
    timestamp: '',
    symbol: '',
    side: 'unknown' as 'long' | 'short' | 'unknown',
    realizedPnl: '',
    fees: '',
    roi: '',
    remarks: '',
  });

  useEffect(() => {
    if (image?.trade) {
      setFormData({
        timestamp: image.trade.timestamp
          ? format(parseISO(image.trade.timestamp), "yyyy-MM-dd'T'HH:mm")
          : '',
        symbol: image.trade.symbol || '',
        side: image.trade.side || 'unknown',
        realizedPnl: image.trade.realizedPnl?.toString() || '',
        fees: image.trade.fees?.toString() || '',
        roi: image.trade.roi?.toString() || '',
        remarks: image.trade.remarks || '',
      });
    }
  }, [image]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!image?.trade) return;

    const pnl = parseFloat(formData.realizedPnl);
    const result = pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';

    const updatedTrade: Trade = {
      ...image.trade,
      timestamp: new Date(formData.timestamp).toISOString(),
      symbol: formData.symbol.toUpperCase(),
      side: formData.side,
      realizedPnl: pnl,
      fees: formData.fees ? parseFloat(formData.fees) : null,
      roi: formData.roi ? parseFloat(formData.roi) : null,
      result,
      needsReview: false,
      remarks: formData.remarks || undefined,
      confidence: {
        timestamp: 'high',
        symbol: 'high',
        pnl: 'high',
        overall: 'high',
      },
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedTrade);
    onClose();
  };

  const getConfidenceBadge = (level: ConfidenceLevel) => {
    switch (level) {
      case 'high':
        return <Badge variant="success">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="danger">Low</Badge>;
    }
  };

  if (!image) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Parsed Trade" size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-dark-300 mb-3">Screenshot</h4>
          <div className="rounded-lg overflow-hidden border border-dark-700">
            <img
              src={image.preview}
              alt="Screenshot"
              className="w-full h-auto"
            />
          </div>
          {image.ocrResult && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-dark-300 mb-2">
                OCR Confidence: {image.ocrResult.confidence.toFixed(1)}%
              </h4>
              <div className="bg-dark-900 rounded-lg p-3 max-h-40 overflow-y-auto">
                <pre className="text-xs text-dark-400 whitespace-pre-wrap">
                  {image.ocrResult.text}
                </pre>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-dark-300">Date & Time</label>
              {image.trade &&
                getConfidenceBadge(image.trade.confidence.timestamp)}
            </div>
            <Input
              type="datetime-local"
              value={formData.timestamp}
              onChange={(e) =>
                setFormData({ ...formData, timestamp: e.target.value })
              }
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-dark-300">Symbol</label>
              {image.trade && getConfidenceBadge(image.trade.confidence.symbol)}
            </div>
            <Input
              type="text"
              value={formData.symbol}
              onChange={(e) =>
                setFormData({ ...formData, symbol: e.target.value })
              }
              placeholder="e.g., BTCUSDT"
              required
            />
          </div>

          <Select
            label="Side"
            value={formData.side}
            onChange={(e) =>
              setFormData({
                ...formData,
                side: e.target.value as 'long' | 'short' | 'unknown',
              })
            }
            options={[
              { value: 'long', label: 'Long' },
              { value: 'short', label: 'Short' },
              { value: 'unknown', label: 'Unknown' },
            ]}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-dark-300">
                Realized PnL (USDT)
              </label>
              {image.trade && getConfidenceBadge(image.trade.confidence.pnl)}
            </div>
            <Input
              type="number"
              step="0.01"
              value={formData.realizedPnl}
              onChange={(e) =>
                setFormData({ ...formData, realizedPnl: e.target.value })
              }
              placeholder="e.g., 125.50 or -50.00"
              required
            />
          </div>

          <Input
            label="Fees (USDT)"
            type="number"
            step="0.01"
            value={formData.fees}
            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
            placeholder="Optional"
          />

          <Input
            label="ROI (%)"
            type="number"
            step="0.01"
            value={formData.roi}
            onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
            placeholder="Optional"
          />

          <div>
            <label className="text-sm font-medium text-dark-300 mb-1.5 block">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Add notes about this trade..."
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-green/50 focus:border-accent-green transition-colors resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Trade
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
