import { PublisherZone, PublisherPayoutRecord } from '../types';

const STORAGE_ZONES_KEY = 'hilltop_pub_zones';
const STORAGE_BALANCE_KEY = 'hilltop_pub_balance';
const STORAGE_PAYOUTS_KEY = 'hilltop_pub_payouts';

export const DEFAULT_PUBLISHER_ZONES: PublisherZone[] = [
  {
    id: 'zone_5328',
    publisherId: 'pub_user',
    publisherName: 'Verified Webmaster',
    siteUrl: 'https://sportsnewselite.blogspot.com',
    zoneName: 'sports news',
    format: 'banner',
    bannerSize: '728x90',
    antiAdblockEnabled: true,
    status: 'active',
    impressions: 4,
    clicks: 2,
    eCPM: 2.45,
    grossRevenue: 0.0098,
    publisherEarnings: 0.0074,
    platformCommission: 0.0024,
    createdAt: '2026-09-06T01:25:00.000Z',
  },
  {
    id: 'zone_7571',
    publisherId: 'pub_user',
    publisherName: 'Verified Webmaster',
    siteUrl: 'https://mycoolsite.com',
    zoneName: 'My Cool Banner',
    format: 'banner',
    bannerSize: '300x250',
    antiAdblockEnabled: true,
    status: 'active',
    impressions: 2,
    clicks: 1,
    eCPM: 2.35,
    grossRevenue: 0.0047,
    publisherEarnings: 0.0035,
    platformCommission: 0.0012,
    createdAt: '2026-09-06T01:13:59.307Z',
  },
  {
    id: 'zone_9710',
    publisherId: 'pub_user',
    publisherName: 'Verified Webmaster',
    siteUrl: 'https://mytechblog.com',
    zoneName: 'Header Banner 728x90',
    format: 'banner',
    bannerSize: '728x90',
    antiAdblockEnabled: true,
    status: 'active',
    impressions: 0,
    clicks: 0,
    eCPM: 1.85,
    grossRevenue: 0,
    publisherEarnings: 0,
    platformCommission: 0,
    createdAt: '2026-09-06T01:06:35.398Z',
  },
  {
    id: 'zone_4805',
    publisherId: 'pub_user',
    publisherName: 'Verified Webmaster',
    siteUrl: 'https://test.com',
    zoneName: 'Test Zone',
    format: 'popunder',
    antiAdblockEnabled: true,
    status: 'active',
    impressions: 0,
    clicks: 0,
    eCPM: 2.65,
    grossRevenue: 0,
    publisherEarnings: 0,
    platformCommission: 0,
    createdAt: '2026-09-06T01:03:14.801Z',
  },
];

/**
 * Reads publisher zones from persistent client storage (localStorage / cookie).
 * Guaranteed to never return an empty list on initial load or page refresh.
 */
export function getStoredZones(sessionId?: string): PublisherZone[] {
  if (typeof window === 'undefined') return DEFAULT_PUBLISHER_ZONES;

  const pubId = (sessionId || 'pub_user').trim();
  const sessionKey = `${STORAGE_ZONES_KEY}_${pubId}`;

  try {
    const raw = localStorage.getItem(sessionKey) || localStorage.getItem(STORAGE_ZONES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure every zone is active by default if not set
        return parsed.map((z: PublisherZone) => ({
          ...z,
          status: z.status === 'paused' ? 'paused' : 'active',
        }));
      }
    }
  } catch (e) {
    console.warn('Failed reading zones from localStorage', e);
  }

  // Initialize with default verified zones so the table is never blank on refresh
  const initial = DEFAULT_PUBLISHER_ZONES.map((z) => ({
    ...z,
    publisherId: pubId,
  }));
  saveStoredZones(pubId, initial);
  return initial;
}

/**
 * Persists zones list into client-side storage for instant hydration on refresh
 */
export function saveStoredZones(sessionId: string | undefined, zones: PublisherZone[]): void {
  if (typeof window === 'undefined') return;
  const pubId = (sessionId || 'pub_user').trim();
  const sessionKey = `${STORAGE_ZONES_KEY}_${pubId}`;

  try {
    const serialized = JSON.stringify(zones);
    localStorage.setItem(sessionKey, serialized);
    localStorage.setItem(STORAGE_ZONES_KEY, serialized);
  } catch (e) {
    console.warn('Failed saving zones to localStorage', e);
  }
}

/**
 * Adds a new zone to client storage immediately
 */
export function saveNewZone(sessionId: string | undefined, newZone: PublisherZone): PublisherZone[] {
  const current = getStoredZones(sessionId);
  // Remove duplicate if already present
  const filtered = current.filter((z) => z.id !== newZone.id);
  const updated = [newZone, ...filtered];
  saveStoredZones(sessionId, updated);
  return updated;
}

/**
 * Updates an individual zone's active / paused status
 */
export function updateStoredZoneStatus(
  sessionId: string | undefined,
  zoneId: string,
  status: 'active' | 'paused'
): PublisherZone[] {
  const current = getStoredZones(sessionId);
  const updated = current.map((z) => (z.id === zoneId ? { ...z, status } : z));
  saveStoredZones(sessionId, updated);
  return updated;
}

