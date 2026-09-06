import React from 'react';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Zap,
  Globe2,
  Users,
  Play,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ActiveAppView, PlatformOverviewStats } from '../../types';

interface HeroProps {
  onNavigate: (view: ActiveAppView) => void;
  stats?: PlatformOverviewStats;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, stats }) => {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-12 pb-16 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>High-Performing Global Ad Network Since 2013</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-slate-600 font-normal">Popunder, Direct Link, Push &amp; VAST</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Smart Advertising Network for{' '}
            <span className="text-blue-600">
              Advertisers
            </span>{' '}
            and{' '}
            <span className="text-emerald-600">
              Publishers
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Monetize high-volume website traffic with superior CPM rates or scale targeted acquisition campaigns
            with our multi-stage anti-fraud shield, RTB bidding, and proprietary Anti-AdBlock bypass technology.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            <button
              onClick={() => onNavigate('advertiser')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors"
              id="hero-btn-advertiser"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Launch Campaign (Advertiser)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('publisher')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs flex items-center justify-center gap-2 transition-colors"
              id="hero-btn-publisher"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Monetize Traffic (Publisher)</span>
            </button>

            <button
              onClick={() => onNavigate('sandbox')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-colors"
              id="hero-btn-sandbox"
            >
              <Play className="w-3.5 h-3.5 text-blue-600" />
              <span>Test Live Ad Sandbox</span>
            </button>
          </div>

          {/* Live Platform Proof Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-200">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
                73B+
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Monthly Impressions</div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 font-mono tracking-tight">
                240+
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Worldwide Target GEOs</div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 font-mono tracking-tight">
                100%
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Traffic Fill Rate</div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
                98.6%
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Verified Clean Traffic</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
