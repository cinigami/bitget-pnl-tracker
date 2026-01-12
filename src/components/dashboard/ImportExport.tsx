'use client';

import React, { useState, useRef } from 'react';
import { useTrades } from '@/context/TradesContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { downloadJson, importFromJson } from '@/utils/storage';
import { generateShareableSummary, generateSampleTrades } from '@/utils/sampleData';
import { calculateWeeklyMetrics } from '@/utils/metrics';
import {
  Download,
  Upload,
  Share2,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  Trash2,
  Cloud,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

export function ImportExport() {
  const { state, importTrades, addTrades, clearAll, isUsingSupabase, isLoading, error, refreshTrades } = useTrades();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    downloadJson(state.trades);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);

    try {
      const text = await file.text();
      const trades = importFromJson(text);
      importTrades(trades);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSampleData = () => {
    const sampleTrades = generateSampleTrades();
    addTrades(sampleTrades);
  };

  const handleCopyShare = () => {
    const metrics = calculateWeeklyMetrics(state.trades, state.currentWeek);
    const summary = generateShareableSummary(state.trades, state.currentWeek, {
      netPnl: metrics.netPnl,
      winRate: metrics.winRate,
      totalTrades: metrics.totalTrades,
      profitFactor: metrics.profitFactor,
    });

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearAll = () => {
    clearAll();
    setShowClearConfirm(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExport} disabled={state.trades.length === 0}>
              <Download size={16} className="mr-2" />
              Export JSON
            </Button>

            <Button variant="secondary" onClick={handleImportClick}>
              <Upload size={16} className="mr-2" />
              Import JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            <Button
              variant="secondary"
              onClick={() => setShowShareModal(true)}
              disabled={state.trades.length === 0}
            >
              <Share2 size={16} className="mr-2" />
              Share Summary
            </Button>

            <Button variant="secondary" onClick={handleLoadSampleData}>
              <Sparkles size={16} className="mr-2" />
              Load Sample Data
            </Button>

            <Button
              variant="danger"
              onClick={() => setShowClearConfirm(true)}
              disabled={state.trades.length === 0}
            >
              <Trash2 size={16} className="mr-2" />
              Clear All
            </Button>
          </div>

          {isUsingSupabase && (
            <Button
              variant="secondary"
              onClick={refreshTrades}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}

          {(importError || error) && (
            <div className="mt-4 p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg flex items-center gap-2 text-accent-red text-sm">
              <AlertTriangle size={16} />
              {importError || error}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-sm text-dark-500">
            {isUsingSupabase ? (
              <>
                <Cloud size={16} className="text-accent-green" />
                <span>{state.trades.length} trade{state.trades.length !== 1 ? 's' : ''} synced with Supabase</span>
              </>
            ) : (
              <>
                <HardDrive size={16} />
                <span>{state.trades.length} trade{state.trades.length !== 1 ? 's' : ''} stored locally</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Weekly Summary"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-dark-900 rounded-lg p-4">
            <pre className="text-sm text-dark-200 whitespace-pre-wrap font-mono">
              {generateShareableSummary(
                state.trades,
                state.currentWeek,
                calculateWeeklyMetrics(state.trades, state.currentWeek)
              )}
            </pre>
          </div>
          <Button onClick={handleCopyShare} className="w-full">
            {copied ? (
              <>
                <Check size={16} className="mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} className="mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear All Data"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-dark-300">
            Are you sure you want to delete all {state.trades.length} trades? This action cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowClearConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearAll} className="flex-1">
              Delete All
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
