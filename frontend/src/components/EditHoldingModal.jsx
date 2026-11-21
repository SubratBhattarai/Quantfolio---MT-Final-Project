import React, { useState, useEffect } from 'react';
import { X, Check, Edit3, AlertCircle } from 'lucide-react';

export default function EditHoldingModal({ isOpen, holding, onClose, onSave }) {
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (holding) {
      setQuantity(holding.quantity.toString());
      setBuyPrice(holding.buy_price.toString());
      setCurrentPrice(holding.current_price.toString());
      setNotes(holding.notes || '');
      setError('');
    }
  }, [holding]);

  if (!isOpen || !holding) return null;

  const numQty = parseFloat(quantity) || 0;
  const numCurrentPrice = parseFloat(currentPrice) || 0;
  const numBuyPrice = parseFloat(buyPrice) || 0;
  const newMarketValue = numQty * numCurrentPrice;
  const newCostBasis = numQty * numBuyPrice;
  const newPnl = newMarketValue - newCostBasis;
  const newPnlPct = newCostBasis > 0 ? (newPnl / newCostBasis) * 100 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numQty <= 0) {
      setError('Holding quantity must be a positive number greater than 0.');
      return;
    }
    if (numBuyPrice < 0) {
      setError('Purchase price cannot be negative.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave(holding.id, {
        quantity: numQty,
        buy_price: numBuyPrice,
        current_price: numCurrentPrice,
        notes: notes.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update holding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-7 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-slate-900 tracking-wider">{holding.ticker}</span>
              <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full font-medium border border-slate-200">
                {holding.asset_class || 'Equities'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{holding.name || 'Holding Details'}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Holding Quantity (Shares) <span className="text-blue-600">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                min="0.0001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-slate-900 font-mono text-base transition-colors"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, numQty - 1).toString())}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-medium"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity((numQty + 1).toString())}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-medium"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity((numQty + 10).toString())}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-medium"
                >
                  +10
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Avg Purchase Cost ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Available Price ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-sm transition-colors"
              />
            </div>
          </div>

          {/* Recalculated metrics preview */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-mono">
            <div>
              <div className="text-slate-500 font-sans">Projected Market Value</div>
              <div className="text-slate-900 text-base font-bold mt-0.5">
                ${newMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 font-sans">Projected Unrealized Return</div>
              <div className={`text-base font-bold mt-0.5 ${newPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {newPnl >= 0 ? '+' : ''}${newPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({newPnlPct >= 0 ? '+' : ''}{newPnlPct.toFixed(2)}%)
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Investment Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-slate-900 text-sm transition-colors"
              placeholder="e.g. Factor rebalance, updated position size"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Quantity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
