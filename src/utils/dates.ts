import {
  startOfWeek,
  endOfWeek,
  format,
  getISOWeek,
  getYear,
  parseISO,
  subWeeks,
  addWeeks,
  isWithinInterval,
  startOfDay,
  eachDayOfInterval,
} from 'date-fns';

export function getISOWeekKey(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const year = getYear(d);
  const week = getISOWeek(d);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

export function getCurrentWeekKey(): string {
  return getISOWeekKey(new Date());
}

export function getWeekRange(weekKey: string): { start: Date; end: Date } {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  const jan4 = new Date(year, 0, 4);
  const startOfYear = startOfWeek(jan4, { weekStartsOn: 1 });
  const weekStart = addWeeks(startOfYear, week - 1);

  return {
    start: startOfWeek(weekStart, { weekStartsOn: 1 }),
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  };
}

export function formatWeekRange(weekKey: string): string {
  const { start, end } = getWeekRange(weekKey);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}

export function formatWeekShort(weekKey: string): string {
  const { start } = getWeekRange(weekKey);
  return format(start, 'MMM d');
}

export function getWeekOptions(count: number = 12): { key: string; label: string }[] {
  const options: { key: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = subWeeks(now, i);
    const key = getISOWeekKey(date);
    const label = formatWeekRange(key);
    options.push({ key, label });
  }

  return options;
}

export function isDateInWeek(date: Date | string, weekKey: string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const { start, end } = getWeekRange(weekKey);
  return isWithinInterval(d, { start, end });
}

export function getDaysInWeek(weekKey: string): Date[] {
  const { start, end } = getWeekRange(weekKey);
  return eachDayOfInterval({ start, end });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy HH:mm');
}

export function formatDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(startOfDay(d), 'yyyy-MM-dd');
}

export function getLast12Weeks(): string[] {
  const weeks: string[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    weeks.push(getISOWeekKey(subWeeks(now, i)));
  }

  return weeks;
}

export function parseFlexibleDate(dateStr: string): Date | null {
  const patterns = [
    /(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2}):?(\d{2})?/,
    /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/,
    /(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/,
    /(\w{3})\s+(\d{1,2}),?\s+(\d{4})\s+(\d{2}):(\d{2})/,
    /(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/,
  ];

  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      try {
        if (pattern === patterns[0]) {
          return new Date(
            parseInt(match[1]),
            parseInt(match[2]) - 1,
            parseInt(match[3]),
            parseInt(match[4]),
            parseInt(match[5]),
            parseInt(match[6] || '0')
          );
        }
        if (pattern === patterns[1] || pattern === patterns[2]) {
          return new Date(
            parseInt(match[3]),
            parseInt(match[1]) - 1,
            parseInt(match[2]),
            parseInt(match[4]),
            parseInt(match[5])
          );
        }
        if (pattern === patterns[4]) {
          return new Date(
            parseInt(match[1]),
            parseInt(match[2]) - 1,
            parseInt(match[3]),
            parseInt(match[4]),
            parseInt(match[5])
          );
        }
      } catch {
        continue;
      }
    }
  }

  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch {
    // ignore
  }

  return null;
}
