import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-dark-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full appearance-none bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 pr-10 text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50 focus:border-accent-green transition-colors ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
