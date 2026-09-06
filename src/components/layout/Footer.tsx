import React from 'react';
import { Shield, CheckCircle2, Lock, ArrowUpRight, HelpCircle } from 'lucide-react';
import { ActiveAppView } from '../../types';

interface FooterProps {
  onNavigate: (view: ActiveAppView) => void;
  onOpenMfaModal: () => void;
  isAdminAuthenticated: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenMfaModal,
  isAdminAuthenticated,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-sm">
      {/* Top Banner: Payment Methods & Guarantees */}
      <div className="border-b border-slate-200 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-slate-900 font-bold text-base mb-1">Fast &amp; Reliable Global Settlements</div>
            <div className="text-xs text-slate-500">
              Weekly automatic disbursements, 0% payout commission, and guaranteed on-time transactions.
            </div>
          </div>
          {/* Payment Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              PayPal Commercial
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Tether USDT (TRC20/ERC20)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
              Paxum
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
              Wire Transfer / SEPA
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
              WebMoney
            </span>
          </div>
        </div>
      </div>

      {/* Main Link Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-xs">
                <div className="w-3.5 h-3.5 bg-white rounded-xs" />
              </div>
              <div className="tracking-tight text-lg font-bold text-slate-900">
                HILLTOP<span className="text-blue-600">ADS</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4 max-w-sm">
              HilltopAds is an international advertising network operating since 2013, delivering smart traffic
              monetization solutions for publishers and high-converting performance audiences for advertisers worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Multi-Stage Anti-Fraud Shield Active</span>
            </div>
          </div>

          {/* Advertisers */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-4">Advertisers</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('advertiser')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Create Campaign
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('advertiser')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  RTB &amp; Micro-Bidding
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('advertiser')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Smart CPA Auto-Optimizer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('sandbox')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Traffic Estimator
                </button>
              </li>
            </ul>
          </div>

          {/* Publishers */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-4">Publishers</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('publisher')} className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Monetize Website
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('publisher')} className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Anti-AdBlock Solution
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('publisher')} className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Smart Direct Links
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('publisher')} className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Instant Payout Requests
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Governance */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('api_docs')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  REST API &amp; Webhooks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('sandbox')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Interactive Ad Sandbox
                </button>
              </li>
              <li>
                <a href="#anti-fraud" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Traffic Quality Policy
                </a>
              </li>
              <li className="pt-2">
                <button
                  onClick={isAdminAuthenticated ? () => onNavigate('admin') : onOpenMfaModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-[11px]"
                  id="btn-footer-admin-lock"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin Security Portal</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            &copy; {new Date().getFullYear()} HilltopAds Global Network. All rights reserved. Registered Enterprise AdTech Platform.
          </div>
          <div className="flex items-center gap-6">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>DMCA Compliance</span>
            <span>GDPR &amp; CCPA Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
