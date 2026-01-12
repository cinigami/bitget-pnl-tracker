'use client';

import React from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { getWeekOptions, formatWeekRange } from '@/utils/dates';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface WeekSelectorProps {
  currentWeek: string;
  onWeekChange: (week: string) => void;
}

export function WeekSelector({ currentWeek, onWeekChange }: WeekSelectorProps) {
  const weekOptions = getWeekOptions(24);
  const currentIndex = weekOptions.findIndex((w) => w.key === currentWeek);

  const handlePrevious = () => {
    if (currentIndex < weekOptions.length - 1) {
      onWeekChange(weekOptions[currentIndex + 1].key);
    }
  };

  const handleNext = () => {
    if (currentIndex > 0) {
      onWeekChange(weekOptions[currentIndex - 1].key);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-dark-400">
        <Calendar size={18} />
        <span className="text-sm font-medium">Week:</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevious}
        disabled={currentIndex >= weekOptions.length - 1}
        className="p-2"
      >
        <ChevronLeft size={18} />
      </Button>

      <Select
        value={currentWeek}
        onChange={(e) => onWeekChange(e.target.value)}
        options={weekOptions.map((w) => ({
          value: w.key,
          label: w.label,
        }))}
        className="w-64"
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        disabled={currentIndex <= 0}
        className="p-2"
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  );
}