/**
 * Deletes a zone from storage
 */
export function deleteStoredZone(sessionId: string | undefined, zoneId: string): PublisherZone[] {
  const current = getStoredZones(sessionId);
  const updated = current.filter((z) => z.id !== zoneId);
  saveStoredZones(sessionId, updated);
  return updated;
}

/**
 * Reads publisher balance from persistent storage
 */
export function getStoredBalance(sessionId?: string): number {
  if (typeof window === 'undefined') return 0.0;
  const pubId = (sessionId || 'pub_user').trim();
  const key = `${STORAGE_BALANCE_KEY}_${pubId}`;
  try {
    const raw = localStorage.getItem(key) || localStorage.getItem(STORAGE_BALANCE_KEY);
    if (raw !== null) {
      const num = parseFloat(raw);
      if (!isNaN(num)) return num;
    }
  } catch (e) {}
  return 0.0035;
}

/**
 * Saves publisher balance to persistent storage
 */
export function saveStoredBalance(sessionId: string | undefined, balance: number): void {
  if (typeof window === 'undefined') return;
  const pubId = (sessionId || 'pub_user').trim();
  const key = `${STORAGE_BALANCE_KEY}_${pubId}`;
  try {
    const val = balance.toString();
    localStorage.setItem(key, val);
    localStorage.setItem(STORAGE_BALANCE_KEY, val);
  } catch (e) {}
}

/**
 * Reads payouts from persistent storage
 */
export function getStoredPayouts(sessionId?: string): PublisherPayoutRecord[] {
  if (typeof window === 'undefined') return [];
  const pubId = (sessionId || 'pub_user').trim();
  const key = `${STORAGE_PAYOUTS_KEY}_${pubId}`;
  try {
    const raw = localStorage.getItem(key) || localStorage.getItem(STORAGE_PAYOUTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

/**
 * Saves payouts to persistent storage
 */
export function saveStoredPayouts(
  sessionId: string | undefined,
  payouts: PublisherPayoutRecord[]
): void {
  if (typeof window === 'undefined') return;
  const pubId = (sessionId || 'pub_user').trim();
  const key = `${STORAGE_PAYOUTS_KEY}_${pubId}`;
  try {
    const serialized = JSON.stringify(payouts);
    localStorage.setItem(key, serialized);
    localStorage.setItem(STORAGE_PAYOUTS_KEY, serialized);
  } catch (e) {}
}

/**
 * Records an impression or click on a zone in client storage and broadcasts the event
 */
export function recordZoneImpressionOrClick(
  sessionId: string | undefined,
  zoneId: string,
  type: 'impression' | 'click'
): { updatedZone: PublisherZone | null; newBalance: number } {
  const currentZones = getStoredZones(sessionId);
  let target = currentZones.find((z) => z.id === zoneId);

  // If not found, create a fallback zone record
  if (!target) {
    target = {
      id: zoneId,
      publisherId: (sessionId || 'pub_user').trim(),
      publisherName: 'Verified Webmaster',
      siteUrl: 'https://sportsnewselite.blogspot.com',
      zoneName: zoneId === 'zone_5328' ? 'sports news' : `Zone ${zoneId}`,
      format: 'banner',
      bannerSize: '728x90',
      antiAdblockEnabled: true,
      status: 'active',
      impressions: 0,
      clicks: 0,
      eCPM: 2.25,
      grossRevenue: 0,
      publisherEarnings: 0,
      platformCommission: 0,
      createdAt: new Date().toISOString(),
    };
    currentZones.push(target);
  }

  const addedGross = type === 'impression' ? 0.0022 : 0.035;
  const addedPubEarnings = Number((addedGross * 0.75).toFixed(4));
  const addedPlatform = Number((addedGross * 0.25).toFixed(4));

  if (type === 'impression') {
    target.impressions += 1;
  } else {
    target.clicks += 1;
  }

  target.grossRevenue = Number((target.grossRevenue + addedGross).toFixed(4));
  target.publisherEarnings = Number((target.publisherEarnings + addedPubEarnings).toFixed(4));
  target.platformCommission = Number((target.platformCommission + addedPlatform).toFixed(4));

  if (target.impressions > 0) {
    target.eCPM = Number(((target.publisherEarnings / target.impressions) * 1000).toFixed(2));
  }

  const updatedZones = currentZones.map((z) => (z.id === zoneId ? { ...target! } : z));
  saveStoredZones(sessionId, updatedZones);

  // Increment publisher account balance
  const oldBalance = getStoredBalance(sessionId);
  const newBalance = Number((oldBalance + addedPubEarnings).toFixed(4));
  saveStoredBalance(sessionId, newBalance);

  // Broadcast event across tabs/windows
  try {
    if (typeof window !== 'undefined') {
      const payload = JSON.stringify({ type, zoneId, timestamp: Date.now(), addedPubEarnings });
      localStorage.setItem('hilltop_live_ad_event', payload);
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('hilltop_ad_channel');
        bc.postMessage({ type, zoneId, timestamp: Date.now(), addedPubEarnings });
        bc.close();
      }
    }
  } catch (e) {}

  return { updatedZone: target, newBalance };
}

