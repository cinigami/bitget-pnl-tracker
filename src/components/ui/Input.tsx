import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-dark-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-dark-700 border ${
          error ? 'border-accent-red' : 'border-dark-600'
        } rounded-lg px-4 py-2.5 text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-green/50 focus:border-accent-green transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-accent-red">{error}</p>}
    </div>
  );
}
