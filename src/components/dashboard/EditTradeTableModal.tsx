'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Trade } from '@/types';
import { format, parseISO } from 'date-fns';

interface EditTradeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onSave: (trade: Trade) => void;
}

export function EditTradeTableModal({
  isOpen,
  onClose,
  trade,
  onSave,
}: EditTradeTableModalProps) {
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
    if (trade) {
      setFormData({
        timestamp: trade.timestamp
          ? format(parseISO(trade.timestamp), "yyyy-MM-dd'T'HH:mm")
          : '',
        symbol: trade.symbol || '',
        side: trade.side || 'unknown',
        realizedPnl: trade.realizedPnl?.toString() || '',
        fees: trade.fees?.toString() || '',
        roi: trade.roi?.toString() || '',
        remarks: trade.remarks || '',
      });
    }
  }, [trade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trade) return;

    const pnl = parseFloat(formData.realizedPnl);
    const result = pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';

    const updatedTrade: Trade = {
      ...trade,
      timestamp: new Date(formData.timestamp).toISOString(),
      symbol: formData.symbol.toUpperCase(),
      side: formData.side,
      realizedPnl: pnl,
      fees: formData.fees ? parseFloat(formData.fees) : null,
      roi: formData.roi ? parseFloat(formData.roi) : null,
      result,
      needsReview: false,
      remarks: formData.remarks || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedTrade);
    onClose();
  };

  if (!trade) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Trade" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Date & Time"
          type="datetime-local"
          value={formData.timestamp}
          onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
          required
        />

        <Input
          label="Symbol"
          type="text"
          value={formData.symbol}
          onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          placeholder="e.g., BTCUSDT"
          required
        />

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

        <Input
          label="Realized PnL (USDT)"
          type="number"
          step="0.01"
          value={formData.realizedPnl}
          onChange={(e) => setFormData({ ...formData, realizedPnl: e.target.value })}
          placeholder="e.g., 125.50 or -50.00"
          required
        />

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
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
