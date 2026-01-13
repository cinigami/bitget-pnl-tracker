'use client';

import React, { useState, useMemo } from 'react';
import { useTrades } from '@/context/TradesContext';
import { Trade } from '@/types';
import { WeekSelector } from './WeekSelector';
import { KPICards } from './KPICards';
import { WeeklyPnlChart, WinLossChart, EquityCurveChart } from './Charts';
import { TradesTable } from './TradesTable';
import { EditTradeTableModal } from './EditTradeTableModal';
import {
  calculateWeeklyMetrics,
  getWeeklyNetPnlData,
  getWeeklyWinLossData,
  calculateCumulativeEquity,
  filterTradesByWeek,
} from '@/utils/metrics';

export function Dashboard() {
  const { state, setCurrentWeek, updateTrade, deleteTrade } = useTrades();
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const weeklyMetrics = useMemo(
    () => calculateWeeklyMetrics(state.trades, state.currentWeek),
    [state.trades, state.currentWeek]
  );

  const weeklyPnlData = useMemo(
    () => getWeeklyNetPnlData(state.trades),
    [state.trades]
  );

  const winLossData = useMemo(
    () => getWeeklyWinLossData(state.trades),
    [state.trades]
  );

  const equityData = useMemo(
    () => calculateCumulativeEquity(state.trades),
    [state.trades]
  );

  const filteredTrades = useMemo(
    () => filterTradesByWeek(state.trades, state.currentWeek),
    [state.trades, state.currentWeek]
  );

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
  };

  const handleSaveEdit = (trade: Trade) => {
    updateTrade(trade);
    setEditingTrade(null);
  };

  const handleDeleteTrade = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteTrade(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-dark-100">Analytics Dashboard</h2>
          <p className="text-dark-400 mt-1">
            {state.trades.length} total trades tracked
          </p>
        </div>
        <WeekSelector
          currentWeek={state.currentWeek}
          onWeekChange={setCurrentWeek}
        />
      </div>

      <KPICards metrics={weeklyMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyPnlChart data={weeklyPnlData} />
        <WinLossChart data={winLossData} />
      </div>

      <EquityCurveChart data={equityData} />

      <TradesTable
        trades={filteredTrades}
        onEdit={handleEditTrade}
        onDelete={handleDeleteTrade}
      />

      <EditTradeTableModal
        isOpen={!!editingTrade}
        onClose={() => setEditingTrade(null)}
        trade={editingTrade}
        onSave={handleSaveEdit}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="relative bg-dark-800 border border-dark-700 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-dark-100 mb-2">
              Delete Trade
            </h3>
            <p className="text-dark-400 mb-4">
              Are you sure you want to delete this trade? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-accent-red hover:bg-accent-red/90 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
