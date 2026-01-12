'use client';

import React from 'react';
import { WeeklyMetrics } from '@/types';
import { Card } from '@/components/ui/Card';
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Award,
  AlertTriangle,
  DollarSign,
  Percent,
} from 'lucide-react';
import { formatPnl, formatPercentage, formatProfitFactor } from '@/utils/metrics';
import { formatDateShort } from '@/utils/dates';

interface KPICardsProps {
  metrics: WeeklyMetrics;
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
}

function KPICard({ title, value, subtitle, icon, trend }: KPICardProps) {
  const trendColors = {
    positive: 'text-accent-green',
    negative: 'text-accent-red',
    neutral: 'text-dark-300',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dark-400 mb-1">{title}</p>
          <p
            className={`text-2xl font-bold ${
              trend ? trendColors[trend] : 'text-dark-100'
            }`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-dark-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-dark-700/50">{icon}</div>
      </div>
    </Card>
  );
}

export function KPICards({ metrics }: KPICardsProps) {
  const cards = [
    {
      title: 'Net PnL',
      value: formatPnl(metrics.netPnl),
      subtitle: 'This week',
      icon: <DollarSign size={20} className={metrics.netPnl >= 0 ? 'text-accent-green' : 'text-accent-red'} />,
      trend: metrics.netPnl > 0 ? 'positive' : metrics.netPnl < 0 ? 'negative' : 'neutral',
    },
    {
      title: 'Win Rate',
      value: formatPercentage(metrics.winRate),
      subtitle: `${metrics.winCount}W / ${metrics.lossCount}L`,
      icon: <Target size={20} className="text-accent-blue" />,
      trend: metrics.winRate >= 50 ? 'positive' : 'negative',
    },
    {
      title: 'Total Trades',
      value: metrics.totalTrades.toString(),
      subtitle: 'This week',
      icon: <BarChart3 size={20} className="text-dark-300" />,
      trend: 'neutral',
    },
    {
      title: 'Avg Win',
      value: `+${metrics.avgWin.toFixed(2)}`,
      subtitle: 'USDT per win',
      icon: <TrendingUp size={20} className="text-accent-green" />,
      trend: 'positive',
    },
    {
      title: 'Avg Loss',
      value: `-${metrics.avgLoss.toFixed(2)}`,
      subtitle: 'USDT per loss',
      icon: <TrendingDown size={20} className="text-accent-red" />,
      trend: 'negative',
    },
    {
      title: 'Profit Factor',
      value: formatProfitFactor(metrics.profitFactor),
      subtitle: metrics.profitFactor >= 1.5 ? 'Good' : metrics.profitFactor >= 1 ? 'Fair' : 'Poor',
      icon: <Percent size={20} className={metrics.profitFactor >= 1 ? 'text-accent-green' : 'text-accent-red'} />,
      trend: metrics.profitFactor >= 1 ? 'positive' : 'negative',
    },
    {
      title: 'Max Drawdown',
      value: `-${metrics.maxDrawdown.toFixed(2)}`,
      subtitle: 'USDT this week',
      icon: <AlertTriangle size={20} className="text-accent-yellow" />,
      trend: 'negative',
    },
    {
      title: 'Best Day',
      value: metrics.bestDay ? `+${metrics.bestDay.pnl.toFixed(2)}` : 'N/A',
      subtitle: metrics.bestDay ? formatDateShort(metrics.bestDay.date) : '',
      icon: <Award size={20} className="text-accent-green" />,
      trend: 'positive',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KPICard
          key={card.title}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          trend={card.trend as 'positive' | 'negative' | 'neutral'}
        />
      ))}
    </div>
  );
}
