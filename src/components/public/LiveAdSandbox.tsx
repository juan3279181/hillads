import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertOctagon,
  Shield,
  ExternalLink,
  Code,
  Terminal,
  MousePointer,
  BellRing,
  Link2,
  LayoutGrid,
  RefreshCw,
} from 'lucide-react';
import { AdFormatType } from '../../types';

interface LiveAdSandboxProps {
  initialFormat?: AdFormatType;
}

export const LiveAdSandbox: React.FC<LiveAdSandboxProps> = ({ initialFormat = 'direct_link' }) => {
  const [format, setFormat] = useState<AdFormatType>(initialFormat);
  const [isBotSimulated, setIsBotSimulated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseLog, setResponseLog] = useState<{
    status?: number;
    destinationUrl?: string;
    campaignName?: string;
    fraudScore?: number;
    platformEarningsRecorded?: number;
    message?: string;
    timestamp: string;
  } | null>(null);

  const [showInPagePushToast, setShowInPagePushToast] = useState(false);

  const handleTestDirectLink = async () => {
    setLoading(true);
    try {
      // Direct call to our fullstack server endpoint
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (isBotSimulated) {
        headers['User-Agent'] = 'HeadlessChrome/124.0.0.0 (Automated Scraping Bot)';
      }

      const res = await fetch('/api/serve/direct-link/zone_4802?format=json', {
        headers,
      });
      const data = await res.json();
      setResponseLog({
        status: res.status,
        destinationUrl: data.destinationUrl,
        campaignName: data.campaignName,
        fraudScore: data.fraudScore,
        platformEarningsRecorded: data.platformEarningsRecorded,
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setResponseLog({
        status: 500,
        message: 'Request execution error: ' + err.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerPopunder = () => {
    // Open popunder in test mode
    window.open('/api/serve/direct-link/zone_4801', '_blank', 'noopener,noreferrer');
    setResponseLog({
      status: 200,
      campaignName: 'Global Fintech & Trading Apps Tier-1',
      fraudScore: isBotSimulated ? 95 : 12,
      platformEarningsRecorded: 0.0007,
      message: 'Popunder child window successfully spawned in background',
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handleTriggerInPagePush = () => {
    setShowInPagePushToast(true);
    setResponseLog({
      status: 200,
      campaignName: 'CyberSec Antivirus In-Page Push High-CTR',
      fraudScore: 8,
      platformEarningsRecorded: 0.0006,
      message: 'In-Page Push toast mounted in DOM viewport',
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  return (
    <section className="py-16 bg-[#F8FAFC] border-b border-slate-200 text-slate-800" id="sandbox">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Play className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Ad-Serving Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Live Ad Delivery &amp; Anti-Fraud Sandbox
          </h2>
          <p className="text-slate-600 mt-2 text-sm">
            Directly test how our ad router dispatches campaigns, evaluates anti-fraud scores, and logs revenue in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Controls */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>Configure Ad-Serving Test</span>
            </h3>

            {/* Format Picker */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">Choose Ad Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormat('direct_link')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    format === 'direct_link'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Link2 className="w-4 h-4 text-blue-600" />
                  <span>Direct Smartlink</span>
                </button>

                <button
                  onClick={() => setFormat('in_page_push')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    format === 'in_page_push'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BellRing className="w-4 h-4 text-blue-600" />
                  <span>In-Page Push</span>
                </button>

                <button
                  onClick={() => setFormat('popunder')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    format === 'popunder'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MousePointer className="w-4 h-4 text-blue-600" />
                  <span>Popunder Window</span>
                </button>

                <button
                  onClick={() => setFormat('banner')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    format === 'banner'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  <span>Display Banner</span>
                </button>
              </div>
            </div>

            {/* Anti-Fraud Traffic Mode Switch */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  Simulate Inbound Traffic Quality
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isBotSimulated
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isBotSimulated ? 'BOT FARM TRAFFIC' : 'GENUINE RESIDENTIAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Toggle between authentic user interaction vs headless bot scraper to observe how the HilltopAds
                anti-fraud firewall filters suspicious traffic.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setIsBotSimulated(false)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    !isBotSimulated
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Clean Traffic (Score &lt;20)
                </button>
                <button
                  onClick={() => setIsBotSimulated(true)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isBotSimulated
                      ? 'bg-red-600 text-white border-red-600 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Headless Bot (Score 90+)
                </button>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div>
              {format === 'direct_link' && (
                <button
                  onClick={handleTestDirectLink}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                  id="sandbox-btn-directlink"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>Execute Smartlink Request</span>
                </button>
              )}

              {format === 'in_page_push' && (
                <button
                  onClick={handleTriggerInPagePush}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                  id="sandbox-btn-push"
                >
                  <BellRing className="w-4 h-4" />
                  <span>Spawn In-Page Push Toast</span>
                </button>
              )}

              {format === 'popunder' && (
                <button
                  onClick={handleTriggerPopunder}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                  id="sandbox-btn-popunder"
                >
                  <MousePointer className="w-4 h-4" />
                  <span>Trigger Popunder Click Window</span>
                </button>
              )}

              {format === 'banner' && (
                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  Banner preview renders live on the right screen panel &rarr;
                </div>
              )}
            </div>
          </div>

          {/* Right Live Visual Sandbox & Telemetry Terminal */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Visual Stage */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[220px] flex flex-col justify-center items-center relative overflow-hidden shadow-xs">
              <div className="text-xs font-mono text-slate-400 absolute top-4 left-4">
                VISUAL RENDER CANVAS
              </div>

              {format === 'banner' && (
                <div className="w-[300px] h-[250px] bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center shadow-xs relative">
                  <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full mb-2">
                    Verified Ad
                  </span>
                  <div className="text-sm font-bold text-slate-900 mb-1">Apex Capital Media Trading</div>
                  <div className="text-xs text-slate-500 mb-3">
                    Award-winning global mobile trading platform with zero commission.
                  </div>
                  <button
                    onClick={() => window.open('/api/serve/direct-link/zone_4804', '_blank')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    Claim Access &rarr;
                  </button>
                </div>
              )}

              {format === 'in_page_push' && (
                <div className="text-center text-xs text-slate-500">
                  {showInPagePushToast ? (
                    <span className="text-blue-600 font-semibold">
                      In-Page Push toast is currently floating at bottom right of the page!
                    </span>
                  ) : (
                    <span>Click "Spawn In-Page Push Toast" to test floating alert</span>
                  )}
                </div>
              )}

              {format === 'direct_link' && (
                <div className="text-center space-y-2 max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Link2 className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">Smartlink URL Engine</div>
                  <div className="text-xs text-slate-500">
                    Endpoint: <code className="text-blue-700 font-mono bg-blue-50 px-1.5 py-0.5 rounded">/api/serve/direct-link/zone_4802</code>
                  </div>
                </div>
              )}

              {format === 'popunder' && (
                <div className="text-center space-y-2 max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <MousePointer className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">OnClick Popunder Handler</div>
                  <div className="text-xs text-slate-500">
                    Triggers unblockable child window with focus restoration to publisher site.
                  </div>
                </div>
              )}
            </div>

            {/* Live Server Telemetry Terminal */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-slate-400">
                <span className="flex items-center gap-2 text-white font-bold">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Live Server Telemetry &amp; Anti-Fraud Logs
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ENGINE ONLINE
                </span>
              </div>

              {responseLog ? (
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">[{responseLog.timestamp}] HTTP Status:</span>
                    <span
                      className={`font-bold ${
                        responseLog.status === 200 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {responseLog.status} {responseLog.status === 200 ? 'OK' : 'BLOCKED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Anti-Fraud Risk Score:</span>
                    <span
                      className={`font-bold ${
                        (responseLog.fraudScore || 0) > 50 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {responseLog.fraudScore}/100{' '}
                      {(responseLog.fraudScore || 0) > 50 ? '(MALICIOUS BOT DETECTED)' : '(VERIFIED CLEAN)'}
                    </span>
                  </div>

                  {responseLog.campaignName && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Routed Campaign:</span>
                      <span className="text-blue-400 font-bold">{responseLog.campaignName}</span>
                    </div>
                  )}

                  {responseLog.platformEarningsRecorded !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Platform Profit Cut Recorded:</span>
                      <span className="text-emerald-400 font-bold">
                        +${responseLog.platformEarningsRecorded.toFixed(4)} (25% Platform Margin)
                      </span>
                    </div>
                  )}

                  {responseLog.destinationUrl && (
                    <div className="pt-2 border-t border-slate-800 text-slate-400 truncate">
                      <span>Destination Offer: </span>
                      <a
                        href={responseLog.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {responseLog.destinationUrl}
                      </a>
                    </div>
                  )}

                  {responseLog.message && (
                    <div className="text-slate-400 italic">Notice: {responseLog.message}</div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 py-6 text-center">
                  Execute a test above to inspect live HTTP telemetry, bot scoring, and revenue allocation...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating In-Page Push Toast (If active) */}
      {showInPagePushToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white text-slate-800 p-4 rounded-2xl shadow-xl border border-slate-200 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center flex-shrink-0">
            ★
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-900 mb-0.5">HilltopAds Partner Alert</div>
            <div className="text-xs text-slate-600 leading-snug">
              Instant Publisher Monetization: Claim your high-yielding direct link offer today.
            </div>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  window.open('/api/serve/direct-link/zone_4803', '_blank');
                  setShowInPagePushToast(false);
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors"
              >
                View Offer
              </button>
              <button
                onClick={() => setShowInPagePushToast(false)}
                className="text-[11px] text-slate-500 hover:text-slate-800"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowInPagePushToast(false)}
            className="text-slate-400 hover:text-slate-700 text-base leading-none"
          >
            &times;
          </button>
        </div>
      )}
    </section>
  );
};
