'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface WeeklyPnlChartProps {
  data: { week: string; pnl: number; label: string }[];
}

export function WeeklyPnlChart({ data }: WeeklyPnlChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-900 border border-dark-700 rounded-lg p-3 shadow-xl">
          <p className="text-dark-300 text-sm mb-1">{label}</p>
          <p
            className={`text-lg font-bold ${
              payload[0].value >= 0 ? 'text-accent-green' : 'text-accent-red'
            }`}
          >
            {payload[0].value >= 0 ? '+' : ''}
            {payload[0].value.toFixed(2)} USDT
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Net PnL (Last 12 Weeks)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c087" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00c087" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#40414f" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#8e8ea0', fontSize: 12 }}
                tickLine={{ stroke: '#40414f' }}
                axisLine={{ stroke: '#40414f' }}
              />
              <YAxis
                tick={{ fill: '#8e8ea0', fontSize: 12 }}
                tickLine={{ stroke: '#40414f' }}
                axisLine={{ stroke: '#40414f' }}
                tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#565869" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke="#00c087"
                strokeWidth={2}
                fill="url(#pnlGradient)"
                dot={{ fill: '#00c087', strokeWidth: 0, r: 4 }}
                activeDot={{ fill: '#00c087', strokeWidth: 2, stroke: '#fff', r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface WinLossChartProps {
  data: { week: string; wins: number; losses: number; label: string }[];
}

export function WinLossChart({ data }: WinLossChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-900 border border-dark-700 rounded-lg p-3 shadow-xl">
          <p className="text-dark-300 text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-accent-green text-sm">
              Wins: <span className="font-bold">{payload[0]?.value || 0}</span>
            </p>
            <p className="text-accent-red text-sm">
              Losses: <span className="font-bold">{payload[1]?.value || 0}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Win/Loss Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#40414f" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#8e8ea0', fontSize: 12 }}
                tickLine={{ stroke: '#40414f' }}
                axisLine={{ stroke: '#40414f' }}
              />
              <YAxis
                tick={{ fill: '#8e8ea0', fontSize: 12 }}
                tickLine={{ stroke: '#40414f' }}
                axisLine={{ stroke: '#40414f' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => (
                  <span className="text-dark-300 text-sm">{value}</span>
                )}
              />
              <Bar dataKey="wins" name="Wins" fill="#00c087" radius={[4, 4, 0, 0]} />
              <Bar dataKey="losses" name="Losses" fill="#ff4757" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface EquityCurveChartProps {
  data: { date: string; equity: number }[];
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-900 border border-dark-700 rounded-lg p-3 shadow-xl">
          <p className="text-dark-300 text-sm mb-1">{label}</p>
          <p
            className={`text-lg font-bold ${
              payload[0].value >= 0 ? 'text-accent-green' : 'text-accent-red'
            }`}
          >
            {payload[0].value >= 0 ? '+' : ''}
            {payload[0].value.toFixed(2)} USDT
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Equity Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#40414f" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#8e8ea0', fontSize: 12 }}
                tickLine={{ stroke: '#40414f' }}
                axisLine={{ stroke: '#40414f' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                tick={{ fill: '#8e8ea0', fontSize: 12 }}
                tickLine={{ stroke: '#40414f' }}
                axisLine={{ stroke: '#40414f' }}
                tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#565869" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ fill: '#3b82f6', strokeWidth: 2, stroke: '#fff', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
