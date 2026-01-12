'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { Trade, AppState } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { getCurrentWeekKey } from '@/utils/dates';
import { isSupabaseConfigured } from '@/lib/supabase';
import * as tradesService from '@/lib/trades-service';

type TradesAction =
  | { type: 'SET_TRADES'; payload: Trade[] }
  | { type: 'ADD_TRADE'; payload: Trade }
  | { type: 'ADD_TRADES'; payload: Trade[] }
  | { type: 'UPDATE_TRADE'; payload: Trade }
  | { type: 'DELETE_TRADE'; payload: string }
  | { type: 'SET_CURRENT_WEEK'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'LOAD_STATE'; payload: AppState };

interface TradesContextType {
  state: AppState;
  isLoading: boolean;
  error: string | null;
  isUsingSupabase: boolean;
  addTrade: (trade: Trade) => Promise<void>;
  addTrades: (trades: Trade[]) => Promise<void>;
  updateTrade: (trade: Trade) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  setCurrentWeek: (week: string) => void;
  clearAll: () => Promise<void>;
  importTrades: (trades: Trade[]) => Promise<void>;
  isDuplicate: (trade: Partial<Trade>) => Trade | null;
  refreshTrades: () => Promise<void>;
}

const TradesContext = createContext<TradesContextType | undefined>(undefined);

