import React from 'react';
import { Plus, RefreshCw, BarChart3, TrendingUp } from 'lucide-react';

export default function Navbar({ onOpenCreate, onResetDemo, onHomeClick, activeView }) {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={onHomeClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-sm group-hover:bg-blue-700 transition-all">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-lg font-extrabold text-slate-900 tracking-wider">
                QUANTFOLIO
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold uppercase tracking-wider">
                Quant Terminal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Portfolio Analytics & Risk Platform for Finance Students
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onResetDemo}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all hidden sm:flex items-center gap-1.5"
            title="Reset to default student quant portfolios"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Portfolio</span>
          </button>
        </div>
      </div>
    </header>
  );
}
