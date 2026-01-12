import { Trade, AppState } from '@/types';

const STORAGE_KEY = 'bitget-pnl-tracker';

export function loadFromStorage(): AppState {
  if (typeof window === 'undefined') {
    return { trades: [], currentWeek: '' };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load from storage:', error);
  }

  return { trades: [], currentWeek: '' };
}

export function saveToStorage(state: AppState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

export function exportToJson(trades: Trade[]): string {
  return JSON.stringify(
    {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      trades,
    },
    null,
    2
  );
}

export function importFromJson(jsonString: string): Trade[] {
  try {
    const data = JSON.parse(jsonString);

    if (data.trades && Array.isArray(data.trades)) {
      return data.trades.map((trade: Trade) => ({
        ...trade,
        importedAt: new Date().toISOString(),
      }));
    }

    if (Array.isArray(data)) {
      return data;
    }

    throw new Error('Invalid JSON format');
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error}`);
  }
}

export function downloadJson(trades: Trade[], filename?: string): void {
  const json = exportToJson(trades);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `bitget-pnl-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
