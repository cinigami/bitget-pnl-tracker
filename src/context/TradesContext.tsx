'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Trade, AppState } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { getCurrentWeekKey } from '@/utils/dates';

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
  addTrade: (trade: Trade) => void;
  addTrades: (trades: Trade[]) => void;
  updateTrade: (trade: Trade) => void;
  deleteTrade: (id: string) => void;
  setCurrentWeek: (week: string) => void;
  clearAll: () => void;
  importTrades: (trades: Trade[]) => void;
  isDuplicate: (trade: Partial<Trade>) => Trade | null;
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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (state.trades.length > 0 || state.currentWeek) {
      saveToStorage(state);
    }
  }, [state]);

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

  const addTrade = (trade: Trade) => {
    dispatch({ type: 'ADD_TRADE', payload: trade });
  };

  const addTrades = (trades: Trade[]) => {
    dispatch({ type: 'ADD_TRADES', payload: trades });
  };

  const updateTrade = (trade: Trade) => {
    dispatch({ type: 'UPDATE_TRADE', payload: { ...trade, updatedAt: new Date().toISOString() } });
  };

  const deleteTrade = (id: string) => {
    dispatch({ type: 'DELETE_TRADE', payload: id });
  };

  const setCurrentWeek = (week: string) => {
    dispatch({ type: 'SET_CURRENT_WEEK', payload: week });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const importTrades = (trades: Trade[]) => {
    const nonDuplicates = trades.filter((t) => !isDuplicate(t));
    dispatch({ type: 'ADD_TRADES', payload: nonDuplicates });
  };

  return (
    <TradesContext.Provider
      value={{
        state,
        addTrade,
        addTrades,
        updateTrade,
        deleteTrade,
        setCurrentWeek,
        clearAll,
        importTrades,
        isDuplicate,
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
