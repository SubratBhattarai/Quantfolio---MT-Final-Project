import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  Check,
  X,
  Activity,
  BarChart2
} from 'lucide-react';
import { fetchPortfolio, updateHolding, deleteHolding, addHolding } from '../api';
import EditHoldingModal from './EditHoldingModal';
import ConfirmModal from './ConfirmModal';
import AddHoldingModal from './AddHoldingModal';

export default function PortfolioDetail({ 
  portfolioId, 
  onBack, 
  onPortfolioUpdated 
}) {
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [editingHolding, setEditingHolding] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [holdingToDelete, setHoldingToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Inline quantity quick editing state
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [inlineQuantity, setInlineQuantity] = useState('');
  const [isSavingInline, setIsSavingInline] = useState(false);

  // Notification feedback
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await fetchPortfolio(portfolioId);
      setPortfolio(data);
    } catch (err) {
      setError(err.message || 'Failed to load portfolio details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, [portfolioId]);

  // Handler for Updating Holding Quantity & Info
  const handleSaveHolding = async (holdingId, updatedFields) => {
    try {
      await updateHolding(holdingId, updatedFields);
      showToast(`Holding quantity updated and saved.`);
      await loadPortfolioData();
      if (onPortfolioUpdated) onPortfolioUpdated();
    } catch (err) {
      alert(`Error updating holding: ${err.message}`);
      throw err;
    }
  };

  // Handler for Inline Quick Edit Quantity
  const handleStartInlineEdit = (holding) => {
    setInlineEditingId(holding.id);
    setInlineQuantity(holding.quantity.toString());
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingId(null);
    setInlineQuantity('');
  };

  const handleSaveInlineQuantity = async (holding) => {
    const num = parseFloat(inlineQuantity);
    if (isNaN(num) || num <= 0) {
      alert('Holding quantity must be a positive number greater than 0.');
      return;
    }
    try {
      setIsSavingInline(true);
      await updateHolding(holding.id, { quantity: num });
      setInlineEditingId(null);
      showToast(`Quantity for ${holding.ticker} updated to ${num}. Changes saved.`);
      await loadPortfolioData();
      if (onPortfolioUpdated) onPortfolioUpdated();
    } catch (err) {
      alert(`Error updating quantity: ${err.message}`);
    } finally {
      setIsSavingInline(false);
    }
  };

  // Handler for Holding Removal (AFTER CONFIRMATION)
  const handleConfirmDelete = async () => {
    if (!holdingToDelete) return;
    try {
      const ticker = holdingToDelete.ticker;
      await deleteHolding(holdingToDelete.id);
      setIsDeleteModalOpen(false);
      setHoldingToDelete(null);
      showToast(`Holding ${ticker} removed from portfolio.`);
      await loadPortfolioData();
      if (onPortfolioUpdated) onPortfolioUpdated();
    } catch (err) {
      alert(`Error removing holding: ${err.message}`);
    }
  };

  // Handler for Adding New Stock Holding
  const handleAddHolding = async (holdingData) => {
    try {
      await addHolding(portfolioId, holdingData);
      showToast(`Stock ${holdingData.ticker} (${holdingData.quantity} shares) added successfully.`);
      await loadPortfolioData();
      if (onPortfolioUpdated) onPortfolioUpdated();
    } catch (err) {
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-sm font-medium">Loading portfolio holdings & price data...</p>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="p-8 bg-white border border-rose-200 rounded-2xl text-center shadow-xs">
        <p className="text-rose-600 mb-4 font-medium">{error || 'Portfolio not found.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 text-slate-800 text-sm font-medium rounded-xl hover:bg-slate-200 transition-all"
        >
          Back to Portfolios
        </button>
      </div>
    );
  }

  const isGain = portfolio.total_unrealized_pnl >= 0;
  const holdings = portfolio.holdings || [];
  const riskMetrics = portfolio.risk_metrics || { metrics: [] };
  const attribution = portfolio.market_data_attribution || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 bg-emerald-500 rounded-full p-0.5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all flex items-center gap-2 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolios</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadPortfolioData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs"
            title="Refresh Holdings from Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Portfolio Header Banner with Market Status & Currency */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="font-mono text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold tracking-wide">
                BENCHMARK: {portfolio.benchmark || 'SPY'}
              </span>
              <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold tracking-wide">
                CURRENCY: {portfolio.currency || 'USD'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Updated: {portfolio.formatted_last_updated || 'Just now'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {portfolio.name}
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {portfolio.description || 'Quantitative factor investment strategy.'}
            </p>
          </div>

          {/* Key Portfolio Valuations & Total Market Value Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {/* Portfolio Summary Card for Total Market Value */}
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200/80 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-blue-900 font-bold">Total Market Value</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold">
                  {holdings.length > 0 ? `${holdings.length} Assets` : 'Empty'}
                </span>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-black text-blue-900 mt-1">
                ${(portfolio.total_market_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-blue-700/80 mt-1 font-sans">
                {holdings.length > 0
                  ? 'Σ (Quantity × Latest Price)'
                  : 'Zero securities ($0.00)'}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Portfolio NAV</div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                ${(portfolio.total_portfolio_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Market Value + Cash ({portfolio.currency || 'USD'})</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Cumulative Return</div>
              <div className={`font-mono text-xl sm:text-2xl font-bold mt-1 ${isGain ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isGain ? '+' : ''}${(portfolio.total_unrealized_pnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="font-mono text-[11px] text-slate-500 mt-1">
                {isGain ? '+' : ''}{(portfolio.total_unrealized_pnl_percent || 0).toFixed(2)}% on capital
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Cash Balance</div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-slate-700 mt-1">
                ${(portfolio.cash_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Unallocated ({portfolio.currency || 'USD'})</div>
            </div>
          </div>
        </div>

        {/* Asset Allocation Exposure */}
        {portfolio.asset_allocation && Object.keys(portfolio.asset_allocation).length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
              <span>Asset Allocation Exposure</span>
              <span>100% Total Exposure</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              {Object.entries(portfolio.asset_allocation).map(([cls, pct], idx) => {
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500'];
                const color = colors[idx % colors.length];
                return (
                  <div
                    key={cls}
                    style={{ width: `${pct}%` }}
                    className={`${color} h-full transition-all`}
                    title={`${cls}: ${pct}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
              {Object.entries(portfolio.asset_allocation).map(([cls, pct], idx) => {
                const dotColors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500'];
                return (
                  <div key={cls} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
                    <span className="text-slate-700 font-medium">{cls}:</span>
                    <span className="font-mono text-slate-500">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Performance & Risk Metrics Dashboard */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Performance & Quantitative Risk Metrics
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Standardized risk-adjusted return, volatility, beta, and concentration analytics.
            </p>
          </div>
          {riskMetrics.sufficiency_note && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{riskMetrics.sufficiency_note}</span>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {riskMetrics.metrics && riskMetrics.metrics.map((metric) => {
            const isPos = metric.status === 'positive' || metric.status === 'optimal';
            const isCaut = metric.status === 'caution' || metric.status === 'danger';

            return (
              <div 
                key={metric.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-slate-700 truncate" title={metric.label}>
                      {metric.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-white text-slate-600 border border-slate-200 rounded font-medium shrink-0">
                      {metric.period}
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-xl font-bold text-slate-900 flex items-baseline gap-2">
                    <span className={isPos ? 'text-emerald-700' : (isCaut ? 'text-amber-700' : 'text-slate-900')}>
                      {metric.value}
                    </span>
                    {metric.dollar_value && (
                      <span className="text-xs text-slate-500 font-normal">
                        ({metric.dollar_value})
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2.5 leading-snug">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holdings Table Section with Price, Currency, and Last-Updated Time */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Holdings & Positions</span>
              <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-blue-700 rounded-full font-mono font-semibold">
                {holdings.length} Positions
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Surfaces ticker, quantity, available price, currency, last-updated sync time, and valuation.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>

        {holdings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">Empty Portfolio — $0.00 Market Value</h4>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
              No holdings have been added yet. Total market value of securities is <strong>$0.00 USD</strong>.
              Add a stock position to calculate portfolio valuation and performance metrics.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Stock Position
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 font-mono">
                <tr>
                  <th className="py-3.5 px-4">Stock Ticker</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4 text-right">
                    Quantity <span className="text-blue-600 font-normal">(Editable)</span>
                  </th>
                  <th className="py-3.5 px-4 text-right">Available Price & Currency</th>
                  <th className="py-3.5 px-4 text-center">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">1D Change</th>
                  <th className="py-3.5 px-4 text-right">Cost Basis</th>
                  <th className="py-3.5 px-4 text-right">Market Value</th>
                  <th className="py-3.5 px-4 text-right">Weight</th>
                  <th className="py-3.5 px-4 text-right">Unrealized P&L</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {holdings.map((h) => {
                  const hGain = h.unrealized_pnl >= 0;
                  const dayGain = h.day_change >= 0;
                  const isInlineEditing = inlineEditingId === h.id;

                  return (
                    <tr 
                      key={h.id} 
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Asset & Ticker */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base tracking-wider">{h.ticker}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-sans truncate max-w-[140px]" title={h.name}>
                          {h.name || h.ticker}
                        </div>
                      </td>

                      {/* Asset Class */}
                      <td className="py-4 px-4 font-sans text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 text-[11px]">
                          {h.asset_class || 'Equities'}
                        </span>
                      </td>

                      {/* Quantity (Editable inline or modal) */}
                      <td className="py-4 px-4 text-right">
                        {isInlineEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              step="any"
                              min="0.0001"
                              value={inlineQuantity}
                              onChange={(e) => setInlineQuantity(e.target.value)}
                              className="w-20 bg-white border border-blue-600 rounded px-2 py-1 text-right text-slate-900 text-xs font-mono focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInlineQuantity(h);
                                if (e.key === 'Escape') handleCancelInlineEdit();
                              }}
                            />
                            <button
                              onClick={() => handleSaveInlineQuantity(h)}
                              disabled={isSavingInline}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                              title="Save quantity"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleCancelInlineEdit}
                              className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartInlineEdit(h)}
                            className="cursor-pointer group/qty inline-flex items-center gap-1.5 justify-end hover:text-blue-600"
                            title="Click to edit quantity"
                          >
                            <span className="font-bold text-slate-900 group-hover/qty:text-blue-600 transition-colors">
                              {h.quantity}
                            </span>
                            <Edit3 className="w-3 h-3 text-slate-400 group-hover/qty:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" />
                          </div>
                        )}
                      </td>

                      {/* Available Price & Currency */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded">
                          <span className="font-bold text-blue-700 text-xs">
                            ${(h.available_price || h.current_price).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-blue-500 font-semibold">
                            {h.currency || 'USD'}
                          </span>
                        </div>
                      </td>

                      {/* Last Updated Time */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-xs text-slate-500 font-mono inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {h.formatted_last_updated || 'Active'}
                        </span>
                      </td>

                      {/* 1D Change */}
                      <td className="py-4 px-4 text-right">
                        <span className={`text-xs font-semibold ${dayGain ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {dayGain ? '+' : ''}${h.day_change?.toFixed(2)} ({dayGain ? '+' : ''}{h.day_change_percent?.toFixed(2)}%)
                        </span>
                      </td>

                      {/* Cost Basis */}
                      <td className="py-4 px-4 text-right text-slate-500 text-xs">
                        ${h.buy_price.toFixed(2)}
                      </td>

                      {/* Position Market Value */}
                      <td className="py-4 px-4 text-right text-slate-900 font-bold">
                        ${h.market_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Weight % */}
                      <td className="py-4 px-4 text-right text-slate-500 text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                          {h.weight_percent.toFixed(1)}%
                        </span>
                      </td>

                      {/* Unrealized P&L */}
                      <td className="py-4 px-4 text-right">
                        <div className={`font-semibold text-xs ${hGain ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {hGain ? '+' : ''}${h.unrealized_pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-[11px] ${hGain ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {hGain ? '+' : ''}{h.unrealized_pnl_percent.toFixed(2)}%
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingHolding(h);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Holding Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setHoldingToDelete(h);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Position"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Market Data Attribution & Compliance Footer */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {attribution.disclaimer || "Market data provided via Yahoo Finance & Normalized Exchange Feeds. Quotes are delayed by 15-20 minutes. Strictly for educational portfolio analytics."}
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-400 shrink-0">
          Feed: {attribution.provider || "Yahoo Finance"} &bull; {attribution.currency || "USD"} &bull; {attribution.rate_limit || "2,000 req/hr"}
        </div>
      </div>

      {/* Edit Holding Modal */}
      <EditHoldingModal
        isOpen={isEditModalOpen}
        holding={editingHolding}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHolding(null);
        }}
        onSave={handleSaveHolding}
      />

      {/* Delete Holding Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Remove Position Confirmation"
        message="Are you sure you want to remove this stock position from your portfolio? This action will delete the holding from the database."
        itemName={holdingToDelete ? `${holdingToDelete.ticker} — ${holdingToDelete.quantity} shares` : ''}
        confirmText="Confirm Remove"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setHoldingToDelete(null);
        }}
      />

      {/* Add Stock Form Modal */}
      <AddHoldingModal
        isOpen={isAddModalOpen}
        existingHoldings={holdings}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddHolding}
      />
    </div>
  );
}
