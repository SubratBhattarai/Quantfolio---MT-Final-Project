import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PortfolioList from './components/PortfolioList';
import PortfolioDetail from './components/PortfolioDetail';
import PortfolioFormModal from './components/PortfolioFormModal';
import ConfirmModal from './components/ConfirmModal';
import { fetchPortfolios, deletePortfolio, resetDemoData } from './api';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#portfolio-')) {
      const id = parseInt(hash.replace('#portfolio-', ''), 10);
      return isNaN(id) ? null : id;
    }
    return null;
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadPortfolios = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPortfolios();
      setPortfolios(data);
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolios();
  }, []);

  // Sync hash with selected portfolio for reload persistence
  useEffect(() => {
    if (selectedPortfolioId) {
      window.location.hash = `#portfolio-${selectedPortfolioId}`;
    } else {
      window.location.hash = '';
    }
  }, [selectedPortfolioId]);

  const handleSelectPortfolio = (id) => {
    setSelectedPortfolioId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedPortfolioId(null);
    loadPortfolios();
  };

  const handlePortfolioCreated = (newPortfolio) => {
    showToast(`Portfolio "${newPortfolio.name}" created successfully!`);
    loadPortfolios();
    setSelectedPortfolioId(newPortfolio.id);
  };

  const handleDeletePortfolioRequest = (portfolio) => {
    setPortfolioToDelete(portfolio);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeletePortfolio = async () => {
    if (!portfolioToDelete) return;
    try {
      await deletePortfolio(portfolioToDelete.id);
      setIsDeleteModalOpen(false);
      showToast(`Portfolio "${portfolioToDelete.name}" deleted.`);
      if (selectedPortfolioId === portfolioToDelete.id) {
        setSelectedPortfolioId(null);
      }
      setPortfolioToDelete(null);
      loadPortfolios();
    } catch (err) {
      alert(`Error deleting portfolio: ${err.message}`);
    }
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset all portfolios and holdings to sample quantitative models?')) {
      try {
        await resetDemoData();
        showToast('Sample quant portfolios restored.');
        loadPortfolios();
        setSelectedPortfolioId(null);
      } catch (err) {
        alert('Failed to reset demo data');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onResetDemo={handleResetDemo}
        onHomeClick={() => setSelectedPortfolioId(null)}
        activeView={selectedPortfolioId ? 'detail' : 'list'}
      />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedPortfolioId ? (
          <PortfolioDetail
            portfolioId={selectedPortfolioId}
            onBack={handleBackToList}
            onPortfolioUpdated={loadPortfolios}
          />
        ) : (
          <PortfolioList
            portfolios={portfolios}
            onSelectPortfolio={handleSelectPortfolio}
            onOpenCreate={() => setIsCreateModalOpen(true)}
            onDeletePortfolio={handleDeletePortfolioRequest}
            onRefresh={loadPortfolios}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Clean White Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-900 font-bold">QUANTFOLIO</span>
            <span>—</span>
            <span>Quantitative Portfolio Analytics Platform for Finance Students</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            React &bull; Tailwind CSS &bull; FastAPI
          </div>
        </div>
      </footer>

      {/* Portfolio Creation Form Modal */}
      <PortfolioFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handlePortfolioCreated}
      />

      {/* Portfolio Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Portfolio Model"
        message="Are you sure you want to permanently delete this portfolio and all its underlying positions? This action cannot be undone."
        itemName={portfolioToDelete ? `${portfolioToDelete.name} (${portfolioToDelete.holdings_count} positions)` : ''}
        confirmText="Confirm Delete"
        isDanger={true}
        onConfirm={handleConfirmDeletePortfolio}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setPortfolioToDelete(null);
        }}
      />
    </div>
  );
}
