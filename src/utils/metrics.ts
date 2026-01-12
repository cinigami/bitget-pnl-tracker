import { Trade, WeeklyMetrics, DailyPnl } from '@/types';
import {
  getISOWeekKey,
  getWeekRange,
  formatDateKey,
  getLast12Weeks,
  isDateInWeek,
} from './dates';
import { format, parseISO } from 'date-fns';

export function filterTradesByWeek(trades: Trade[], weekKey: string): Trade[] {
  return trades.filter((trade) => isDateInWeek(trade.timestamp, weekKey));
}

export function calculateWeeklyMetrics(trades: Trade[], weekKey: string): WeeklyMetrics {
  const weekTrades = filterTradesByWeek(trades, weekKey);
  const { start, end } = getWeekRange(weekKey);

  const wins = weekTrades.filter((t) => t.result === 'win');
  const losses = weekTrades.filter((t) => t.result === 'loss');

  const totalWins = wins.reduce((sum, t) => sum + t.realizedPnl, 0);
  const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.realizedPnl, 0));

  const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;

  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

  const dailyPnls = calculateDailyPnl(weekTrades);
  const { maxDrawdown, bestDay, worstDay } = calculateDrawdownAndExtremes(dailyPnls);

  return {
    weekKey,
    weekStart: format(start, 'yyyy-MM-dd'),
    weekEnd: format(end, 'yyyy-MM-dd'),
    netPnl: weekTrades.reduce((sum, t) => sum + t.realizedPnl, 0),
    totalTrades: weekTrades.length,
    winCount: wins.length,
    lossCount: losses.length,
    winRate: weekTrades.length > 0 ? (wins.length / weekTrades.length) * 100 : 0,
    avgWin,
    avgLoss,
    profitFactor: isFinite(profitFactor) ? profitFactor : 0,
    maxDrawdown,
    bestDay,
    worstDay,
  };
}

export function calculateDailyPnl(trades: Trade[]): DailyPnl[] {
  const dailyMap = new Map<string, { pnl: number; trades: number }>();

  trades.forEach((trade) => {
    const dateKey = formatDateKey(trade.timestamp);
    const existing = dailyMap.get(dateKey) || { pnl: 0, trades: 0 };
    dailyMap.set(dateKey, {
      pnl: existing.pnl + trade.realizedPnl,
      trades: existing.trades + 1,
    });
  });

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateDrawdownAndExtremes(dailyPnls: DailyPnl[]): {
  maxDrawdown: number;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
} {
  if (dailyPnls.length === 0) {
    return { maxDrawdown: 0, bestDay: null, worstDay: null };
  }

  let peak = 0;
  let maxDrawdown = 0;
  let cumulative = 0;

  let bestDay = dailyPnls[0];
  let worstDay = dailyPnls[0];

  dailyPnls.forEach((day) => {
    cumulative += day.pnl;

    if (cumulative > peak) {
      peak = cumulative;
    }

    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }

    if (day.pnl > bestDay.pnl) {
      bestDay = day;
    }
    if (day.pnl < worstDay.pnl) {
      worstDay = day;
    }
  });

  return {
    maxDrawdown,
    bestDay: { date: bestDay.date, pnl: bestDay.pnl },
    worstDay: { date: worstDay.date, pnl: worstDay.pnl },
  };
}

export function calculateCumulativeEquity(trades: Trade[]): { date: string; equity: number }[] {
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let cumulative = 0;
  const equityPoints: { date: string; equity: number }[] = [];

  sortedTrades.forEach((trade) => {
    cumulative += trade.realizedPnl;
    equityPoints.push({
      date: formatDateKey(trade.timestamp),
      equity: cumulative,
    });
  });

  const consolidatedMap = new Map<string, number>();
  equityPoints.forEach((point) => {
    consolidatedMap.set(point.date, point.equity);
  });

  return Array.from(consolidatedMap.entries())
    .map(([date, equity]) => ({ date, equity }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getWeeklyNetPnlData(
  trades: Trade[]
): { week: string; pnl: number; label: string }[] {
  const last12Weeks = getLast12Weeks();

  return last12Weeks.map((weekKey) => {
    const weekTrades = filterTradesByWeek(trades, weekKey);
    const pnl = weekTrades.reduce((sum, t) => sum + t.realizedPnl, 0);
    const { start } = getWeekRange(weekKey);

    return {
      week: weekKey,
      pnl,
      label: format(start, 'MMM d'),
    };
  });
}

export function getWeeklyWinLossData(
  trades: Trade[]
): { week: string; wins: number; losses: number; label: string }[] {
  const last12Weeks = getLast12Weeks();

  return last12Weeks.map((weekKey) => {
    const weekTrades = filterTradesByWeek(trades, weekKey);
    const { start } = getWeekRange(weekKey);

    return {
      week: weekKey,
      wins: weekTrades.filter((t) => t.result === 'win').length,
      losses: weekTrades.filter((t) => t.result === 'loss').length,
      label: format(start, 'MMM d'),
    };
  });
}

export function formatPnl(value: number): string {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)} USDT`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatProfitFactor(value: number): string {
  if (value === 0) return '0.00';
  if (!isFinite(value)) return '∞';
  return value.toFixed(2);
}
