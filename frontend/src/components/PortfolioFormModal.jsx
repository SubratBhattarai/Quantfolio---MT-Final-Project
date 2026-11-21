import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { createPortfolio } from '../api';

const BENCHMARKS = [
  { code: 'SPY', name: 'S&P 500 ETF (Market Beta)' },
  { code: 'QQQ', name: 'Nasdaq 100 ETF (Tech & Growth)' },
  { code: 'IWM', name: 'Russell 2000 ETF (Small-Cap)' },
  { code: 'ACWI', name: 'MSCI ACWI ETF (Global Equities)' },
  { code: 'AGG', name: 'US Aggregate Bond ETF (Fixed Income)' }
];

export default function PortfolioFormModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [benchmark, setBenchmark] = useState('SPY');
  const [cashBalance, setCashBalance] = useState('10000');
  const [initialHoldings, setInitialHoldings] = useState([
    { ticker: 'NVDA', asset_class: 'Equities', quantity: '20', buy_price: '135.00' },
    { ticker: 'MSFT', asset_class: 'Equities', quantity: '15', buy_price: '420.00' }
  ]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddHoldingRow = () => {
    setInitialHoldings([
      ...initialHoldings,
      { ticker: '', asset_class: 'Equities', quantity: '10', buy_price: '100.00' }
    ]);
  };

  const handleRemoveHoldingRow = (index) => {
    setInitialHoldings(initialHoldings.filter((_, i) => i !== index));
  };

  const handleHoldingChange = (index, field, value) => {
    const updated = [...initialHoldings];
    updated[index][field] = field === 'ticker' ? value.toUpperCase() : value;
    setInitialHoldings(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a portfolio name.');
      return;
    }

    const cleanCash = parseFloat(cashBalance);
    if (isNaN(cleanCash) || cleanCash < 0) {
      setError('Cash balance must be zero or a positive amount.');
      return;
    }

    // Filter valid holdings and check duplicate in initial list
    const validHoldings = [];
    const seen = new Set();
    for (const h of initialHoldings) {
      const t = h.ticker.trim().toUpperCase();
      if (t) {
        if (seen.has(t)) {
          setError(`Duplicate ticker '${t}' in initial holdings list.`);
          return;
        }
        seen.add(t);

        const q = parseFloat(h.quantity);
        const bp = parseFloat(h.buy_price);
        if (isNaN(q) || q <= 0) {
          setError(`Invalid quantity for ticker ${t}. Must be greater than 0.`);
          return;
        }
        if (isNaN(bp) || bp < 0) {
          setError(`Invalid purchase price for ticker ${t}.`);
          return;
        }
        validHoldings.push({
          ticker: t,
          asset_class: h.asset_class || 'Equities',
          quantity: q,
          buy_price: bp,
          current_price: bp
        });
      }
    }

    try {
      setIsSubmitting(true);
      setError('');
      const payload = {
        name: name.trim(),
        description: description.trim(),
        benchmark,
        cash_balance: cleanCash,
        initial_holdings: validHoldings
      };

      const newPortfolio = await createPortfolio(payload);
      onCreated(newPortfolio);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create portfolio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Quantitative Portfolio</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your strategy thesis, benchmark index, initial cash balance, and starter positions.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Portfolio Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Portfolio / Fund Name <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm transition-colors"
              placeholder="e.g. Systematic Factor Alpha Fund"
            />
          </div>

          {/* Strategy Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Strategy Thesis / Quantitative Objective
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm resize-none transition-colors"
              placeholder="e.g. Long-only momentum and quality factor model targeting top decile returns with risk parity weighting."
            />
          </div>

          {/* Benchmark & Cash */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Benchmark Comparison Index
              </label>
              <select
                value={benchmark}
                onChange={(e) => setBenchmark(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm transition-colors"
              >
                {BENCHMARKS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} — {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Initial Cash Allocation ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={cashBalance}
                onChange={(e) => setCashBalance(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-4 py-2.5 text-slate-900 font-mono text-sm transition-colors"
                placeholder="10000"
              />
            </div>
          </div>

          {/* Initial Holdings Builder */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                  Initial Stock Holdings (Optional)
                </label>
                <p className="text-xs text-slate-500">
                  Pre-populate starter positions or add them anytime in the dashboard
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddHoldingRow}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            {initialHoldings.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                No initial holdings added. You can add holdings anytime after creation.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {initialHoldings.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      value={h.ticker}
                      onChange={(e) => handleHoldingChange(idx, 'ticker', e.target.value)}
                      placeholder="Ticker"
                      className="w-24 bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-xs uppercase"
                    />
                    <select
                      value={h.asset_class}
                      onChange={(e) => handleHoldingChange(idx, 'asset_class', e.target.value)}
                      className="w-28 bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-2 py-1.5 text-slate-900 text-xs"
                    >
                      <option value="Equities">Equities</option>
                      <option value="ETFs">ETFs</option>
                      <option value="Fixed Income">Bonds</option>
                      <option value="Crypto">Crypto</option>
                    </select>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={h.quantity}
                      onChange={(e) => handleHoldingChange(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-20 bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-xs"
                    />
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={h.buy_price}
                        onChange={(e) => handleHoldingChange(idx, 'buy_price', e.target.value)}
                        placeholder="Cost"
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-lg pl-6 pr-2.5 py-1.5 text-slate-900 font-mono text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveHoldingRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Creating Portfolio...' : 'Create Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
