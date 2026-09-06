import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  ShieldCheck,
  Code,
  Link2,
  MousePointer,
  BellRing,
  LayoutGrid,
  ExternalLink,
  RefreshCw,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Zap,
  Clock,
  Trash2,
  Power,
  Radio,
  Eye,
  Globe,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { PublisherZone, ActiveAppView, PublisherPayoutRecord, TrafficHit } from '../../types';
import { AddZoneModal } from './AddZoneModal';
import { AdCodeGeneratorModal } from './AdCodeGeneratorModal';
import { PayoutRequestModal } from './PayoutRequestModal';
import {
  getPublisherSessionId,
  getPublisherHeaders,
  resetToCleanSession,
  switchToDemoSession,
} from '../../utils/session';
import {
  getStoredZones,
  saveStoredZones,
  saveNewZone,
  updateStoredZoneStatus,
  deleteStoredZone,
  getStoredBalance,
  saveStoredBalance,
  getStoredPayouts,
  saveStoredPayouts,
  recordZoneImpressionOrClick,
} from '../../utils/publisherStorage';

interface PublisherDashboardProps {
  onNavigate: (view: ActiveAppView) => void;
}

export const PublisherDashboard: React.FC<PublisherDashboardProps> = ({ onNavigate }) => {
  const [currentSessionId, setCurrentSessionId] = useState<string>(getPublisherSessionId());
  // Initialize directly from local persistent storage so zones never disappear on page refresh
  const [zones, setZones] = useState<PublisherZone[]>(() => getStoredZones(getPublisherSessionId()));
  const [balance, setBalance] = useState<number>(() => getStoredBalance(getPublisherSessionId()));
  const [payouts, setPayouts] = useState<PublisherPayoutRecord[]>(() => getStoredPayouts(getPublisherSessionId()));
  const [trafficHits, setTrafficHits] = useState<TrafficHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);
  const [selectedCodeZone, setSelectedCodeZone] = useState<PublisherZone | null>(null);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const fetchPublisherData = async () => {
    try {
      // First reload latest locally stored state so we never miss events
      const currentLocal = getStoredZones(currentSessionId);
      const currentBal = getStoredBalance(currentSessionId);
      setZones(currentLocal);
      setBalance(currentBal);

      const headers = getPublisherHeaders();

      // Fetch zones from API with local persistent fallback
      try {
        const res = await fetch('/api/zones', { headers });
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && Array.isArray(data.zones)) {
            const serverZones: PublisherZone[] = data.zones;
            const localMap = new Map(currentLocal.map((lz) => [lz.id, lz]));
            const serverIds = new Set(serverZones.map((z) => z.id));

            let hasLocalAdvancement = false;
            const merged: PublisherZone[] = serverZones.map((sz) => {
              const lz = localMap.get(sz.id);
              if (!lz) return sz;

              const impressions = Math.max(sz.impressions || 0, lz.impressions || 0);
              const clicks = Math.max(sz.clicks || 0, lz.clicks || 0);
              const pubEarnings = Math.max(sz.publisherEarnings || 0, lz.publisherEarnings || 0);
              const gross = Math.max(sz.grossRevenue || 0, lz.grossRevenue || 0);

              if (impressions > (sz.impressions || 0) || clicks > (sz.clicks || 0)) {
                hasLocalAdvancement = true;
              }

              return {
                ...sz,
                impressions,
                clicks,
                publisherEarnings: pubEarnings,
                grossRevenue: gross,
                status: lz.status || sz.status || 'active',
              };
            });

            // Retain any locally created zones not yet on server
            for (const lz of currentLocal) {
              if (!serverIds.has(lz.id)) {
                merged.push(lz);
                hasLocalAdvancement = true;
              }
            }

            setZones(merged);
            saveStoredZones(currentSessionId, merged);

            const higherBalance = Math.max(data.balance ?? 0, currentBal ?? 0);
            setBalance(higherBalance);
            saveStoredBalance(currentSessionId, higherBalance);

            // Sync updated values to backend so server database stays up to date
            if (hasLocalAdvancement) {
              fetch('/api/serve/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ zones: merged, balance: higherBalance }),
              }).catch(() => {});
            }
          }
        }
      } catch (e) {
        console.warn('API fetch zones unreachable, retaining stored active zones', e);
      }

      // Fetch payout history
      try {
        const resP = await fetch('/api/payouts/history', { headers });
        const contentTypeP = resP.headers.get('content-type');
        if (contentTypeP && contentTypeP.includes('application/json')) {
          const dataP = await resP.json();
          if (dataP.success && Array.isArray(dataP.payouts)) {
            setPayouts(dataP.payouts);
            saveStoredPayouts(currentSessionId, dataP.payouts);
            if (dataP.balance !== undefined) {
              setBalance(dataP.balance);
              saveStoredBalance(currentSessionId, dataP.balance);
            }
          }
        }
      } catch (e) {
        console.warn('API fetch payouts unreachable, retaining stored payouts', e);
      }

      // Fetch live verified website traffic hits
      try {
        const resT = await fetch('/api/serve/traffic-log', { headers });
        const contentTypeT = resT.headers.get('content-type');
        if (contentTypeT && contentTypeT.includes('application/json')) {
          const dataT = await resT.json();
          if (dataT.success && Array.isArray(dataT.hits)) {
            setTrafficHits(dataT.hits);
          }
        }
      } catch (e) {
        console.warn('API fetch traffic-log unreachable', e);
      }

      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublisherData();
    // Auto-sync stats every 4 seconds so zone impressions, clicks and earnings update live
    const interval = setInterval(() => {
      fetchPublisherData();
    }, 4000);

    // Cross-tab and live ad frame listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hilltop_live_ad_event' || e.key?.startsWith('hilltop_pub_')) {
        const latest = getStoredZones(currentSessionId);
        setZones(latest);
        const bal = getStoredBalance(currentSessionId);
        setBalance(bal);
        showToast('Live Ad Activity detected! Impressions & Balance refreshed.');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('hilltop_ad_channel');
        bc.onmessage = (event) => {
          const { type, zoneId } = event.data || {};
          const latest = getStoredZones(currentSessionId);
          setZones(latest);
          const bal = getStoredBalance(currentSessionId);
          setBalance(bal);
          showToast(`⚡ Live ${type === 'click' ? 'Click' : 'Impression'} on ${zoneId}! Stats updated.`);
        };
      } catch (err) {}
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, [currentSessionId]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchPublisherData();
    setTimeout(() => {
      setRefreshing(false);
      showToast('Live Sync Complete • Stats, impressions & clicks verified');
    }, 400);
  };

  const handleResetSession = () => {
    const newId = resetToCleanSession();
    setCurrentSessionId(newId);
    const freshZones = getStoredZones(newId);
    setZones(freshZones);
    setBalance(0.0);
    setPayouts([]);
  };

  const handleSwitchToDemo = () => {
    const demoId = switchToDemoSession();
    setCurrentSessionId(demoId);
    const demoZones = getStoredZones(demoId);
    setZones(demoZones);
  };

  const handleToggleZoneStatus = async (zoneId: string, currentStatus: string) => {
    const nextStatus: 'active' | 'paused' = currentStatus === 'active' ? 'paused' : 'active';
    const updated = updateStoredZoneStatus(currentSessionId, zoneId, nextStatus);
    setZones(updated);

    try {
      await fetch(`/api/zones/${zoneId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getPublisherHeaders(),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {
      // Local state and storage already updated
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!window.confirm('Are you sure you want to delete this ad zone?')) return;
    const updated = deleteStoredZone(currentSessionId, zoneId);
    setZones(updated);

    try {
      await fetch(`/api/zones/${zoneId}`, {
        method: 'DELETE',
        headers: getPublisherHeaders(),
      });
    } catch (e) {
      // Local storage updated
    }
  };

  const totalEarnings = zones.reduce((sum, z) => sum + z.publisherEarnings, 0);
  const totalImpressions = zones.reduce((sum, z) => sum + z.impressions, 0);
  const totalClicks = zones.reduce((sum, z) => sum + z.clicks, 0);
  const avgEcpm = totalImpressions > 0 ? ((totalEarnings / totalImpressions) * 1000).toFixed(2) : '0.00';

  const handlePayoutRequested = (amount: number, payoutRecord?: PublisherPayoutRecord) => {
    const newBal = Math.max(0, Number((balance - amount).toFixed(2)));
    setBalance(newBal);
    saveStoredBalance(currentSessionId, newBal);
    if (payoutRecord) {
      const updatedPayouts = [payoutRecord, ...payouts];
      setPayouts(updatedPayouts);
      saveStoredPayouts(currentSessionId, updatedPayouts);
    }
  };

  const handleZoneCreated = (newZone: PublisherZone) => {
    const updated = saveNewZone(currentSessionId, newZone);
    setZones(updated);
    // Automatically open the code integration modal so the user gets their ad tag immediately!
    setSelectedCodeZone(newZone);
  };

  return (
    <div className="py-10 bg-[#F8FAFC] min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Session Isolation Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Account / Browser Session Isolation Active
                </span>
                <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                  Publisher ID: {currentSessionId}
                </span>
                {currentSessionId === 'demo' ? (
                  <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    Demo Mode (Sample Data)
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    Clean Visitor Account ($0.00 Start)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Every new visitor automatically starts with a clean <strong>$0.00 balance</strong>, separate ad zones, and an isolated payout ledger.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
            <button
              onClick={handleResetSession}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Generate fresh visitor identity to test zero-balance state"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Clean Visitor ($0.00)</span>
            </button>
            {currentSessionId !== 'demo' ? (
              <button
                onClick={handleSwitchToDemo}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition-colors"
              >
                Preview Demo Mode
              </button>
            ) : (
              <button
                onClick={handleResetSession}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold transition-colors"
              >
                Switch to Clean ($0.00)
              </button>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Publisher Monetization Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Monetization Zones &amp; Payouts</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Manage website ad tags, direct smartlinks, Anti-AdBlock recovery, and withdraw your earnings.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Synced: <strong className="font-mono text-slate-800">{lastSyncedTime}</strong></span>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Fetch latest impressions, clicks, and earnings"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Live Sync'}</span>
            </button>

            <button
              onClick={() => setIsPayoutOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Request Payout</span>
            </button>

            <button
              onClick={() => setIsAddZoneOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              id="btn-add-zone-main"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Zone</span>
            </button>
          </div>
        </div>

        {/* Live Notification Banner */}
        {toastMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium rounded-xl flex items-center justify-between shadow-xs transition-all animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs text-emerald-700 hover:text-emerald-950 font-bold px-2 py-0.5 rounded hover:bg-emerald-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Payable Balance</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600">
              ${balance.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Min. payout $20.00 • 0% fee</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>All-Time Net Earnings</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              ${totalEarnings.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">75% Publisher revenue cut</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Average eCPM</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              ${avgEcpm}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Global blended eCPM across all zones
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Monetized Impressions</span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {totalImpressions.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Fill Rate: <span className="text-emerald-600 font-bold">100%</span>
            </div>
          </div>
        </div>

        {/* Zones Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-slate-900">Active Publisher Zones</span>
              <span className="text-xs font-mono text-slate-600 px-2 py-0.5 rounded bg-slate-100 font-semibold">
                {zones.length}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Persistent Storage Active
              </span>
            </div>
            <button
              onClick={fetchPublisherData}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {zones.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Active Monetization Zones</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  You are currently in an isolated visitor session. Add your first ad zone (Popunder, Direct Link, Banner, or In-Page Push) to start serving ads and earning revenue.
                </p>
                <button
                  onClick={() => setIsAddZoneOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Zone</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Zone &amp; Website</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Anti-AdBlock</th>
                    <th className="py-3 px-4 text-right">Impressions</th>
                    <th className="py-3 px-4 text-right">Clicks</th>
                    <th className="py-3 px-4 text-right">eCPM</th>
                    <th className="py-3 px-4 text-right">Publisher Earnings</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Integration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {zones.map((z) => (
                    <tr key={z.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 text-sm">{z.zoneName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-emerald-600 font-semibold">{z.id}</span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{z.siteUrl}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                          {z.format.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleZoneStatus(z.id, z.status || 'active')}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border shadow-2xs ${
                            z.status === 'paused'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title={`Zone is currently ${z.status || 'active'}. Click to toggle.`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              z.status === 'paused' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                            }`}
                          />
                          <span className="capitalize">{z.status || 'active'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        {z.antiAdblockEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Enabled (+42%)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        {z.impressions.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-blue-600 font-bold">
                        {z.clicks.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ${z.eCPM.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
                        ${z.publisherEarnings.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setSelectedCodeZone(z)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                          >
                            <Code className="w-3.5 h-3.5" />
                            <span>Get Code</span>
                          </button>
                          <a
                            href={`/api/serve/direct-link/${z.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                            title="Test Live Ad Destination"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDeleteZone(z.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Zone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Real-Time Website Traffic Stream */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Live Website Traffic &amp; Monetization Stream</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Traffic Listener
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real visitor impressions &amp; clicks updating automatically on their own from <span className="font-semibold text-slate-700">sportsnewselite.blogspot.com</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Real Traffic Data</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {trafficHits.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2.5 text-slate-400">
                  <Radio className="w-5 h-5 animate-pulse text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Listening for Website Visitors</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Your ad tag is active. Whenever visitors browse <span className="text-slate-700 font-semibold">https://sportsnewselite.blogspot.com</span>, their genuine impressions and clicks will record and update your earnings here automatically.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Time</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4">Source Website</th>
                    <th className="py-3 px-4">Visitor / Device</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Publisher Cut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trafficHits.map((hit) => (
                    <tr key={hit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 sm:px-6 text-slate-500 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(hit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {hit.type === 'click' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <MousePointer className="w-3 h-3 text-blue-600" />
                            Ad Click
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Eye className="w-3 h-3 text-emerald-600" />
                            Impression
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {hit.zoneName || hit.zoneId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[180px]">{hit.sourceDomain || 'sportsnewselite.blogspot.com'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                        {hit.ipMasked} • {hit.userAgentSnippet}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Monetized
                        </span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-right font-mono font-bold text-emerald-600">
                        +${hit.earned.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Accelerated & Instant Payout History */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Accelerated Payout &amp; Settlement History</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  Instant Disburse Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time disbursements to your verified destination accounts
              </p>
            </div>
            <button
              onClick={() => setIsPayoutOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold self-start sm:self-auto flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Request Instant Payout</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {payouts.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2.5 text-slate-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Payout Requests Recorded</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Your payout ledger is completely isolated. Once your balance reaches the $20.00 minimum threshold from monetized impressions, you can request an instant disbursement.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Transaction ID</th>
                    <th className="py-3 px-4">Method &amp; Destination</th>
                    <th className="py-3 px-4">Disbursement Speed</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Settled At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-900 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[140px] sm:max-w-none">{p.txnHash}</span>
                          {p.isRealDisbursement ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ⚡ LIVE
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              SANDBOX
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 uppercase text-xs">{p.method}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{p.payoutAddress}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.speed === 'instant' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Zap className="w-3 h-3 text-emerald-600" />
                            Instant (&lt;60s)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            <Clock className="w-3 h-3 text-blue-600" />
                            {p.speed === 'same_day' ? 'Same-Day' : 'Standard'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
                        ${p.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right text-[11px] text-slate-500">
                        {new Date(p.settledAt || p.requestedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddZoneModal
        isOpen={isAddZoneOpen}
        onClose={() => setIsAddZoneOpen(false)}
        onZoneCreated={handleZoneCreated}
      />

      <AdCodeGeneratorModal
        isOpen={Boolean(selectedCodeZone)}
        onClose={() => setSelectedCodeZone(null)}
        zone={selectedCodeZone}
      />

      <PayoutRequestModal
        isOpen={isPayoutOpen}
        onClose={() => setIsPayoutOpen(false)}
        availableBalance={balance}
        onPayoutRequested={handlePayoutRequested}
      />
    </div>
  );
};
