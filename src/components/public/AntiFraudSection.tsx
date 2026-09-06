import React from 'react';
import {
  ShieldAlert,
  Bot,
  Activity,
  Cpu,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
} from 'lucide-react';

export const AntiFraudSection: React.FC = () => {
  const protectionLayers = [
    {
      step: '01',
      title: 'Hosting & Data Center ASN Quarantine',
      desc: 'Instantly filters non-human traffic coming from AWS, DigitalOcean, OVH, Tor Exit Nodes, and commercial proxy farms before it touches ad auctions.',
      icon: Server,
      badge: 'Real-time IP Blacklist',
    },
    {
      step: '02',
      title: 'Headless Browser & Puppeteer Heuristics',
      desc: 'Deep inspection of WebGL fingerprints, canvas rendering, browser automation flags (navigator.webdriver), and fake User-Agent signatures.',
      icon: Bot,
      badge: 'AI Signature Engine',
    },
    {
      step: '03',
      title: 'Click Velocity & Burst Rate Limiting',
      desc: 'Flags microsecond click intervals, automated rapid click scripts, and unnatural coordinate clusters to prevent click fraud on advertiser budgets.',
      icon: Activity,
      badge: '<150ms Speed Check',
    },
    {
      step: '04',
      title: 'Behavioral Dwell-Time & Human Biometrics',
      desc: 'Analyzes scroll vectors, cursor velocity, and landing page dwell-time to verify genuine human engagement and maintain highest traffic quality.',
      icon: Cpu,
      badge: 'Biometric Scoring',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200 text-slate-800" id="anti-fraud">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            <span>Enterprise Traffic Quality Defense</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Multi-Stage Anti-Fraud Shield
          </h2>
          <p className="text-slate-600 mt-2 text-base">
            We actively filter out bot farms, crawlers, and click-fraud in real-time, ensuring advertisers only pay
            for authentic conversions and publishers maintain pristine domain health.
          </p>
        </div>

        {/* 4-Layer Filtration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {protectionLayers.map((layer) => {
            const Icon = layer.icon;
            return (
              <div
                key={layer.step}
                className="bg-white border border-slate-200 hover:border-blue-300 p-6 rounded-2xl shadow-xs transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                    LAYER {layer.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{layer.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{layer.desc}</p>
                <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{layer.badge}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Traffic Quality Health Gauge banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-600">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900">Network Traffic Quality Score</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                  98.6% VERIFIED CLEAN
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Zero budget wasted on bot farms. 32,410 malicious automated requests blocked today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 text-center flex-1 md:flex-none shadow-2xs">
              <div className="text-xs text-slate-500">Bot False Positives</div>
              <div className="text-base font-mono font-bold text-emerald-600 mt-0.5">&lt; 0.02%</div>
            </div>
            <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 text-center flex-1 md:flex-none shadow-2xs">
              <div className="text-xs text-slate-500">Response Latency</div>
              <div className="text-base font-mono font-bold text-blue-600 mt-0.5">2.8ms</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
