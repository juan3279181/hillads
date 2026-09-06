import React, { useState } from 'react';
import { X, Check, Globe, Shield, DollarSign, Layers } from 'lucide-react';
import { AdFormatType, Campaign } from '../../types';

interface CampaignWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (campaign: Campaign) => void;
}

export const CampaignWizardModal: React.FC<CampaignWizardModalProps> = ({
  isOpen,
  onClose,
  onCampaignCreated,
}) => {
  const [name, setName] = useState('');
  const [adFormat, setAdFormat] = useState<AdFormatType>('popunder');
  const [pricingModel, setPricingModel] = useState<'CPM' | 'CPC' | 'CPA'>('CPM');
  const [bid, setBid] = useState('2.50');
  const [dailyBudget, setDailyBudget] = useState('150');
  const [totalBudget, setTotalBudget] = useState('2000');
  const [landingUrl, setLandingUrl] = useState('https://');
  const [fraudSensitivity, setFraudSensitivity] = useState<'standard' | 'strict' | 'maximum'>('strict');
  const [selectedGeos, setSelectedGeos] = useState<string[]>(['US', 'GB', 'CA']);
  const [selectedDevices, setSelectedDevices] = useState<('desktop' | 'mobile' | 'tablet')[]>([
    'desktop',
    'mobile',
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const geoOptions = [
    { code: 'US', label: 'United States' },
    { code: 'GB', label: 'United Kingdom' },
    { code: 'CA', label: 'Canada' },
    { code: 'DE', label: 'Germany' },
    { code: 'AU', label: 'Australia' },
    { code: 'FR', label: 'France' },
    { code: 'BR', label: 'Brazil' },
    { code: 'IN', label: 'India' },
  ];

  const handleToggleGeo = (code: string) => {
    setSelectedGeos((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleToggleDevice = (dev: 'desktop' | 'mobile' | 'tablet') => {
    setSelectedDevices((prev) =>
      prev.includes(dev) ? prev.filter((d) => d !== dev) : [...prev, dev]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a campaign name');
      return;
    }
    if (!landingUrl || landingUrl === 'https://') {
      setError('Please provide a valid destination landing URL');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          adFormat,
          pricingModel,
          bid: Number(bid),
          dailyBudget: Number(dailyBudget),
          totalBudget: Number(totalBudget),
          landingUrl,
          targetGeos: selectedGeos.length ? selectedGeos : ['ALL'],
          targetDevices: selectedDevices,
          fraudSensitivity,
        }),
      });

      const data = await res.json();
      if (data.success && data.campaign) {
        onCampaignCreated(data.campaign);
        onClose();
      } else {
        setError(data.error || 'Failed to create campaign');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 my-8 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Create New Advertising Campaign</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Launch targeted high-volume traffic backed by real-time anti-fraud filtering
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campaign Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Campaign Name</label>
            <input
              type="text"
              required
              placeholder="e.g. US Crypto Trading App - Mobile Popunder"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Format & Pricing Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ad Format</label>
              <select
                value={adFormat}
                onChange={(e) => setAdFormat(e.target.value as AdFormatType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="popunder">Popunder (OnClick)</option>
                <option value="direct_link">Direct Link (Smartlink)</option>
                <option value="in_page_push">In-Page Push (Toast)</option>
                <option value="banner">Display Banner (300x250 / 728x90)</option>
                <option value="video_vast">Video VAST / VPAID</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pricing Model</label>
              <div className="flex items-center gap-2">
                {(['CPM', 'CPC', 'CPA'] as const).map((model) => (
                  <button
                    type="button"
                    key={model}
                    onClick={() => setPricingModel(model)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      pricingModel === model
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bid & Budgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bid Price ({pricingModel})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={bid}
                  onChange={(e) => setBid(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Daily Budget</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  step="10"
                  min="20"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total Budget</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  step="50"
                  min="50"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Landing Destination URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Destination / Tracking Landing URL
            </label>
            <input
              type="url"
              required
              placeholder="https://your-landing-offer.com?clickid={click_id}"
              value={landingUrl}
              onChange={(e) => setLandingUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Macro parameters supported: <code>{'{click_id}'}</code>, <code>{'{geo}'}</code>,{' '}
              <code>{'{zone_id}'}</code>
            </span>
          </div>

          {/* Target GEOs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target GEOs</label>
            <div className="flex flex-wrap gap-2">
              {geoOptions.map((geo) => {
                const isSelected = selectedGeos.includes(geo.code);
                return (
                  <button
                    type="button"
                    key={geo.code}
                    onClick={() => handleToggleGeo(geo.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {geo.code} - {geo.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anti-Fraud Sensitivity */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Anti-Fraud Filter Sensitivity
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-700">Quality Protection</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'strict', 'maximum'] as const).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setFraudSensitivity(level)}
                  className={`py-2 rounded-lg text-xs font-bold capitalize border transition-all ${
                    fraudSensitivity === level
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              id="wizard-submit-btn"
            >
              {submitting ? 'Deploying Campaign...' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
