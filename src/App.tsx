import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/public/Hero';
import { AdFormatsShowcase } from './components/public/AdFormatsShowcase';
import { RatesCoverageTable } from './components/public/RatesCoverageTable';
import { AntiFraudSection } from './components/public/AntiFraudSection';
import { AntiAdblockSection } from './components/public/AntiAdblockSection';
import { LiveAdSandbox } from './components/public/LiveAdSandbox';
import { AdvertiserDashboard } from './components/advertiser/AdvertiserDashboard';
import { PublisherDashboard } from './components/publisher/PublisherDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MfaLoginModal } from './components/admin/MfaLoginModal';
import { ApiDocumentation } from './components/public/ApiDocumentation';
import { ActiveAppView, AdFormatType } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveAppView>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as ActiveAppView;
      const validViews: ActiveAppView[] = ['landing', 'advertiser', 'publisher', 'admin', 'sandbox', 'api_docs'];
      if (validViews.includes(hash)) {
        return hash;
      }
      try {
        const saved = localStorage.getItem('hilltop_active_view') as ActiveAppView;
        if (validViews.includes(saved)) {
          return saved;
        }
      } catch (e) {}
    }
    return 'landing';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);
  const [sandboxFormat, setSandboxFormat] = useState<AdFormatType>('direct_link');

  // Sync hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as ActiveAppView;
      const validViews: ActiveAppView[] = ['landing', 'advertiser', 'publisher', 'admin', 'sandbox', 'api_docs'];
      if (validViews.includes(hash)) {
        setActiveView(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Smooth scroll to top upon view change & save state
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      localStorage.setItem('hilltop_active_view', activeView);
      if (window.location.hash.replace('#', '') !== activeView) {
        window.location.hash = activeView;
      }
    } catch (e) {}
  }, [activeView]);

  const handleNavigate = (view: ActiveAppView) => {
    if (view === 'admin' && !isAdminAuthenticated) {
      setIsMfaModalOpen(true);
      return;
    }
    setActiveView(view);
  };

  const handleMfaAuthenticated = () => {
    setIsAdminAuthenticated(true);
    setActiveView('admin');
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setActiveView('landing');
  };

  const handleSelectSandboxFormat = (fmt: AdFormatType) => {
    setSandboxFormat(fmt);
    setActiveView('sandbox');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Global Navigation Header */}
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenMfaModal={() => setIsMfaModalOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <>
            <Hero onNavigate={handleNavigate} />
            <AdFormatsShowcase
              onNavigate={handleNavigate}
              onSelectSandboxFormat={handleSelectSandboxFormat}
            />
            <RatesCoverageTable />
            <LiveAdSandbox initialFormat={sandboxFormat} />
            <AntiFraudSection />
            <AntiAdblockSection onNavigate={handleNavigate} />
          </>
        )}

        {activeView === 'advertiser' && (
          <AdvertiserDashboard onNavigate={handleNavigate} />
        )}

        {activeView === 'publisher' && (
          <PublisherDashboard onNavigate={handleNavigate} />
        )}

        {activeView === 'admin' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            onLogoutAdmin={handleLogoutAdmin}
          />
        )}

        {activeView === 'sandbox' && (
          <div className="pt-4">
            <LiveAdSandbox initialFormat={sandboxFormat} />
          </div>
        )}

        {activeView === 'api_docs' && <ApiDocumentation />}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenMfaModal={() => setIsMfaModalOpen(true)}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* Multi-Factor Verification Challenge Modal */}
      <MfaLoginModal
        isOpen={isMfaModalOpen}
        onClose={() => setIsMfaModalOpen(false)}
        onAuthenticated={handleMfaAuthenticated}
      />
    </div>
  );
}
