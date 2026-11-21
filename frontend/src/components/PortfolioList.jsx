import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Layers, 
  ArrowUpRight, 
  Trash2, 
  RefreshCw,
  FolderPlus
} from 'lucide-react';

export default function PortfolioList({ 
  portfolios = [], 
  onSelectPortfolio, 
  onOpenCreate, 
  onDeletePortfolio, 
  onRefresh,
  isLoading 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [benchmarkFilter, setBenchmarkFilter] = useState('ALL');

  // Compute aggregate metrics across all portfolios for student dashboard
  const aggregateMetrics = portfolios.reduce((acc, p) => {
    acc.totalValue += p.total_portfolio_value || 0;
    acc.totalCost += p.total_cost || 0;
    acc.totalPnl += p.total_unrealized_pnl || 0;
    acc.totalHoldings += p.holdings_count || 0;
    return acc;
  }, { totalValue: 0, totalCost: 0, totalPnl: 0, totalHoldings: 0 });

  const aggregatePnlPct = aggregateMetrics.totalCost > 0 
    ? (aggregateMetrics.totalPnl / aggregateMetrics.totalCost) * 100 
    : 0;

  // Filter portfolios
  const filteredPortfolios = portfolios.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.top_holdings && p.top_holdings.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesBenchmark = benchmarkFilter === 'ALL' || p.benchmark === benchmarkFilter;
    return matchesSearch && matchesBenchmark;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Aggregate Quant Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Net Assets</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-slate-900 tracking-tight">
            ${aggregateMetrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-1 text-xs text-slate-500">Combined portfolio valuations</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Unrealized P&L</span>
            <div className={`p-2 rounded-xl ${aggregateMetrics.totalPnl >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {aggregateMetrics.totalPnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className={`mt-3 font-mono text-2xl font-bold tracking-tight ${aggregateMetrics.totalPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {aggregateMetrics.totalPnl >= 0 ? '+' : ''}${aggregateMetrics.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            {aggregatePnlPct >= 0 ? '+' : ''}{aggregatePnlPct.toFixed(2)}% on capital
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Portfolios</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-slate-900 tracking-tight">
            {portfolios.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">Quantitative fund strategies</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Positions</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-slate-900 tracking-tight">
            {aggregateMetrics.totalHoldings}
          </div>
          <p className="mt-1 text-xs text-slate-500">Securities and holdings tracked</p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by strategy, thesis, or ticker..."
              className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors shadow-xs"
            />
          </div>

          <select
            value={benchmarkFilter}
            onChange={(e) => setBenchmarkFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl px-3.5 py-2 focus:border-blue-600 transition-colors shadow-xs"
          >
            <option value="ALL">All Benchmarks</option>
            <option value="SPY">SPY (S&P 500)</option>
            <option value="QQQ">QQQ (Nasdaq 100)</option>
            <option value="IWM">IWM (Russell 2000)</option>
            <option value="ACWI">ACWI (Global)</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-xs"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Portfolio</span>
          </button>
        </div>
      </div>

      {/* Portfolio Grid */}
      {filteredPortfolios.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
          <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Portfolios Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || benchmarkFilter !== 'ALL'
              ? 'No portfolios match your current search criteria.'
              : 'Create your first quantitative portfolio model to start monitoring holdings and risk.'}
          </p>
          <button
            onClick={onOpenCreate}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Portfolio</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map((portfolio) => {
            const isGain = portfolio.total_unrealized_pnl >= 0;
            return (
              <div
                key={portfolio.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group relative shadow-xs"
              >
                <div>
                  {/* Top Tags & Benchmark */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold tracking-wide">
                      BENCHMARK: {portfolio.benchmark || 'SPY'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePortfolio(portfolio);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Portfolio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Portfolio Name */}
                  <h3 
                    onClick={() => onSelectPortfolio(portfolio.id)}
                    className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer tracking-tight"
                  >
                    {portfolio.name}
                  </h3>

                  {/* Description / Thesis */}
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {portfolio.description || 'Quantitative portfolio investment model.'}
                  </p>

                  {/* Portfolio Value & PnL */}
                  <div className="mt-5 pt-4 border-t border-slate-100">

                    {/* Total Market Value — primary valuation line */}
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="text-xs font-semibold text-blue-700">Total Market Value</span>
                        <p className="text-[10px] text-slate-400 leading-tight">Securities (Qty × Price)</p>
                      </div>
                      <span className="font-mono text-lg font-bold text-blue-700">
                        {portfolio.holdings_count === 0
                          ? '$0.00'
                          : `$${portfolio.total_market_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 my-2" />

                    {/* Total Portfolio NAV */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">Total Portfolio NAV</span>
                      <span className="font-mono text-base font-bold text-slate-900">
                        ${portfolio.total_portfolio_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">Unrealized Return</span>
                      <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border ${isGain ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {isGain ? '+' : ''}${portfolio.total_unrealized_pnl?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isGain ? '+' : ''}{portfolio.total_unrealized_pnl_percent?.toFixed(2)}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <span>Cash Allocation</span>
                      <span className="font-mono text-slate-700 font-medium">
                        ${portfolio.cash_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Top Holdings preview tags */}
                  {portfolio.top_holdings && portfolio.top_holdings.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                        Holdings Preview ({portfolio.holdings_count})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {portfolio.top_holdings.map((ticker) => (
                          <span
                            key={ticker}
                            className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200"
                          >
                            {ticker}
                          </span>
                        ))}
                        {portfolio.holdings_count > portfolio.top_holdings.length && (
                          <span className="text-xs font-mono px-2 py-0.5 text-slate-400">
                            +{portfolio.holdings_count - portfolio.top_holdings.length} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <div className="mt-6 pt-3">
                  <button
                    onClick={() => onSelectPortfolio(portfolio.id)}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-slate-200 hover:border-blue-600 shadow-xs"
                  >
                    <span>View & Manage Holdings</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Quick Create Card CTA */}
          <div
            onClick={onOpenCreate}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/30 transition-all group min-h-[300px]"
          >
            <div className="p-4 bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 rounded-2xl transition-all">
              <FolderPlus className="w-8 h-8" />
            </div>
            <h4 className="mt-4 text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              Design New Portfolio
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
              Define a new quantitative factor screen, asset allocation, and stock positions
            </p>
            <span className="mt-4 px-3.5 py-1.5 bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs">
              <Plus className="w-3.5 h-3.5" /> Get Started
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
