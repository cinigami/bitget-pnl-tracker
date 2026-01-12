import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-accent-green/20 text-accent-green border-accent-green/30',
    danger: 'bg-accent-red/20 text-accent-red border-accent-red/30',
    warning: 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30',
    info: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30',
    neutral: 'bg-dark-600/50 text-dark-300 border-dark-500',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
