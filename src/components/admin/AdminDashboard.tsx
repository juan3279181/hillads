import React, { useState, useEffect } from 'react';
import {
  Shield,
  DollarSign,
  TrendingUp,
  Database,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Activity,
  Users,
  KeyRound,
  Download,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import {
  AntiFraudRule,
  FraudLogEvent,
  AuditLogItem,
  PlatformSettlementLedger,
  DatabaseBackupRecord,
  ActiveAppView,
} from '../../types';

interface AdminDashboardProps {
  onNavigate: (view: ActiveAppView) => void;
  onLogoutAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<
    'financials' | 'anti_fraud' | 'audit_logs' | 'backups' | 'rbac'
  >('financials');

  const [settlement, setSettlement] = useState<PlatformSettlementLedger | null>(null);
  const [fraudRules, setFraudRules] = useState<AntiFraudRule[]>([]);
  const [fraudLogs, setFraudLogs] = useState<FraudLogEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [backups, setBackups] = useState<DatabaseBackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [backupCreating, setBackupCreating] = useState(false);
  const [backupSuccessMsg, setBackupSuccessMsg] = useState('');
  const [disbursing, setDisbursing] = useState(false);
  const [disburseMsg, setDisburseMsg] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  const handleInstantOwnerDisbursement = async () => {
    setDisbursing(true);
    setDisburseMsg('');
    try {
      const res = await fetch('/api/admin/settlement/disburse', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDisburseMsg(data.message);
        loadAdminData();
      } else {
        setDisburseMsg(data.error || 'Disbursement could not be completed');
      }
    } catch (e: any) {
      setDisburseMsg(e.message || 'Network error');
    } finally {
      setDisbursing(false);
      setTimeout(() => setDisburseMsg(''), 5000);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [settleRes, rulesRes, logsRes, auditRes, backupsRes] = await Promise.all([
        fetch('/api/admin/settlement'),
        fetch('/api/fraud/rules'),
        fetch('/api/fraud/logs'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/admin/backups'),
      ]);

      const [settleData, rulesData, logsData, auditData, backupsData] = await Promise.all([
        settleRes.json(),
        rulesRes.json(),
        logsRes.json(),
        auditRes.json(),
        backupsRes.json(),
      ]);

      if (settleData.success) setSettlement(settleData.ledger);
      if (rulesData.success) setFraudRules(rulesData.rules);
      if (logsData.success) setFraudLogs(logsData.logs);
      if (auditData.success) setAuditLogs(auditData.logs);
      if (backupsData.success) setBackups(backupsData.backups);
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleRule = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/fraud/rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentVal }),
      });
      const data = await res.json();
      if (data.success) {
        setFraudRules((prev) =>
          prev.map((r) => (r.id === id ? { ...r, enabled: !currentVal } : r))
        );
      }
    } catch (err) {
      console.error('Failed to toggle rule', err);
    }
  };

  const handleCreateBackup = async () => {
    setBackupCreating(true);
    try {
      const res = await fetch('/api/admin/backups/create', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.backup) {
        setBackups((prev) => [data.backup, ...prev]);
        setBackupSuccessMsg('Verified database snapshot generated successfully!');
        setTimeout(() => setBackupSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to create backup', err);
    } finally {
      setBackupCreating(false);
    }
  };

  const filteredAudits = auditLogs.filter((log) => {
    return (
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.category.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.targetResource.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.adminName.toLowerCase().includes(auditSearch.toLowerCase())
    );
  });

  return (
    <div className="py-10 bg-[#F8FAFC] min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 mb-2">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>Super Administrator Console • Authenticated via MFA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Platform Integrity, Revenue Margins &amp; Security
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Monitor platform profit margins, backend settlements, anti-fraud rules, audit trails, and automated backups.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-2xs"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            </button>

            <button
              onClick={onLogoutAdmin}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 text-xs font-semibold shadow-2xs transition-colors"
            >
              Lock Console
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
          {[
            { id: 'financials', label: 'Platform Financials & Profit Margin', icon: DollarSign },
            { id: 'anti_fraud', label: 'Anti-Fraud Firewall Rules', icon: Shield },
            { id: 'audit_logs', label: 'Administrative Audit Logs', icon: FileText },
            { id: 'backups', label: 'Automated Database Backups', icon: Database },
            { id: 'rbac', label: 'Role-Based Access Control', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  isSel
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSel ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Platform Financials & Profit Margins */}
        {activeTab === 'financials' && settlement && (
          <div className="space-y-8">
            {/* 3 Large Highlight Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Platform Net Profit Card */}
              <div className="bg-white border border-amber-300 p-6 rounded-2xl shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-2">
                  <span>PLATFORM NET PROFIT (YOUR MARGIN)</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[10px]">
                    {settlement.platformCommissionPercent}% COMMISSION TAKE-RATE
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-700">
                  ${settlement.platformNetEarnings.toFixed(2)}
                </div>
                <div className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Earned automatically from all advertiser campaigns, publisher popunders, and direct smartlinks.
                </div>
              </div>

              {/* Total Gross Spend */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>TOTAL GROSS AD VOLUME</span>
                  <TrendingUp className="w-4 h-4 text-slate-700" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900">
                  ${settlement.totalGrossSpend.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Aggregate billing from all active advertiser bids
                </div>
              </div>

              {/* Publisher Payout Allocation */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>PUBLISHER DISBURSEMENTS</span>
                  <span className="text-emerald-700 font-mono text-xs font-semibold">75% Net Share</span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600">
                  ${settlement.totalPublisherPaid.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  ${settlement.totalPublisherPending.toFixed(2)} pending in scheduled settlement batches
                </div>
              </div>
            </div>

            {/* Backend Settlement Routing Details Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">Platform Owner Settlement Engine</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      SECURE BACKEND DISBURSEMENT ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Your platform earnings cut is systematically accumulated and routed to your secure backend settlement destination.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-700">
                      Routing: Commercial Settlement Environment
                    </span>
                  </div>
                  <button
                    onClick={handleInstantOwnerDisbursement}
                    disabled={disbursing}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <TrendingUp className={`w-3.5 h-3.5 ${disbursing ? 'animate-spin' : ''}`} />
                    <span>{disbursing ? 'Disbursing...' : 'Disburse Net Profit Instantly'}</span>
                  </button>
                </div>
              </div>

              {disburseMsg && (
                <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{disburseMsg}</span>
                </div>
              )}

              {/* Settlement History Table */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recent Platform Profit Disbursements
                </div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Batch ID</th>
                        <th className="py-3 px-4">Disbursement Method</th>
                        <th className="py-3 px-4 text-right">Net Profit Disbursed</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {settlement.recentSettlements.map((set) => (
                        <tr key={set.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-900 font-semibold">{set.id}</td>
                          <td className="py-3 px-4 font-medium text-slate-800">{set.destinationMethod}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                            +${set.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {set.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500">
                            {new Date(set.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Anti-Fraud Firewall Rules */}
        {activeTab === 'anti_fraud' && (
          <div className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">Active Anti-Fraud Filtration Rules</h3>
              <p className="text-xs text-slate-500 mb-6">
                Protect traffic quality and prevent advertiser budget drainage by blocking automated traffic.
              </p>

              <div className="space-y-4">
                {fraudRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{rule.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-slate-200 text-slate-700">
                          {rule.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Triggered: <span className="font-mono text-slate-900 font-bold">{rule.triggeredCount.toLocaleString()}</span> times • Action: <span className="uppercase text-red-600 font-bold">{rule.action}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleRule(rule.id, rule.enabled)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        rule.enabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {rule.enabled ? 'ACTIVE (ENFORCING)' : 'DISABLED'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Blocked Fraud Events Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Recent Quarantined Bot Events</h4>
                  <p className="text-xs text-slate-500">Suspicious requests filtered in real-time</p>
                </div>
                <span className="text-xs text-red-600 font-mono font-bold">
                  {fraudLogs.length} Events Logged
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">IP &amp; Country</th>
                      <th className="py-3 px-4">Flag Reason</th>
                      <th className="py-3 px-4 text-right">Risk Score</th>
                      <th className="py-3 px-4 text-center">Action Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fraudLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <div className="text-slate-900 font-bold">{log.ip}</div>
                          <div className="text-[10px] text-slate-500">{log.country}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{log.reason}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-red-600">
                          {log.score}/100
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-red-50 text-red-700 border border-red-200">
                            {log.actionTaken}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Administrative Audit Logs */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Cryptographic Audit Trail</h3>
                <p className="text-xs text-slate-500">
                  Every administrative action is immutably logged with actor, timestamp, category, and checksum.
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter logs by keyword..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-64 shadow-2xs"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Action</th>
                      <th className="py-3.5 px-4">Target Resource</th>
                      <th className="py-3.5 px-4">Actor</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Checksum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAudits.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 sm:px-6 font-mono text-slate-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{item.action}</td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {item.targetResource}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.adminName}</td>
                        <td className="py-3 px-4">
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-right font-mono text-[10px] text-slate-400">
                          {item.checksum}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Automated Database Backups */}
        {activeTab === 'backups' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Automated Database Backups &amp; Snapshots</h3>
                <p className="text-xs text-slate-500">
                  Scheduled snapshots prevent data loss and ensure rapid failover recovery.
                </p>
              </div>

              <button
                onClick={handleCreateBackup}
                disabled={backupCreating}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                <span>{backupCreating ? 'Generating Snapshot...' : 'Create Snapshot Now'}</span>
              </button>
            </div>

            {backupSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{backupSuccessMsg}</span>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="text-xs text-slate-500">
                  Automated Schedule:{' '}
                  <span className="text-slate-900 font-semibold">Every 6 Hours (00:00, 06:00, 12:00, 18:00 UTC)</span>
                </div>
                <div className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Backup Service Healthy</span>
                </div>
              </div>

              <div className="space-y-3">
                {backups.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 font-mono">{bk.filename}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span>Created: {new Date(bk.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <span>Size: {(bk.sizeBytes / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">{bk.checksum.slice(0, 16)}...</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {bk.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Role-Based Access Control (RBAC) */}
        {activeTab === 'rbac' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-slate-500">
                Enforces least-privilege security policies across administrative and customer accounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-amber-300 p-6 rounded-2xl shadow-xs">
                <div className="text-amber-800 font-bold text-sm mb-1">Super Administrator</div>
                <div className="text-xs text-slate-500 mb-4">Requires Multi-Factor Verification</div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600" /> Platform Commission Configuration
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600" /> Backend Settlement Routing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600" /> Anti-Fraud Rule Modification
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600" /> Database Backup &amp; Recovery
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
                <div className="text-slate-900 font-bold text-sm mb-1">Advertiser Account</div>
                <div className="text-xs text-slate-500 mb-4">Campaign Management &amp; Bidding</div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Create &amp; Pause Ad Campaigns
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Real-time Spend &amp; Impressions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Add Wallet Funds
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Postback Webhook Setup
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
                <div className="text-slate-900 font-bold text-sm mb-1">Publisher Account</div>
                <div className="text-xs text-slate-500 mb-4">Traffic Monetization &amp; Payouts</div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" /> Website Zone Creation
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" /> Anti-AdBlock Script Tags
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" /> Direct Smartlink Generation
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" /> Request Earnings Payout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
