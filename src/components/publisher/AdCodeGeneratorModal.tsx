import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, Code, Link2, Eye, EyeOff } from 'lucide-react';
import { PublisherZone } from '../../types';

interface AdCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: PublisherZone | null;
}

export const AdCodeGeneratorModal: React.FC<AdCodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  zone,
}) => {
  const [copied, setCopied] = useState(false);
  const [bannerMode, setBannerMode] = useState<'script' | 'iframe'>('script');
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen || !zone) return null;

  const currentOrigin = window.location.origin;
  const directLinkUrl = `${currentOrigin}/api/serve/direct-link/${zone.id}`;
  const bannerFrameUrl = `${currentOrigin}/api/serve/banner-frame/${zone.id}`;

  const width = zone.bannerSize ? zone.bannerSize.split('x')[0] : '300';
  const height = zone.bannerSize ? zone.bannerSize.split('x')[1] : '250';

  const scriptTag = zone.format === 'banner'
    ? `<!-- HilltopAds Banner Zone: ${zone.zoneName} (${zone.id}) -->
<div id="hilltop-zone-${zone.id}"></div>
<script async src="${currentOrigin}/api/serve/ad-tag/${zone.id}.js" data-zone="${zone.id}"></script>`
    : `<!-- HilltopAds Anti-AdBlock Tag: ${zone.zoneName} (${zone.id}) -->
<script async src="${currentOrigin}/api/serve/ad-tag/${zone.id}.js" data-zone="${zone.id}"></script>`;

  const iframeTag = `<!-- HilltopAds Direct iFrame Banner: ${zone.zoneName} (${zone.bannerSize || '300x250'}) -->
<iframe src="${bannerFrameUrl}" width="${width}" height="${height}" frameborder="0" scrolling="no" style="border:none;overflow:hidden;display:block;"></iframe>`;

  let activeSnippet = directLinkUrl;
  if (zone.format === 'banner') {
    activeSnippet = bannerMode === 'iframe' ? iframeTag : scriptTag;
  } else if (zone.format !== 'direct_link') {
    activeSnippet = scriptTag;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 text-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Integration Tag &amp; Smartlink</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                {zone.format.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{zone.zoneName} ({zone.id})</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Format selection if Banner */}
          {zone.format === 'banner' && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setBannerMode('script')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  bannerMode === 'script'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Async JavaScript Tag (Recommended)
              </button>
              <button
                onClick={() => setBannerMode('iframe')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  bannerMode === 'iframe'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Direct iFrame HTML (Universal)
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
              {zone.format === 'direct_link' ? (
                <Link2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Code className="w-4 h-4 text-blue-600" />
              )}
              {zone.format === 'direct_link'
                ? 'Direct Smartlink URL'
                : bannerMode === 'iframe' && zone.format === 'banner'
                ? 'Universal iFrame Embed Code'
                : 'Asynchronous JavaScript Code'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Anti-AdBlock Active
              </span>
            </div>
          </div>

          {/* Snippet Code Box */}
          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {activeSnippet}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Instructions Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800">Integration Guidelines:</div>
            {zone.format === 'direct_link' ? (
              <p>
                Place this direct link anywhere: inside anchor links (<code>&lt;a href="..."&gt;</code>), action buttons, social media bios, or redirects. Each verified visitor instantly credits your account balance.
              </p>
            ) : zone.format === 'banner' ? (
              <p>
                Paste this code where you want the banner displayed ({zone.bannerSize || '300x250'}). It renders seamlessly, bypasses ad-blockers, and tracks impressions and clicks in real time.
              </p>
            ) : (
              <p>
                Paste this script code into the <code>&lt;head&gt;</code> or <code>&lt;body&gt;</code> of your website HTML. It runs non-blocking asynchronously without impacting page performance.
              </p>
            )}
          </div>

          {/* Live Preview Toggle */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                {showPreview ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                <span>{showPreview ? 'Hide Live Ad Sandbox Preview' : 'Preview Live Ad Output'}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">Click to toggle</span>
            </button>

            {showPreview && (
              <div className="p-4 bg-slate-900 border-t border-slate-200 flex flex-col items-center justify-center min-h-[160px]">
                {zone.format === 'banner' ? (
                  <iframe
                    src={bannerFrameUrl}
                    width={width}
                    height={height}
                    style={{ border: 'none', borderRadius: '8px', maxWidth: '100%' }}
                    title="Live Banner Preview"
                  />
                ) : (
                  <div className="text-center p-4">
                    <p className="text-xs text-slate-300 mb-3">
                      This zone format ({zone.format.replace('_', ' ')}) triggers dynamically on page click or notification toast. Click below to test live delivery:
                    </p>
                    <a
                      href={directLinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs shadow-md transition-transform active:scale-95"
                    >
                      <span>Launch Live Direct Link / Offer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <a
              href={directLinkUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Test Direct Link Live &rarr;</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-xs text-slate-700 hover:bg-slate-200 font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
