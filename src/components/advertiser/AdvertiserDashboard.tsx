import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Play,
  Pause,
  DollarSign,
  MousePointer,
  Eye,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { Campaign, ActiveAppView } from '../../types';
import { CampaignWizardModal } from './CampaignWizardModal';

interface AdvertiserDashboardProps {
  onNavigate: (view: ActiveAppView) => void;
}

export const AdvertiserDashboard: React.FC<AdvertiserDashboardProps> = ({ onNavigate }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [balance, setBalance] = useState<number>(2450.0);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('500');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'active' | 'paused'>('ALL');
  const [depositSuccessMsg, setDepositSuccessMsg] = useState('');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns);
        if (data.balance !== undefined) setBalance(data.balance);
      }
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/campaigns/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
        );
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSimulateDeposit = () => {
    const val = Number(depositAmount);
    if (val > 0) {
      setBalance((b) => Number((b + val).toFixed(2)));
      setDepositSuccessMsg(`Successfully credited $${val.toFixed(2)} to advertiser balance!`);
      setTimeout(() => {
        setIsDepositModalOpen(false);
        setDepositSuccessMsg('');
      }, 1200);
    }
  };

  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const filtered = campaigns.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="py-10 bg-[#F8FAFC] min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Advertiser Management Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Campaigns &amp; Real-Time Analytics</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Target high-converting traffic across Popunder, Direct Links, and In-Page Push with anti-fraud filtering.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs"
            >
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Add Balance</span>
            </button>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              id="btn-create-campaign-main"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Account Balance</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600">
              ${balance.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Funds active &amp; ready to serve</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Total Ad Spend</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              ${totalSpent.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Across all active campaigns</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Impressions Delivered</span>
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {totalImpressions.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Filtered by 4-layer Anti-Fraud</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Clicks &amp; Conversions</span>
              <MousePointer className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {totalClicks.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              CTR: <span className="text-blue-600 font-bold">{avgCtr}%</span> • {totalConversions} Conversions
            </div>
          </div>
        </div>

        {/* Campaign Filter & Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">All Ad Campaigns</span>
              <span className="text-xs font-mono text-slate-600 px-2 py-0.5 rounded bg-slate-100">
                {campaigns.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
                {(['ALL', 'active', 'paused'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-lg font-semibold uppercase tracking-wider text-[11px] transition-colors ${
                      filterStatus === status
                        ? 'bg-white text-slate-900 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button
                onClick={fetchCampaigns}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs"
                title="Refresh campaigns"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                  <th className="py-3 px-4">Campaign Details</th>
                  <th className="py-3 px-4">Format &amp; Model</th>
                  <th className="py-3 px-4 text-right">Bid Rate</th>
                  <th className="py-3 px-4 text-right">Budget &amp; Spend</th>
                  <th className="py-3 px-4 text-right">Impressions</th>
                  <th className="py-3 px-4 text-right">Clicks</th>
                  <th className="py-3 px-4 sm:px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          c.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                        />
                        <span className="capitalize">{c.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-blue-600">{c.id}</span>
                        <span>•</span>
                        <span>GEOs: {c.targetGeos.join(', ')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                        {c.adFormat.replace('_', ' ')}
                      </span>
                      <span className="ml-2 font-mono font-bold text-slate-900">{c.pricingModel}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      ${c.bid.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-slate-900">${c.spent.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">of ${c.totalBudget} cap</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      {c.impressions.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-blue-600 font-bold">
                      {c.clicks.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <button
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className={`p-2 rounded-lg border transition-all ${
                          c.status === 'active'
                            ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                        title={c.status === 'active' ? 'Pause campaign' : 'Resume campaign'}
                      >
                        {c.status === 'active' ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-emerald-600" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Postback & Conversion Tracking Guidance Card */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">CPA Conversion Tracking &amp; Postback URL</h4>
            <p className="text-xs text-slate-600 max-w-xl">
              Integrate real-time conversion telemetry with your affiliate tracking platform (Voluum, Binom, RedTrack, Keitaro):
            </p>
            <code className="block mt-2 p-2 rounded-xl bg-white text-blue-700 text-xs font-mono border border-slate-200 select-all shadow-2xs">
              https://hilltopads.pro/api/serve/postback?click_id={'{click_id}'}&amp;payout={'{payout}'}
            </code>
          </div>
          <button
            onClick={() => onNavigate('api_docs')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
          >
            <span>View Full API Docs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Campaign Creation Wizard */}
      <CampaignWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCampaignCreated={(camp) => setCampaigns((prev) => [camp, ...prev])}
      />

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full text-slate-800 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Balance to Advertiser Wallet</h3>
            <p className="text-xs text-slate-500 mb-4">
              Instant crediting for high-volume automated bidding
            </p>

            {depositSuccessMsg ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{depositSuccessMsg}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Deposit Amount (USD)
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {['250', '500', '1000'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold font-mono border transition-colors ${
                          depositAmount === amt
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Payment Gateway:</span>
                    <span className="text-slate-900 font-semibold">PayPal / Commercial Wire</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span className="text-emerald-600 font-semibold">0% (HilltopAds Promo)</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsDepositModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-xs text-slate-700 hover:bg-slate-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSimulateDeposit}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Confirm &amp; Credit Wallet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
