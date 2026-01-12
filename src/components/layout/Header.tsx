'use client';

import React from 'react';
import { BarChart3, Github } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-sm border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green/10 rounded-xl">
              <BarChart3 size={24} className="text-accent-green" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-dark-100">
                Bitget PnL Tracker
              </h1>
              <p className="text-xs text-dark-500">
                Screenshot-based trading analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
