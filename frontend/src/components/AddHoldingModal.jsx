import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { lookupQuote } from '../api';

const POPULAR_TICKERS = ['NVDA', 'AAPL', 'MSFT', 'SPY', 'QQQ', 'AMZN', 'GOOGL', 'TSLA', 'PLTR', 'TLT'];

export default function AddHoldingModal({ isOpen, onClose, onAdd, existingHoldings = [] }) {
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [availablePrice, setAvailablePrice] = useState(null);
  const [assetName, setAssetName] = useState('');
  const [assetClass, setAssetClass] = useState('Equities');
  const [buyPrice, setBuyPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTicker('');
      setQuantity('');
      setAvailablePrice(null);
      setAssetName('');
      setAssetClass('Equities');
      setBuyPrice('');
      setNotes('');
      setErrorMessage('');
      setShowAdvanced(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-lookup available price whenever ticker changes
  const handleTickerLookup = async (sym) => {
    const cleanSym = (sym || ticker).trim().toUpperCase();
    if (!cleanSym) {
      setAvailablePrice(null);
      setAssetName('');
      return;
    }

    // Check duplicate locally for immediate feedback
    const isDuplicate = existingHoldings.some(
      h => h.ticker.toUpperCase() === cleanSym
    );
    if (isDuplicate) {
      setErrorMessage(`Holding '${cleanSym}' already exists in this portfolio. You can update its quantity directly in the table.`);
    } else {
      setErrorMessage('');
    }

    try {
      setIsLoadingPrice(true);
      const data = await lookupQuote(cleanSym);
      if (data && data.price) {
        setAvailablePrice(data.price);
        setAssetName(data.name || `${cleanSym} Holding`);
        setAssetClass(data.asset_class || 'Equities');
        if (!buyPrice) {
          setBuyPrice(data.price.toString());
        }
      }
    } catch {
      // User can still submit manual price if desired
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleSelectTicker = (sym) => {
    setTicker(sym);
    handleTickerLookup(sym);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanTicker = ticker.trim().toUpperCase();

    // 1. Validate ticker
    if (!cleanTicker) {
      setErrorMessage('Please enter a stock ticker symbol (e.g. AAPL, NVDA, SPY).');
      return;
    }

    if (!/^[A-Z0-9.\-]{1,10}$/.test(cleanTicker)) {
      setErrorMessage(`Invalid ticker symbol '${cleanTicker}'. Symbols must contain 1-10 alphanumeric characters.`);
      return;
    }

    // 2. Validate quantity
    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setErrorMessage('Holding quantity must be a positive number greater than 0.');
      return;
    }

    // 3. Check for duplicates in the current portfolio
    const isDuplicate = existingHoldings.some(
      h => h.ticker.toUpperCase() === cleanTicker
    );
    if (isDuplicate) {
      setErrorMessage(`Holding '${cleanTicker}' already exists in this portfolio. You can update its quantity in the holdings table.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const resolvedPrice = availablePrice || 100.0;
      const numBuyPrice = parseFloat(buyPrice) > 0 ? parseFloat(buyPrice) : resolvedPrice;

      await onAdd({
        ticker: cleanTicker,
        quantity: numQty,
        current_price: resolvedPrice,
        buy_price: numBuyPrice,
        name: assetName || `${cleanTicker} Holding`,
        asset_class: assetClass || 'Equities',
        notes: notes.trim()
      });

      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add stock. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const numQty = parseFloat(quantity) || 0;
  const currentAvailablePrice = availablePrice || 0;
  const estimatedValue = numQty * currentAvailablePrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-7 text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Add Stock to Portfolio</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the stock ticker and quantity to add a position to this portfolio model.
            </p>
          </div>
        </div>

        {/* Error / Validation Alert Banner */}
        {errorMessage && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm font-medium leading-relaxed">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Quick Ticker Chips for Students */}
        <div className="mb-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Popular Student Tickers:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TICKERS.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => handleSelectTicker(sym)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                  ticker === sym
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ticker Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Stock Ticker <span className="text-blue-600">*</span>
              </label>
              <input
                type="text"
                required
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value.toUpperCase());
                  setErrorMessage('');
                }}
                onBlur={() => handleTickerLookup(ticker)}
                placeholder="e.g. AAPL"
                className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-sm uppercase transition-colors"
                autoFocus
              />
            </div>

            {/* Quantity Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Quantity (Shares) <span className="text-blue-600">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.0001"
                required
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="e.g. 25"
                className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-sm transition-colors"
              />
            </div>
          </div>

          {/* Available Price & Estimated Value Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Available Price:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {isLoadingPrice ? (
                  <span className="text-slate-400">Fetching quote...</span>
                ) : availablePrice !== null ? (
                  `$${availablePrice.toFixed(2)}`
                ) : (
                  <span className="text-slate-400 font-normal">Enter ticker to view</span>
                )}
              </span>
            </div>

            {assetName && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Company Name:</span>
                <span className="text-slate-700 font-medium truncate max-w-[220px]">
                  {assetName}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">Total Market Value:</span>
              <span className="font-mono text-base font-extrabold text-blue-600">
                ${estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Advanced Customizations (Optional) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <span>{showAdvanced ? 'Hide advanced fields' : 'Customize cost basis & notes (optional)'}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 pt-3 border-t border-slate-200 animate-in fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Avg Purchase Price ($)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      placeholder={availablePrice ? availablePrice.toString() : '100.00'}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-1.5 text-slate-900 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Asset Category
                    </label>
                    <select
                      value={assetClass}
                      onChange={(e) => setAssetClass(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs"
                    >
                      <option value="Equities">Equities</option>
                      <option value="ETFs">ETFs</option>
                      <option value="Fixed Income">Fixed Income</option>
                      <option value="Commodities">Commodities</option>
                      <option value="Crypto">Crypto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Quant Rationale / Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Factor rebalance, momentum screen"
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-1.5 text-slate-900 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center gap-1.5 font-semibold"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Saving Position...' : 'Add Stock Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
