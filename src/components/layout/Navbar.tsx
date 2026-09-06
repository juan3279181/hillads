import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Globe,
  TrendingUp,
  Code2,
  Lock,
  ChevronDown,
  Menu,
  X,
  Play,
  CheckCircle2,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { ActiveAppView } from '../../types';

interface NavbarProps {
  activeView: ActiveAppView;
  onNavigate: (view: ActiveAppView) => void;
  isAdminAuthenticated: boolean;
  onOpenMfaModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  isAdminAuthenticated,
  onOpenMfaModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ratesDropdown, setRatesDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800">
      {/* Top micro announcement bar */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-1.5 text-xs text-slate-600 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-900">HilltopAds Engine v3.4:</span>
            <span>Next-Gen Anti-AdBlock with +38% Publisher Yield Recovery &amp; Real-time AI Bot Firewall</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-500">
            <span className="text-emerald-700 font-medium">Fill Rate: 100%</span>
            <span>•</span>
            <span className="text-blue-700 font-medium">Tier-1 CPM: up to $4.90</span>
            <span>•</span>
            <span className="text-slate-700 font-medium">Anti-Fraud: 98.6% Clean</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="nav-brand-logo"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <div className="w-3.5 h-3.5 bg-white rounded-xs" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline tracking-tight">
                <span className="text-xl font-bold text-slate-900">HILLTOP</span>
                <span className="text-xl font-bold text-blue-600">ADS</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase -mt-1">
                Smart Ad Network
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'landing'
                  ? 'text-blue-700 bg-blue-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('advertiser')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'advertiser'
                  ? 'text-blue-700 bg-blue-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              Advertisers
            </button>

            <button
              onClick={() => onNavigate('publisher')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'publisher'
                  ? 'text-emerald-700 bg-emerald-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Publishers
            </button>

            <button
              onClick={() => onNavigate('sandbox')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'sandbox'
                  ? 'text-blue-700 bg-blue-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-blue-600" />
              Ad Sandbox
            </button>

            <button
              onClick={() => onNavigate('api_docs')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'api_docs'
                  ? 'text-blue-700 bg-blue-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              API &amp; RTB
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Link to Admin Console */}
            <button
              onClick={isAdminAuthenticated ? () => onNavigate('admin') : onOpenMfaModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeView === 'admin'
                  ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
              title="Admin Access with Multi-Factor Authentication"
              id="btn-nav-admin"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Console</span>
              {isAdminAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            {/* Quick Switch to Dashboards */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onNavigate('advertiser')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'advertiser'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Advertiser Hub
              </button>
              <button
                onClick={() => onNavigate('publisher')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'publisher'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Publisher Hub
              </button>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => onNavigate('sandbox')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200"
            >
              Sandbox
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              id="btn-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => {
                onNavigate('advertiser');
                setMobileMenuOpen(false);
              }}
              className="py-2.5 px-3 bg-blue-600 text-white font-bold text-xs rounded-lg text-center shadow-xs"
            >
              Advertiser Dashboard
            </button>
            <button
              onClick={() => {
                onNavigate('publisher');
                setMobileMenuOpen(false);
              }}
              className="py-2.5 px-3 bg-emerald-600 text-white font-bold text-xs rounded-lg text-center shadow-xs"
            >
              Publisher Dashboard
            </button>
          </div>
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
          >
            Home / Ad Network Overview
          </button>
          <button
            onClick={() => {
              onNavigate('sandbox');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium"
          >
            <span>Live Ad Format Sandbox</span>
            <Play className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => {
              onNavigate('api_docs');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
          >
            API &amp; Integration Docs
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (isAdminAuthenticated) {
                onNavigate('admin');
              } else {
                onOpenMfaModal();
              }
            }}
            className="w-full text-left px-3 py-2 text-sm text-slate-800 hover:bg-slate-50 rounded-lg flex items-center gap-2 border border-slate-200 font-medium"
          >
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Admin Control &amp; Platform Security (MFA)</span>
          </button>
        </div>
      )}
    </header>
  );
};
