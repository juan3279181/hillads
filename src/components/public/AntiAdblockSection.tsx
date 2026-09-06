import React from 'react';
import { ShieldCheck, TrendingUp, Sparkles, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { ActiveAppView } from '../../types';

interface AntiAdblockSectionProps {
  onNavigate: (view: ActiveAppView) => void;
}

export const AntiAdblockSection: React.FC<AntiAdblockSectionProps> = ({ onNavigate }) => {
  return (
    <section className="py-16 bg-[#F8FAFC] border-b border-slate-200 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Proprietary Anti-AdBlock Technology</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Recover Up to <span className="text-blue-600 font-mono">+42%</span> of Lost Ad Revenue
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              Over 38% of global internet visitors now browse with active ad blockers. HilltopAds proprietary
              Anti-AdBlock algorithms dynamically rotate CDN domains, synthesize obfuscated inline DOM wrappers, and
              render offers without triggering browser filter lists.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Zero User Inconvenience</div>
                  <div className="text-xs text-slate-500">
                    No annoying "Please disable your adblocker" modals that cause high bounce rates.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Dynamic Rotating Mirror Endpoints</div>
                  <div className="text-xs text-slate-500">
                    Constantly updated proxy endpoints prevent domain-based blacklisting on EasyList.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">One-Click Toggle in Publisher Dashboard</div>
                  <div className="text-xs text-slate-500">
                    Enabled by default for all Popunders, Direct Links, and In-Page Push zones.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => onNavigate('publisher')}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>Activate Anti-AdBlock for Your Site</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right comparison card */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative">
            <div className="text-sm font-bold text-slate-900 mb-6 flex items-center justify-between">
              <span>Traffic Monetization Comparison (100k Visitors)</span>
              <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Live Simulation</span>
            </div>

            <div className="space-y-5">
              {/* Standard Network without anti-adblock */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                  <span className="font-semibold text-slate-700">Standard Ad Network (No Anti-AdBlock)</span>
                  <span className="text-red-600 font-mono font-bold">-38% Blocked</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-3">
                  <div className="bg-slate-400 h-full w-[62%] rounded-full" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">62,000 Monetized Impressions</span>
                  <span className="text-slate-800 font-mono font-bold">$148.80 Total</span>
                </div>
              </div>

              {/* HilltopAds with Anti-Adblock */}
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between text-xs text-blue-700 mb-2">
                  <span className="font-bold flex items-center gap-1.5 text-slate-900">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    HilltopAds with Anti-AdBlock Technology
                  </span>
                  <span className="text-emerald-700 font-mono font-bold">100% Monetized</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-3">
                  <div className="bg-blue-600 h-full w-[100%] rounded-full" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">100,000 Monetized Impressions (+38,000 extra)</span>
                  <span className="text-blue-700 font-mono font-extrabold text-base">$240.00 Total (+61%)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-500">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span>
                Domain routing is verified clean across all major security vendor tests and updated in real-time.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