function tradesReducer(state: AppState, action: TradesAction): AppState {
  switch (action.type) {
    case 'SET_TRADES':
      return { ...state, trades: action.payload };
    case 'ADD_TRADE':
      return { ...state, trades: [action.payload, ...state.trades] };
    case 'ADD_TRADES':
      return { ...state, trades: [...action.payload, ...state.trades] };
    case 'UPDATE_TRADE':
      return {
        ...state,
        trades: state.trades.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRADE':
      return {
        ...state,
        trades: state.trades.filter((t) => t.id !== action.payload),
      };
    case 'SET_CURRENT_WEEK':
      return { ...state, currentWeek: action.payload };
    case 'CLEAR_ALL':
      return { trades: [], currentWeek: getCurrentWeekKey() };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

export function TradesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tradesReducer, {
    trades: [],
    currentWeek: getCurrentWeekKey(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingSupabase] = useState(() => isSupabaseConfigured());

  // Load trades on mount
  useEffect(() => {
    const loadTrades = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (isUsingSupabase) {
          // Load from Supabase
          const trades = await tradesService.fetchAllTrades();
          dispatch({ type: 'SET_TRADES', payload: trades });
        } else {
          // Fall back to localStorage
          const loaded = loadFromStorage();
          if (loaded.trades.length > 0 || loaded.currentWeek) {
            dispatch({
              type: 'LOAD_STATE',
              payload: {
                trades: loaded.trades,
                currentWeek: loaded.currentWeek || getCurrentWeekKey(),
              },
            });
          }
        }
      } catch (err) {
        console.error('Error loading trades:', err);
        setError('Failed to load trades. Using local storage as fallback.');
        // Fall back to localStorage on error
        const loaded = loadFromStorage();
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            trades: loaded.trades,
            currentWeek: loaded.currentWeek || getCurrentWeekKey(),
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTrades();
  }, [isUsingSupabase]);

  // Save to localStorage as backup (only if not using Supabase or as fallback)
  useEffect(() => {
    if (!isUsingSupabase && (state.trades.length > 0 || state.currentWeek)) {
      saveToStorage(state);
    }
  }, [state, isUsingSupabase]);

  const refreshTrades = async () => {
    if (!isUsingSupabase) return;

    setIsLoading(true);
    try {
      const trades = await tradesService.fetchAllTrades();
      dispatch({ type: 'SET_TRADES', payload: trades });
    } catch (err) {
      console.error('Error refreshing trades:', err);
      setError('Failed to refresh trades');
    } finally {
      setIsLoading(false);
    }
  };

  const isDuplicate = (trade: Partial<Trade>): Trade | null => {
    if (!trade.timestamp || !trade.symbol || trade.realizedPnl === undefined) {
      return null;
    }

    const tradeTime = new Date(trade.timestamp).getTime();
    const threshold = 60000;

    return (
      state.trades.find((t) => {
        const existingTime = new Date(t.timestamp).getTime();
        return (
          Math.abs(existingTime - tradeTime) < threshold &&
          t.symbol === trade.symbol &&
          Math.abs(t.realizedPnl - (trade.realizedPnl || 0)) < 0.01
        );
      }) || null
    );
  };

  const addTrade = async (trade: Trade) => {
    try {
      if (isUsingSupabase) {
        const inserted = await tradesService.insertTrade(trade);
        dispatch({ type: 'ADD_TRADE', payload: inserted });
      } else {
        dispatch({ type: 'ADD_TRADE', payload: trade });
      }
    } catch (err) {
      console.error('Error adding trade:', err);
      setError('Failed to add trade');
      // Still add locally as fallback
      dispatch({ type: 'ADD_TRADE', payload: trade });
    }
  };

  const addTrades = async (trades: Trade[]) => {
    try {
      if (isUsingSupabase) {
        const inserted = await tradesService.insertTrades(trades);
        dispatch({ type: 'ADD_TRADES', payload: inserted });
      } else {
        dispatch({ type: 'ADD_TRADES', payload: trades });
      }
    } catch (err) {
      console.error('Error adding trades:', err);
      setError('Failed to add trades');
      // Still add locally as fallback
      dispatch({ type: 'ADD_TRADES', payload: trades });
    }
  };

  const updateTrade = async (trade: Trade) => {
    const updatedTrade = { ...trade, updatedAt: new Date().toISOString() };
    try {
      if (isUsingSupabase) {
        const updated = await tradesService.updateTrade(updatedTrade);
        dispatch({ type: 'UPDATE_TRADE', payload: updated });
      } else {
        dispatch({ type: 'UPDATE_TRADE', payload: updatedTrade });
      }
    } catch (err) {
      console.error('Error updating trade:', err);
      setError('Failed to update trade');
      // Still update locally as fallback
      dispatch({ type: 'UPDATE_TRADE', payload: updatedTrade });
    }
  };

  const deleteTrade = async (id: string) => {
    try {
      if (isUsingSupabase) {
        await tradesService.deleteTrade(id);
      }
      dispatch({ type: 'DELETE_TRADE', payload: id });
    } catch (err) {
      console.error('Error deleting trade:', err);
      setError('Failed to delete trade');
      // Still delete locally
      dispatch({ type: 'DELETE_TRADE', payload: id });
    }
  };

  const setCurrentWeek = (week: string) => {
    dispatch({ type: 'SET_CURRENT_WEEK', payload: week });
  };

  const clearAll = async () => {
    try {
      if (isUsingSupabase) {
        await tradesService.deleteAllTrades();
      }
      dispatch({ type: 'CLEAR_ALL' });
    } catch (err) {
      console.error('Error clearing trades:', err);
      setError('Failed to clear trades');
      // Still clear locally
      dispatch({ type: 'CLEAR_ALL' });
    }
  };

  const importTrades = async (trades: Trade[]) => {
    const nonDuplicates = trades.filter((t) => !isDuplicate(t));
    if (nonDuplicates.length > 0) {
      await addTrades(nonDuplicates);
    }
  };

  return (
    <TradesContext.Provider
      value={{
        state,
        isLoading,
        error,
        isUsingSupabase,
        addTrade,
        addTrades,
        updateTrade,
        deleteTrade,
        setCurrentWeek,
        clearAll,
        importTrades,
        isDuplicate,
        refreshTrades,
      }}
    >
      {children}
    </TradesContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradesContext);
  if (context === undefined) {
    throw new Error('useTrades must be used within a TradesProvider');
  }
  return context;
}
