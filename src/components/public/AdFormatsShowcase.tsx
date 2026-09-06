import React, { useState } from 'react';
import {
  MousePointerClick,
  Link2,
  BellRing,
  Film,
  LayoutGrid,
  Check,
  Zap,
  Shield,
  Smartphone,
  Monitor,
  ExternalLink,
} from 'lucide-react';
import { ActiveAppView, AdFormatType } from '../../types';

interface AdFormatsShowcaseProps {
  onNavigate: (view: ActiveAppView) => void;
  onSelectSandboxFormat?: (format: AdFormatType) => void;
}

export const AdFormatsShowcase: React.FC<AdFormatsShowcaseProps> = ({
  onNavigate,
  onSelectSandboxFormat,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<AdFormatType>('popunder');

  const formats = [
    {
      id: 'popunder' as AdFormatType,
      name: 'Popunder (OnClick)',
      badge: 'Highest eCPM',
      icon: MousePointerClick,
      color: 'amber',
      tagline: 'High-converting full-page offer opened unobtrusively in a new browser window behind the content.',
      stats: {
        avgEcpm: '$2.40 - $6.80',
        ctr: '100% Viewable',
        recoveryRate: '+42% with Anti-AdBlock',
        bestFor: 'Streaming, Downloads, Gaming, Tools, Content Hubs',
      },
      features: [
        'Frequency capping (e.g. 1 pop per user every 24 hours)',
        'Bypasses pop-up blockers with certified smart click listeners',
        'Compatible with desktop, Android, iOS Safari & Chrome',
        'Clean landing page pre-vetting for maximum user safety',
      ],
      previewContent: {
        title: 'Background Window Triggered',
        desc: 'Opens seamlessly in new window when visitor clicks anywhere on the publisher site, preserving reading experience while driving maximum conversion.',
      },
    },
    {
      id: 'direct_link' as AdFormatType,
      name: 'Direct Link (Smartlink)',
      badge: 'Universal Monetization',
      icon: Link2,
      color: 'emerald',
      tagline: 'Intelligent AI-routed destination URL that automatically delivers the highest-paying campaign for each visitor.',
      stats: {
        avgEcpm: '$3.20 - $8.50',
        ctr: 'Variable by placement',
        recoveryRate: '100% Unblockable',
        bestFor: 'Social media, Telegram channels, Forum buttons, In-app webviews',
      },
      features: [
        'No website required! Perfect for social influencers and media buyers',
        'AI Smartlink dynamic routing analyzes GEO, OS, ISP, and connection speed',
        'Anti-Fraud traffic filter protects your publisher account health',
        'Compatible with shortlinks, button redirects, and download buttons',
      ],
      previewContent: {
        title: 'Smart Direct Link Routing Engine',
        desc: 'Generates an unblockable direct link URL. When your audience clicks, our AI instantly serves the top revenue campaign with real-time revenue allocation.',
      },
    },
    {
      id: 'in_page_push' as AdFormatType,
      name: 'In-Page Push (IPP)',
      badge: 'iOS & Android Friendly',
      icon: BellRing,
      color: 'cyan',
      tagline: 'Floating push notification style banner that appears natively inside the website without user subscription.',
      stats: {
        avgEcpm: '$1.80 - $4.20',
        ctr: '4.5% - 8.2%',
        recoveryRate: '+35% higher CTR than classic banner',
        bestFor: 'News portals, Blogs, Mobile-first portals, Tech publications',
      },
      features: [
        'Works 100% on iOS devices without requiring Web Push permission prompts',
        'Clean native UX that looks identical to mobile OS system alerts',
        'Zero subscription churn: delivers fresh ads every visit',
        'Customizable design skins and dismissible toast animation',
      ],
      previewContent: {
        title: 'Native In-Page Push Alert',
        desc: 'Renders a polished, unobtrusive message toast at bottom-right or top-center of mobile screens with crisp icons and clear call-to-action.',
      },
    },
    {
      id: 'banner' as AdFormatType,
      name: 'Display Banners',
      badge: 'Classic High-Fill',
      icon: LayoutGrid,
      color: 'purple',
      tagline: 'IAB standard responsive display banners (300x250, 728x90, 320x50, 160x600) with real-time RTB bidding.',
      stats: {
        avgEcpm: '$0.80 - $2.40',
        ctr: '0.8% - 2.1%',
        recoveryRate: 'High Fill Rate (100%)',
        bestFor: 'Header banners, Sidebar slots, In-article paragraph breaks',
      },
      features: [
        'Fully responsive HTML5 rich media and clean static creatives',
        'Lightweight asynchronous tag won’t slow down Google Core Web Vitals',
        'Automatic fallback to backup creative to guarantee 100% fill rate',
        'Anti-AdBlock rotating container bypasses standard cosmetic filters',
      ],
      previewContent: {
        title: 'Multi-Size Responsive Banners',
        desc: 'Fits seamlessly into standard layout positions with optimized loading speeds and Google PageSpeed compliance.',
      },
    },
    {
      id: 'video_vast' as AdFormatType,
      name: 'Video VAST / VPAID',
      badge: 'Premium Video CPM',
      icon: Film,
      color: 'blue',
      tagline: 'Pre-roll, mid-roll, and outstream video ads compatible with all standard HTML5 video players (JWPlayer, VideoJS, Flowplayer).',
      stats: {
        avgEcpm: '$5.50 - $14.00',
        ctr: '12.4% Completion',
        recoveryRate: 'IAB VAST 2.0/3.0/4.0 Compliant',
        bestFor: 'Video streaming sites, Tube portals, Gaming video platforms',
      },
      features: [
        'VAST XML endpoint URL with high speed global CDN delivery',
        'Linear pre-roll, mid-roll, post-roll, and non-linear banner overlays',
        'Anti-fraud video completion auditing ensures valid plays',
        'Tier-1 high budget advertisers seeking brand awareness and engagement',
      ],
      previewContent: {
        title: 'Video Ad Serving Protocol',
        desc: 'Injects high-paying video commercials into your player before the media stream begins, maximizing video ad monetization.',
      },
    },
  ];

  const current = formats.find((f) => f.id === selectedFormat) || formats[0];

  return (
    <section className="py-16 bg-[#F8FAFC] border-b border-slate-200 text-slate-800" id="ad-formats">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>High-Performing Ad Formats</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Maximum CTR &amp; Highest Publisher Revenue
          </h2>
          <p className="text-slate-600 mt-2 text-base">
            Choose from a comprehensive suite of high-yielding monetization formats with anti-adblock compatibility.
          </p>
        </div>

        {/* Tab selection buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {formats.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = fmt.id === selectedFormat;
            return (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                <span>{fmt.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {fmt.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Format Detail & Interactive Visual Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs">
          {/* Left specification column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-3">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {current.badge}
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Anti-AdBlock Compatible
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{current.name}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{current.tagline}</p>

            {/* Performance metrics grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <div className="text-xs text-slate-500 font-medium">Average eCPM Range</div>
                <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">{current.stats.avgEcpm}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <div className="text-xs text-slate-500 font-medium">Yield Enhancement</div>
                <div className="text-lg font-mono font-bold text-emerald-600 mt-0.5">{current.stats.recoveryRate}</div>
              </div>
            </div>

            {/* Key capabilities checklist */}
            <ul className="space-y-2 pt-1">
              {current.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => {
                  if (onSelectSandboxFormat) onSelectSandboxFormat(current.id);
                  onNavigate('sandbox');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>Test {current.name} in Sandbox</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('publisher')}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs transition-colors"
              >
                Get Zone Code
              </button>
            </div>
          </div>

          {/* Right visual mockup preview */}
          <div className="lg:col-span-6 bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between min-h-[380px] shadow-xs relative overflow-hidden">
            {/* Browser chrome header mockup */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="px-3 py-1 rounded-lg bg-white text-slate-600 text-[11px] font-mono border border-slate-200 shadow-2xs">
                https://publisher-site.com/zone_view
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Monitor className="w-4 h-4" />
                <Smartphone className="w-4 h-4" />
              </div>
            </div>

            {/* Visual simulation content based on selected format */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              {current.id === 'popunder' && (
                <div className="w-full max-w-sm p-5 rounded-xl bg-white border border-slate-200 shadow-sm text-left">
                  <div className="flex items-center justify-between text-xs text-blue-600 font-bold mb-2">
                    <span>POPUNDER WINDOW INITIATED</span>
                    <span className="text-slate-400 font-normal">1x / 24h</span>
                  </div>
                  <div className="text-slate-900 font-bold text-sm mb-1">High-Converting Advertiser Offer</div>
                  <div className="text-xs text-slate-500 mb-3">
                    Opened behind the active window on initial user click. Zero disruption to publisher session.
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-3/4 rounded-full" />
                  </div>
                </div>
              )}

              {current.id === 'direct_link' && (
                <div className="w-full max-w-sm p-5 rounded-xl bg-white border border-slate-200 shadow-sm text-left space-y-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
                    <Link2 className="w-4 h-4" />
                    <span>SMARTLINK AI ROUTING</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 font-mono text-[11px] text-slate-700 truncate border border-slate-200">
                    https://hilltopads.pro/api/serve/direct-link/4802
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Fraud Filtering: <strong className="text-emerald-700">Passed</strong></span>
                    <span className="text-emerald-700 font-bold">Payout: Top CPM Bidded</span>
                  </div>
                </div>
              )}

              {current.id === 'in_page_push' && (
                <div className="w-full max-w-sm p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-left flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    🔔
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900 mb-0.5">Special Partner Update</div>
                    <div className="text-[11px] text-slate-500 leading-snug">
                      Your requested download is verified and ready. Tap to view trending offers.
                    </div>
                  </div>
                </div>
              )}

              {current.id === 'banner' && (
                <div className="w-[300px] h-[160px] rounded-xl bg-white border-2 border-dashed border-blue-200 flex flex-col items-center justify-center p-3 text-center shadow-2xs">
                  <div className="text-xs font-bold text-blue-700 mb-1">300x250 Medium Rectangle</div>
                  <div className="text-[11px] text-slate-500 mb-2">Asynchronous Anti-AdBlock Script</div>
                  <div className="px-3 py-1 bg-blue-600 text-white font-bold text-[11px] rounded-lg">
                    Sponsored Content
                  </div>
                </div>
              )}

              {current.id === 'video_vast' && (
                <div className="w-full max-w-sm p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-left space-y-2">
                  <div className="flex items-center justify-between text-xs text-blue-700 font-bold">
                    <span>VAST 4.0 XML PRE-ROLL</span>
                    <span className="text-slate-400 font-normal">15s Commercial</span>
                  </div>
                  <div className="h-20 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
                    <Film className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-[11px] text-slate-500">100% video completion telemetry tracked in real-time.</div>
                </div>
              )}
            </div>

            {/* Bottom footnote */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Status: Ready for deployment</span>
              <span className="text-emerald-700 font-semibold font-mono">100% Fill Rate Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
