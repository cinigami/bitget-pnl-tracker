'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { UploadSection } from '@/components/upload/UploadSection';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Button } from '@/components/ui/Button';
import { Upload, BarChart3 } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'import' | 'dashboard'>('dashboard');

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 p-1 bg-dark-800 rounded-xl w-fit">
            <Button
              variant={activeTab === 'dashboard' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              className="gap-2"
            >
              <BarChart3 size={16} />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'import' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('import')}
              className="gap-2"
            >
              <Upload size={16} />
              Import Screenshots
            </Button>
          </div>
        </div>

        {activeTab === 'import' ? <UploadSection /> : <Dashboard />}
      </main>

      <footer className="border-t border-dark-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-dark-500">
            Bitget PnL Tracker - Screenshot-based trading analytics with OCR
          </p>
        </div>
      </footer>
    </div>
  );
}
