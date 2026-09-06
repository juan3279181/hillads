import React, { useState } from 'react';
import { Globe, Search, ArrowUpDown, Filter } from 'lucide-react';

interface GeoRate {
  country: string;
  code: string;
  flag: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  popunderCpm: number;
  directLinkCpc: number;
  inPagePushCpc: number;
  dailyVolume: string;
}

export const RatesCoverageTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<'ALL' | 'Tier 1' | 'Tier 2' | 'Tier 3'>('ALL');

  const geoData: GeoRate[] = [
    {
      country: 'United States',
      code: 'US',
      flag: '🇺🇸',
      tier: 'Tier 1',
      popunderCpm: 4.85,
      directLinkCpc: 0.35,
      inPagePushCpc: 0.28,
      dailyVolume: '320M',
    },
    {
      country: 'United Kingdom',
      code: 'GB',
      flag: '🇬🇧',
      tier: 'Tier 1',
      popunderCpm: 4.2,
      directLinkCpc: 0.3,
      inPagePushCpc: 0.25,
      dailyVolume: '145M',
    },
    {
      country: 'Germany',
      code: 'DE',
      flag: '🇩🇪',
      tier: 'Tier 1',
      popunderCpm: 3.95,
      directLinkCpc: 0.28,
      inPagePushCpc: 0.22,
      dailyVolume: '110M',
    },
    {
      country: 'Canada',
      code: 'CA',
      flag: '🇨🇦',
      tier: 'Tier 1',
      popunderCpm: 3.8,
      directLinkCpc: 0.26,
      inPagePushCpc: 0.22,
      dailyVolume: '95M',
    },
    {
      country: 'Australia',
      code: 'AU',
      flag: '🇦🇺',
      tier: 'Tier 1',
      popunderCpm: 4.1,
      directLinkCpc: 0.32,
      inPagePushCpc: 0.24,
      dailyVolume: '75M',
    },
    {
      country: 'France',
      code: 'FR',
      flag: '🇫🇷',
      tier: 'Tier 1',
      popunderCpm: 3.4,
      directLinkCpc: 0.22,
      inPagePushCpc: 0.18,
      dailyVolume: '130M',
    },
    {
      country: 'Brazil',
      code: 'BR',
      flag: '🇧🇷',
      tier: 'Tier 2',
      popunderCpm: 1.85,
      directLinkCpc: 0.12,
      inPagePushCpc: 0.09,
      dailyVolume: '280M',
    },
    {
      country: 'India',
      code: 'IN',
      flag: '🇮🇳',
      tier: 'Tier 3',
      popunderCpm: 1.15,
      directLinkCpc: 0.08,
      inPagePushCpc: 0.05,
      dailyVolume: '850M',
    },
    {
      country: 'Indonesia',
      code: 'ID',
      flag: '🇮🇩',
      tier: 'Tier 3',
      popunderCpm: 1.35,
      directLinkCpc: 0.09,
      inPagePushCpc: 0.06,
      dailyVolume: '390M',
    },
    {
      country: 'Italy',
      code: 'IT',
      flag: '🇮🇹',
      tier: 'Tier 2',
      popunderCpm: 2.65,
      directLinkCpc: 0.17,
      inPagePushCpc: 0.14,
      dailyVolume: '105M',
    },
    {
      country: 'Spain',
      code: 'ES',
      flag: '🇪🇸',
      tier: 'Tier 2',
      popunderCpm: 2.5,
      directLinkCpc: 0.16,
      inPagePushCpc: 0.13,
      dailyVolume: '90M',
    },
    {
      country: 'Japan',
      code: 'JP',
      flag: '🇯🇵',
      tier: 'Tier 1',
      popunderCpm: 4.4,
      directLinkCpc: 0.31,
      inPagePushCpc: 0.26,
      dailyVolume: '120M',
    },
  ];

  const filtered = geoData.filter((geo) => {
    const matchesSearch =
      geo.country.toLowerCase().includes(search.toLowerCase()) ||
      geo.code.toLowerCase().includes(search.toLowerCase());
    const matchesTier = selectedTier === 'ALL' || geo.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  return (
    <section className="py-16 bg-white border-b border-slate-200 text-slate-800" id="rates">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Worldwide Traffic Coverage &amp; Bids</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Real-Time Rates &amp; Volumes</h2>
            <p className="text-slate-600 text-sm mt-1">
              Explore live estimated eCPM rates and traffic availability across 240+ countries.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Country or Code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-48 sm:w-60 shadow-2xs"
              />
            </div>

            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
              {(['ALL', 'Tier 1', 'Tier 2', 'Tier 3'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    selectedTier === tier
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Country / GEO</th>
                  <th className="py-3.5 px-4">Tier Group</th>
                  <th className="py-3.5 px-4 text-right">Popunder eCPM</th>
                  <th className="py-3.5 px-4 text-right">Direct Link CPC</th>
                  <th className="py-3.5 px-4 text-right">In-Page Push CPC</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Daily Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((geo) => (
                  <tr key={geo.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900 flex items-center gap-3">
                      <span className="text-xl">{geo.flag}</span>
                      <span>{geo.country}</span>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {geo.code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          geo.tier === 'Tier 1'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : geo.tier === 'Tier 2'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {geo.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                      ${geo.popunderCpm.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      ${geo.directLinkCpc.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      ${geo.inPagePushCpc.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right font-mono text-slate-600">
                      {geo.dailyVolume}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
