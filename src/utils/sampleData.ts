import { Trade, OCRResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { subDays, subHours, format } from 'date-fns';

export const sampleOCRTexts: { name: string; text: string }[] = [
  {
    name: 'BTC Long Win',
    text: `Bitget Futures
BTCUSDT Perpetual
Close Position

Date: 2024-01-08 14:32:15
Side: Long
Entry Price: 42,150.50
Close Price: 43,280.00

Realized PNL: +1,129.50 USDT
ROI: +2.68%
Trading Fee: -8.45 USDT

Net Profit: +1,121.05 USDT`,
  },
  {
    name: 'ETH Short Loss',
    text: `Bitget Futures
ETHUSDT Perpetual
Position Closed

2024-01-07 09:15:42
Direction: SHORT
Open: 2,285.30
Close: 2,342.15

Realized P&L: -568.50 USDT
Return: -4.21%
Fees: 4.25 USDT`,
  },
  {
    name: 'SOL Long Win',
    text: `SOLUSDT PERP
Closed Position Details

Time: 2024/01/06 18:45:00
Type: LONG

PNL: +245.80 USDT
ROI: +8.15%
Fee: 2.10 USDT`,
  },
  {
    name: 'XRP Short Win',
    text: `Contract: XRPUSDT
Perpetual Futures

Close Date: 01/05/2024 11:20
Position: Short

Realized Profit: +89.25 USDT
ROI: +3.45%
Commission: 1.50 USDT`,
  },
  {
    name: 'DOGE Long Loss',
    text: `DOGEUSDT
Futures Position

2024-01-04T16:30:22
Side: Long

PNL: (125.40) USDT
Return: -5.20%
Fee: 1.80 USDT`,
  },
  {
    name: 'AVAX Long Win',
    text: `Bitget
AVAXUSDT Perpetual

Closing Time: 2024-01-03 20:15:33
Direction: Long

Realized PnL: +312.65 USDT
ROI: +6.85%
Trading Fee: 3.20 USDT`,
  },
  {
    name: 'LINK Short Loss',
    text: `LINK/USDT Perpetual
Position Summary

Date: 2024-01-02 08:45:10
Type: SHORT

Net PNL: -78.90 USDT
ROI: -2.15%
Fees: 1.25 USDT`,
  },
  {
    name: 'BNB Long Win',
    text: `BNBUSDT PERP
Trade Details

Closed: 2024/01/01 12:00:00
Side: Long

Realized P&L: +456.30 USDT
Return: +4.50%
Fee: 5.10 USDT`,
  },
];

export function generateSampleTrades(): Trade[] {
  const now = new Date();
  const trades: Trade[] = [];

  const tradeData = [
    { symbol: 'BTCUSDT', pnl: 1250.50, side: 'long' as const, daysAgo: 1, hoursAgo: 2 },
    { symbol: 'ETHUSDT', pnl: -320.75, side: 'short' as const, daysAgo: 1, hoursAgo: 8 },
    { symbol: 'SOLUSDT', pnl: 445.20, side: 'long' as const, daysAgo: 2, hoursAgo: 4 },
    { symbol: 'BTCUSDT', pnl: 890.00, side: 'long' as const, daysAgo: 2, hoursAgo: 12 },
    { symbol: 'XRPUSDT', pnl: -150.30, side: 'long' as const, daysAgo: 3, hoursAgo: 6 },
    { symbol: 'DOGEUSDT', pnl: 78.50, side: 'short' as const, daysAgo: 3, hoursAgo: 18 },
    { symbol: 'AVAXUSDT', pnl: 562.80, side: 'long' as const, daysAgo: 4, hoursAgo: 3 },
    { symbol: 'LINKUSDT', pnl: -88.45, side: 'short' as const, daysAgo: 4, hoursAgo: 15 },
    { symbol: 'BTCUSDT', pnl: -425.00, side: 'short' as const, daysAgo: 5, hoursAgo: 7 },
    { symbol: 'ETHUSDT', pnl: 680.25, side: 'long' as const, daysAgo: 5, hoursAgo: 20 },
    { symbol: 'MATICUSDT', pnl: 125.60, side: 'long' as const, daysAgo: 6, hoursAgo: 5 },
    { symbol: 'SOLUSDT', pnl: -210.90, side: 'short' as const, daysAgo: 6, hoursAgo: 14 },
    { symbol: 'BTCUSDT', pnl: 1580.40, side: 'long' as const, daysAgo: 8, hoursAgo: 9 },
    { symbol: 'ETHUSDT', pnl: 445.75, side: 'long' as const, daysAgo: 8, hoursAgo: 16 },
    { symbol: 'ARBUSDT', pnl: -95.20, side: 'short' as const, daysAgo: 9, hoursAgo: 3 },
    { symbol: 'OPUSDT', pnl: 280.30, side: 'long' as const, daysAgo: 9, hoursAgo: 21 },
    { symbol: 'BTCUSDT', pnl: -780.50, side: 'short' as const, daysAgo: 10, hoursAgo: 8 },
    { symbol: 'ETHUSDT', pnl: 320.40, side: 'long' as const, daysAgo: 10, hoursAgo: 17 },
    { symbol: 'SOLUSDT', pnl: 195.80, side: 'long' as const, daysAgo: 11, hoursAgo: 4 },
    { symbol: 'XRPUSDT', pnl: 112.25, side: 'long' as const, daysAgo: 11, hoursAgo: 13 },
    { symbol: 'BTCUSDT', pnl: 2150.00, side: 'long' as const, daysAgo: 15, hoursAgo: 6 },
    { symbol: 'ETHUSDT', pnl: -540.80, side: 'short' as const, daysAgo: 15, hoursAgo: 19 },
    { symbol: 'BNBUSDT', pnl: 385.45, side: 'long' as const, daysAgo: 16, hoursAgo: 2 },
    { symbol: 'DOGEUSDT', pnl: -62.30, side: 'long' as const, daysAgo: 16, hoursAgo: 11 },
    { symbol: 'BTCUSDT', pnl: 920.75, side: 'long' as const, daysAgo: 18, hoursAgo: 7 },
    { symbol: 'AVAXUSDT', pnl: -185.40, side: 'short' as const, daysAgo: 18, hoursAgo: 15 },
    { symbol: 'ETHUSDT', pnl: 730.20, side: 'long' as const, daysAgo: 20, hoursAgo: 4 },
    { symbol: 'SOLUSDT', pnl: 425.90, side: 'long' as const, daysAgo: 20, hoursAgo: 22 },
    { symbol: 'BTCUSDT', pnl: -310.60, side: 'short' as const, daysAgo: 22, hoursAgo: 9 },
    { symbol: 'LINKUSDT', pnl: 168.35, side: 'long' as const, daysAgo: 22, hoursAgo: 18 },
    { symbol: 'BTCUSDT', pnl: 1890.25, side: 'long' as const, daysAgo: 25, hoursAgo: 5 },
    { symbol: 'ETHUSDT', pnl: 520.80, side: 'long' as const, daysAgo: 25, hoursAgo: 14 },
    { symbol: 'ARBUSDT', pnl: -145.70, side: 'short' as const, daysAgo: 27, hoursAgo: 8 },
    { symbol: 'OPUSDT', pnl: 235.40, side: 'long' as const, daysAgo: 27, hoursAgo: 20 },
    { symbol: 'BTCUSDT', pnl: -620.90, side: 'short' as const, daysAgo: 30, hoursAgo: 3 },
    { symbol: 'ETHUSDT', pnl: 890.55, side: 'long' as const, daysAgo: 30, hoursAgo: 16 },
    { symbol: 'SOLUSDT', pnl: 310.25, side: 'long' as const, daysAgo: 35, hoursAgo: 7 },
    { symbol: 'BTCUSDT', pnl: 1420.80, side: 'long' as const, daysAgo: 35, hoursAgo: 19 },
    { symbol: 'MATICUSDT', pnl: -98.45, side: 'short' as const, daysAgo: 40, hoursAgo: 4 },
    { symbol: 'XRPUSDT', pnl: 175.60, side: 'long' as const, daysAgo: 40, hoursAgo: 12 },
    { symbol: 'BTCUSDT', pnl: 2340.00, side: 'long' as const, daysAgo: 45, hoursAgo: 6 },
    { symbol: 'ETHUSDT', pnl: -420.35, side: 'short' as const, daysAgo: 45, hoursAgo: 17 },
    { symbol: 'DOGEUSDT', pnl: 95.80, side: 'long' as const, daysAgo: 50, hoursAgo: 9 },
    { symbol: 'AVAXUSDT', pnl: 485.25, side: 'long' as const, daysAgo: 50, hoursAgo: 21 },
    { symbol: 'BTCUSDT', pnl: -890.70, side: 'short' as const, daysAgo: 55, hoursAgo: 3 },
    { symbol: 'ETHUSDT', pnl: 620.40, side: 'long' as const, daysAgo: 55, hoursAgo: 15 },
    { symbol: 'LINKUSDT', pnl: 265.90, side: 'long' as const, daysAgo: 60, hoursAgo: 8 },
    { symbol: 'SOLUSDT', pnl: -175.25, side: 'short' as const, daysAgo: 60, hoursAgo: 18 },
    { symbol: 'BTCUSDT', pnl: 1680.55, side: 'long' as const, daysAgo: 65, hoursAgo: 5 },
    { symbol: 'BNBUSDT', pnl: 340.80, side: 'long' as const, daysAgo: 65, hoursAgo: 14 },
  ];

  tradeData.forEach((data) => {
    const timestamp = subHours(subDays(now, data.daysAgo), data.hoursAgo);
    const result = data.pnl > 0 ? 'win' : data.pnl < 0 ? 'loss' : 'breakeven';

    trades.push({
      id: uuidv4(),
      timestamp: timestamp.toISOString(),
      symbol: data.symbol,
      side: data.side,
      realizedPnl: data.pnl,
      fees: Math.abs(data.pnl * 0.001),
      roi: (data.pnl / 10000) * 100,
      result: result as 'win' | 'loss' | 'breakeven',
      needsReview: false,
      confidence: {
        timestamp: 'high',
        symbol: 'high',
        pnl: 'high',
        overall: 'high',
      },
      createdAt: timestamp.toISOString(),
      updatedAt: timestamp.toISOString(),
    });
  });

  return trades.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function generateShareableSummary(
  trades: Trade[],
  weekKey: string,
  metrics: {
    netPnl: number;
    winRate: number;
    totalTrades: number;
    profitFactor: number;
  }
): string {
  const lines = [
    `📊 Bitget PnL Weekly Report`,
    `Week: ${weekKey}`,
    ``,
    `💰 Net PnL: ${metrics.netPnl >= 0 ? '+' : ''}${metrics.netPnl.toFixed(2)} USDT`,
    `📈 Win Rate: ${metrics.winRate.toFixed(1)}%`,
    `📋 Total Trades: ${metrics.totalTrades}`,
    `⚖️ Profit Factor: ${metrics.profitFactor.toFixed(2)}`,
    ``,
    `Generated with Bitget PnL Tracker`,
  ];

  return lines.join('\n');
}
