'use client';

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Trade } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatDateTime } from '@/utils/dates';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

interface TradesTableProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

const columnHelper = createColumnHelper<Trade>();

export function TradesTable({ trades, onEdit, onDelete }: TradesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor('timestamp', {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-dark-100"
            onClick={() => column.toggleSorting()}
          >
            Date/Time
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={14} />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={14} />
            ) : (
              <ArrowUpDown size={14} className="text-dark-500" />
            )}
          </button>
        ),
        cell: (info) => (
          <span className="text-dark-200 text-sm">
            {formatDateTime(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('symbol', {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-dark-100"
            onClick={() => column.toggleSorting()}
          >
            Symbol
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={14} />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={14} />
            ) : (
              <ArrowUpDown size={14} className="text-dark-500" />
            )}
          </button>
        ),
        cell: (info) => (
          <span className="text-dark-100 font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('side', {
        header: 'Side',
        cell: (info) => {
          const side = info.getValue();
          return (
            <Badge
              variant={
                side === 'long' ? 'success' : side === 'short' ? 'danger' : 'neutral'
              }
            >
              {side.charAt(0).toUpperCase() + side.slice(1)}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('realizedPnl', {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-dark-100"
            onClick={() => column.toggleSorting()}
          >
            PnL (USDT)
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={14} />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={14} />
            ) : (
              <ArrowUpDown size={14} className="text-dark-500" />
            )}
          </button>
        ),
        cell: (info) => {
          const pnl = info.getValue();
          return (
            <span
              className={`font-mono font-medium ${
                pnl >= 0 ? 'text-accent-green' : 'text-accent-red'
              }`}
            >
              {pnl >= 0 ? '+' : ''}
              {pnl.toFixed(2)}
            </span>
          );
        },
      }),
      columnHelper.accessor('roi', {
        header: 'ROI',
        cell: (info) => {
          const roi = info.getValue();
          if (roi === null) return <span className="text-dark-500">-</span>;
          return (
            <span
              className={`text-sm ${
                roi >= 0 ? 'text-accent-green' : 'text-accent-red'
              }`}
            >
              {roi >= 0 ? '+' : ''}
              {roi.toFixed(2)}%
            </span>
          );
        },
      }),
      columnHelper.accessor('result', {
        header: 'Result',
        cell: (info) => {
          const result = info.getValue();
          const trade = info.row.original;
          if (trade.needsReview) {
            return <Badge variant="warning">Review</Badge>;
          }
          return (
            <Badge variant={result === 'win' ? 'success' : 'danger'}>
              {result.charAt(0).toUpperCase() + result.slice(1)}
            </Badge>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          if (filterValue === 'all') return true;
          if (filterValue === 'review') return row.original.needsReview;
          return row.getValue(columnId) === filterValue;
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(info.row.original)}
              className="p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(info.row.original.id)}
              className="p-1.5 rounded-lg text-dark-400 hover:text-accent-red hover:bg-dark-700 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: trades,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Trades History</CardTitle>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"
            />
            <Input
              type="text"
              placeholder="Search symbol..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 w-full sm:w-48"
            />
          </div>
          <Select
            value={
              (table.getColumn('result')?.getFilterValue() as string) || 'all'
            }
            onChange={(e) =>
              table.getColumn('result')?.setFilterValue(e.target.value)
            }
            options={[
              { value: 'all', label: 'All Results' },
              { value: 'win', label: 'Wins Only' },
              { value: 'loss', label: 'Losses Only' },
              { value: 'review', label: 'Needs Review' },
            ]}
            className="w-36"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-dark-700">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-dark-400"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-dark-500"
                  >
                    No trades found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
            <p className="text-sm text-dark-400">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
