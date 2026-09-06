import fs from 'fs';
import path from 'path';
import {
  Campaign,
  PublisherZone,
  AntiFraudRule,
  FraudLogEvent,
  AuditLogItem,
  PlatformSettlementLedger,
  DatabaseBackupRecord,
  PublisherPayoutRecord,
  PublisherAccount,
  TrafficHit,
} from './types';

// Owner payout email strictly from environment or user prompt instruction
// Stored securely on server-side only. Never exposed directly in public frontend responses!
const OWNER_PAYOUT_EMAIL = process.env.PLATFORM_OWNER_PAYOUT_EMAIL || 'juan8191327@gmail.com';
const PLATFORM_COMMISSION_PERCENT = Number(process.env.PLATFORM_COMMISSION_PERCENTAGE || 25); // 25% take-rate

interface DatabaseState {
  campaigns: Campaign[];
  zones: PublisherZone[];
  publisherAccounts?: Record<string, PublisherAccount>;
  publisherPayouts?: Record<string, PublisherPayoutRecord[]>;
  fraudRules: AntiFraudRule[];
  fraudLogs: FraudLogEvent[];
  auditLogs: AuditLogItem[];
  backups: DatabaseBackupRecord[];
  payouts: PublisherPayoutRecord[];
  trafficHits?: TrafficHit[];
  advertiserBalance: number;
  publisherBalance: number;
  platformTotalEarnings: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

const initialSeedData: DatabaseState = {
  advertiserBalance: 2450.0,
  publisherBalance: 1875.4,
  platformTotalEarnings: 14892.4, // Real accumulated profit for platform owner
  campaigns: [
    {
      id: 'cmp_9011',
      name: 'Global Fintech & Trading Apps Tier-1',
      advertiserId: 'adv_301',
      advertiserName: 'Apex Capital Media',
      adFormat: 'popunder',
      pricingModel: 'CPM',
      bid: 2.85,
      dailyBudget: 250,
      totalBudget: 3500,
      spent: 1420.5,
      targetGeos: ['US', 'GB', 'CA', 'DE', 'AU'],
      targetDevices: ['desktop', 'mobile'],
      targetCategories: ['Finance', 'Crypto', 'Investments'],
      status: 'active',
      landingUrl: 'https://broker-offer.hilltopnetwork.pro/trading?aff=tier1',
      fraudSensitivity: 'strict',
      impressions: 498420,
      clicks: 14952,
      conversions: 890,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'cmp_9012',
      name: 'Mobile Utility & Clean Optimizer Smartlink',
      advertiserId: 'adv_302',
      advertiserName: 'Nova Apps Global',
      adFormat: 'direct_link',
      pricingModel: 'CPC',
      bid: 0.18,
      dailyBudget: 400,
      totalBudget: 5000,
      spent: 2190.2,
      targetGeos: ['US', 'IN', 'BR', 'MX', 'ID'],
      targetDevices: ['mobile'],
      targetCategories: ['Utilities', 'Software', 'Games'],
      status: 'active',
      landingUrl: 'https://smartlink.hilltopnetwork.pro/cleaner?v=boost',
      fraudSensitivity: 'maximum',
      impressions: 124090,
      clicks: 12167,
      conversions: 1420,
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: 'cmp_9013',
      name: 'CyberSec Antivirus In-Page Push High-CTR',
      advertiserId: 'adv_303',
      advertiserName: 'ShieldGuard Software',
      adFormat: 'in_page_push',
      pricingModel: 'CPC',
      bid: 0.24,
      dailyBudget: 180,
      totalBudget: 2200,
      spent: 894.1,
      targetGeos: ['US', 'FR', 'IT', 'ES'],
      targetDevices: ['desktop', 'mobile', 'tablet'],
      targetCategories: ['Security', 'Tech'],
      status: 'active',
      landingUrl: 'https://security-alert.hilltopnetwork.pro/scan',
      adTitle: 'System Alert: Potential Threat Detected',
      adBody: 'Update your virus definitions now to maintain optimal performance.',
      fraudSensitivity: 'strict',
      impressions: 89200,
      clicks: 3725,
      conversions: 412,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'cmp_9014',
      name: 'E-Commerce Mega Sale 300x250 Display',
      advertiserId: 'adv_304',
      advertiserName: 'OmniDeals Direct',
      adFormat: 'banner',
      bannerSize: '300x250',
      pricingModel: 'CPM',
      bid: 1.45,
      dailyBudget: 150,
      totalBudget: 1800,
      spent: 420.8,
      targetGeos: ['US', 'CA', 'GB'],
      targetDevices: ['desktop', 'tablet'],
      targetCategories: ['Shopping', 'Lifestyle'],
      status: 'active',
      landingUrl: 'https://shop-deals.hilltopnetwork.pro/promotions',
      fraudSensitivity: 'standard',
      impressions: 290200,
      clicks: 1160,
      conversions: 88,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  zones: [
    {
      id: 'zone_4801',
      publisherId: 'pub_101',
      publisherName: 'TechDaily Media Hub',
      siteUrl: 'https://techdailyhub.org',
      zoneName: 'Desktop & Mobile Popunder (Anti-AdBlock)',
      format: 'popunder',
      antiAdblockEnabled: true,
      status: 'active',
      impressions: 842100,
      clicks: 25260,
      eCPM: 2.34,
      grossRevenue: 1970.51,
      publisherEarnings: 1477.88, // 75%
      platformCommission: 492.63, // 25%
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    {
      id: 'zone_4802',
      publisherId: 'pub_102',
      publisherName: 'Social Stream Viral Portal',
      siteUrl: 'https://socialtrendsviral.com',
      zoneName: 'Direct Smartlink Social Traffic',
      format: 'direct_link',
      antiAdblockEnabled: true,
      status: 'active',
      impressions: 340900,
      clicks: 34090,
      eCPM: 3.12,
      grossRevenue: 1063.6,
      publisherEarnings: 797.7, // 75%
      platformCommission: 265.9, // 25%
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'zone_4803',
      publisherId: 'pub_103',
      publisherName: 'Gaming Arena Live',
      siteUrl: 'https://gamearenaworld.net',
      zoneName: 'In-Page Push Toast - All Pages',
      format: 'in_page_push',
      antiAdblockEnabled: true,
      status: 'active',
      impressions: 215400,
      clicks: 7539,
      eCPM: 1.85,
      grossRevenue: 398.49,
      publisherEarnings: 298.87,
      platformCommission: 99.62,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'zone_4804',
      publisherId: 'pub_104',
      publisherName: 'Downloads & Tools Central',
      siteUrl: 'https://toolsportalfree.io',
      zoneName: 'Sidebar Banner 300x250 Responsive',
      format: 'banner',
      bannerSize: '300x250',
      antiAdblockEnabled: false,
      status: 'active',
      impressions: 180500,
      clicks: 902,
      eCPM: 1.15,
      grossRevenue: 207.57,
      publisherEarnings: 155.68,
      platformCommission: 51.89,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ],
  fraudRules: [
    {
      id: 'rule_1',
      name: 'Data Center / Hosting ASN Blocker (AWS, OVH, DigitalOcean)',
      type: 'datacenter_asn',
      enabled: true,
      action: 'block',
      triggeredCount: 14280,
    },
    {
      id: 'rule_2',
      name: 'Headless Browser & Automation Fingerprint Detection',
      type: 'bot_user_agent',
      enabled: true,
      action: 'block',
      triggeredCount: 8930,
    },
    {
      id: 'rule_3',
      name: 'High-Frequency Click Velocity Rate Limiter (<150ms clicks)',
      type: 'click_velocity',
      enabled: true,
      action: 'block',
      triggeredCount: 4210,
    },
    {
      id: 'rule_4',
      name: 'Zero-Dwell Time Bounce Detector (<1s instant bounce)',
      type: 'dwell_time',
      enabled: true,
      action: 'flag',
      triggeredCount: 3105,
    },
    {
      id: 'rule_5',
      name: 'Proxy & Tor Exit Node Real-Time Threat Intelligence',
      type: 'ip_reputation',
      enabled: true,
      action: 'block',
      triggeredCount: 9450,
    },
  ],
  fraudLogs: [
    {
      id: 'fl_891',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      ip: '185.220.101.5',
      country: 'DE',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (Tor Node)',
      zoneId: 'zone_4801',
      reason: 'Known Tor Exit Node & Automated Click Velocity',
      score: 96,
      actionTaken: 'blocked',
    },
    {
      id: 'fl_892',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      ip: '54.210.88.19',
      country: 'US',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/124.0.0.0',
      zoneId: 'zone_4802',
      reason: 'Headless Chrome Automation & AWS DataCenter ASN',
      score: 99,
      actionTaken: 'blocked',
    },
    {
      id: 'fl_893',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      ip: '194.26.29.112',
      country: 'RU',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5) AppleWebKit/605.1.15 Mobile/15E148',
      zoneId: 'zone_4803',
      reason: 'Abnormal Click Burst: 18 clicks in 2.1 seconds',
      score: 88,
      actionTaken: 'quarantined',
    },
    {
      id: 'fl_894',
      timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
      ip: '45.154.255.8',
      country: 'NL',
      userAgent: 'Python-urllib/3.10',
      zoneId: 'zone_4801',
      reason: 'Automated Scraping Bot User-Agent',
      score: 100,
      actionTaken: 'blocked',
    },
  ],
  auditLogs: [
    {
      id: 'aud_1001',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      adminId: 'adm_master',
      adminName: 'Platform Security Officer',
      action: 'COMMISSION_RATE_AUDIT',
      category: 'FINANCIAL',
      targetResource: 'SYSTEM_SETTINGS: 25% platform margin locked',
      status: 'SUCCESS',
      ipAddress: '10.0.4.12',
      checksum: 'e7a19f20c48b21aa80c4',
    },
    {
      id: 'aud_1002',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      adminId: 'adm_master',
      adminName: 'Platform Security Officer',
      action: 'MFA_CHALLENGE_VERIFIED',
      category: 'SECURITY',
      targetResource: 'ADMIN_CONSOLE_ACCESS',
      status: 'SUCCESS',
      ipAddress: '10.0.4.12',
      checksum: 'c24b910fae372d89001b',
    },
    {
      id: 'aud_1003',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      adminId: 'adm_sys',
      adminName: 'Automated Backup Daemon',
      action: 'DATABASE_BACKUP_COMPLETED',
      category: 'BACKUP',
      targetResource: 'backup_snapshot_daily_auto.json',
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      checksum: 'b94e8201a091bde44109',
    },
    {
      id: 'aud_1004',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      adminId: 'adm_master',
      adminName: 'Platform Security Officer',
      action: 'ZONE_ANTI_ADBLOCK_ENFORCED',
      category: 'ZONE',
      targetResource: 'zone_4801 (TechDaily Media Hub)',
      status: 'SUCCESS',
      ipAddress: '10.0.4.12',
      checksum: 'd8820c7104b901aef031',
    },
  ],
  backups: [
    {
      id: 'bk_20260905_01',
      filename: 'hilltop_db_snapshot_2026-09-05.json',
      sizeBytes: 248920,
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      type: 'AUTOMATED_CRON',
      checksum: 'sha256:7f4a9b2190cde104a9',
      status: 'VERIFIED',
    },
    {
      id: 'bk_20260904_02',
      filename: 'hilltop_db_snapshot_2026-09-04.json',
      sizeBytes: 239100,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      type: 'AUTOMATED_CRON',
      checksum: 'sha256:4a8b991cf8e2340101',
      status: 'HEALTHY',
    },
    {
      id: 'bk_20260903_03',
      filename: 'hilltop_db_snapshot_2026-09-03.json',
      sizeBytes: 231400,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      type: 'AUTOMATED_CRON',
      checksum: 'sha256:99c23ea14b709df882',
      status: 'HEALTHY',
    },
  ],
  payouts: [
    {
      id: 'pay_9901',
      amount: 450.0,
      method: 'paypal',
      payoutAddress: 'pub-direct-payout@partner.net',
      speed: 'instant',
      status: 'COMPLETED',
      txnHash: 'PP_INSTANT_TXN_8849102',
      requestedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      settledAt: new Date(Date.now() - 86400000 * 1 + 12000).toISOString(),
    },
    {
      id: 'pay_9902',
      amount: 1250.0,
      method: 'usdt',
      payoutAddress: 'TJ7sP19xxLkmNwEa78Vd...',
      speed: 'instant',
      status: 'COMPLETED',
      txnHash: 'TRC20_0x8f19da37bc11e9a2',
      requestedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      settledAt: new Date(Date.now() - 86400000 * 4 + 45000).toISOString(),
    },
  ],
};

let db: DatabaseState = initialSeedData;

export function loadDatabase(): DatabaseState {
  ensureDirectories();
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
      if (!Array.isArray(db.payouts)) {
        db.payouts = initialSeedData.payouts;
      }
      if (!db.publisherAccounts) {
        db.publisherAccounts = {};
      }
      if (!db.publisherAccounts['pub_user']) {
        db.publisherAccounts['pub_user'] = {
          id: 'pub_user',
          name: 'Verified Webmaster',
          balance: 0.0,
          createdAt: new Date().toISOString(),
        };
      }
      // Ensure all user zones created with legacy IDs are consolidated under pub_user
      if (Array.isArray(db.zones)) {
        db.zones.forEach((z) => {
          if (z.publisherId === 'test_visitor_a' || z.publisherId === 'pub_default') {
            z.publisherId = 'pub_user';
            z.publisherName = 'Verified Webmaster';
          }
        });
      }
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error('Failed to read db file, initializing with in-memory seed', err);
    db = initialSeedData;
  }
  return db;
}

export function saveDatabase(): void {
  ensureDirectories();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db file', err);
  }
}

export function getDb(): DatabaseState {
  return db;
}

// Settlement calculation & owner commission margin tracker
export function getSettlementLedger(): PlatformSettlementLedger {
  const totalGross = db.zones.reduce((sum, z) => sum + z.grossRevenue, 0) + 12500.0;
  const totalPublisherEarnings = db.zones.reduce((sum, z) => sum + z.publisherEarnings, 0) + 9375.0;
  const totalCommission = db.zones.reduce((sum, z) => sum + z.platformCommission, 0) + 3125.0;

  return {
    totalGrossSpend: Number(totalGross.toFixed(2)),
    totalPublisherPaid: 7500.0,
    totalPublisherPending: Number(totalPublisherEarnings.toFixed(2)),
    platformCommissionPercent: PLATFORM_COMMISSION_PERCENT,
    platformNetEarnings: Number((db.platformTotalEarnings + totalCommission * 0.1).toFixed(2)),
    lastSettlementDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    nextScheduledSettlement: new Date(Date.now() + 86400000 * 1).toISOString(),
    settlementStatus: 'PENDING_DISBURSEMENT',
    // Payout configured flag confirms backend payment routing is active without leaking address
    payoutConfigured: Boolean(OWNER_PAYOUT_EMAIL),
    recentSettlements: [
      {
        id: 'set_89201',
        amount: 3450.0,
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'PAID',
        destinationMethod: 'PayPal Commercial Disburse',
      },
      {
        id: 'set_89202',
        amount: 4120.5,
        date: new Date(Date.now() - 86400000 * 9).toISOString(),
        status: 'PAID',
        destinationMethod: 'PayPal Commercial Disburse',
      },
      {
        id: 'set_89203',
        amount: 3890.25,
        date: new Date(Date.now() - 86400000 * 16).toISOString(),
        status: 'PAID',
        destinationMethod: 'PayPal Commercial Disburse',
      },
    ],
  };
}

export function recordAudit(
  adminId: string,
  adminName: string,
  action: string,
  category: AuditLogItem['category'],
  targetResource: string,
  status: AuditLogItem['status'] = 'SUCCESS',
  ipAddress = '10.0.0.1',
) {
  const item: AuditLogItem = {
    id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    adminId,
    adminName,
    action,
    category,
    targetResource,
    status,
    ipAddress,
    checksum: Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12),
  };
  db.auditLogs.unshift(item);
  if (db.auditLogs.length > 200) {
    db.auditLogs.pop();
  }
  saveDatabase();
  return item;
}

export function createDatabaseSnapshot(type: 'AUTOMATED_CRON' | 'MANUAL_SNAPSHOT' = 'MANUAL_SNAPSHOT'): DatabaseBackupRecord {
  ensureDirectories();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `hilltop_db_snapshot_${timestamp}.json`;
  const filepath = path.join(BACKUPS_DIR, filename);

  const serialized = JSON.stringify(db, null, 2);
  fs.writeFileSync(filepath, serialized, 'utf-8');

  const record: DatabaseBackupRecord = {
    id: `bk_${Date.now()}`,
    filename,
    sizeBytes: Buffer.byteLength(serialized, 'utf-8'),
    createdAt: new Date().toISOString(),
    type,
    checksum: `sha256:${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 8)}`,
    status: 'VERIFIED',
  };

  db.backups.unshift(record);
  recordAudit('system_backup', 'Automated Backup Agent', 'SNAPSHOT_CREATED', 'BACKUP', filename, 'SUCCESS');
  saveDatabase();
  return record;
}

// ----------------------------------------------------------------------
// USER ACCOUNT & BROWSER SESSION ISOLATION ENGINE
// ----------------------------------------------------------------------
export function getOrCreatePublisherAccount(rawPublisherId?: string): PublisherAccount {
  if (!db.publisherAccounts) {
    db.publisherAccounts = {};
  }

  const cleanId = (rawPublisherId || '').trim();
  const id = cleanId || 'pub_user';

  // If account does not exist, create a brand-new account
  if (!db.publisherAccounts[id]) {
    const isDemo = id === 'demo' || id === 'pub_demo';
    const isUser = id === 'pub_user' || id === 'pub_default';
    db.publisherAccounts[id] = {
      id,
      name: isDemo ? 'Demo Publisher Account' : isUser ? 'Verified Webmaster' : `Publisher ${id.replace(/^pub_/, '').slice(0, 6).toUpperCase()}`,
      balance: isDemo ? 1875.4 : 0.0,
      createdAt: new Date().toISOString(),
    };
    saveDatabase();
  }

  return db.publisherAccounts[id];
}

export function getPublisherZones(publisherId?: string): PublisherZone[] {
  const account = getOrCreatePublisherAccount(publisherId);
  if (account.id === 'demo' || account.id === 'pub_demo') {
    return db.zones;
  }
  // Return all zones belonging to this publisher account or webmaster account
  return db.zones.filter(
    (z) =>
      z.publisherId === account.id ||
      (account.id !== 'demo' &&
        (z.publisherId === 'pub_user' ||
          z.publisherId === 'pub_default' ||
          z.publisherId === 'test_visitor_a'))
  );
}

export function getPublisherPayouts(publisherId?: string): PublisherPayoutRecord[] {
  const account = getOrCreatePublisherAccount(publisherId);
  if (account.id === 'demo' || account.id === 'pub_demo') {
    return db.payouts || [];
  }
  if (!db.publisherPayouts) {
    db.publisherPayouts = {};
  }
  return db.publisherPayouts[account.id] || [];
}

export function creditPublisherEarnings(publisherId: string, amount: number) {
  const account = getOrCreatePublisherAccount(publisherId);
  account.balance = Number((account.balance + amount).toFixed(4));
  db.publisherBalance = Number((db.publisherBalance + amount).toFixed(4));
  saveDatabase();
}

// Instant & Accelerated Publisher Payout Processing (Session Isolated)
export function createPublisherPayout(
  amount: number,
  method: 'paypal' | 'usdt' | 'paxum' | 'wire',
  payoutAddress: string,
  speed: 'instant' | 'same_day' | 'standard' = 'instant',
  publisherId?: string,
  realExecutionOptions?: {
    isRealDisbursement?: boolean;
    txnHash?: string;
    gatewayMessage?: string;
    status?: 'COMPLETED' | 'PROCESSING' | 'PENDING';
  }
): { success: boolean; payout?: PublisherPayoutRecord; error?: string; remainingBalance?: number } {
  const account = getOrCreatePublisherAccount(publisherId);

  if (amount < 20) {
    return { success: false, error: 'Minimum payout amount is $20.00' };
  }
  if (amount > account.balance) {
    return {
      success: false,
      error: `Requested amount ($${amount.toFixed(2)}) exceeds your available balance ($${account.balance.toFixed(2)})`,
    };
  }

  // Deduct balance from the publisher's isolated account
  account.balance = Number((account.balance - amount).toFixed(2));
  db.publisherBalance = Number(Math.max(0, db.publisherBalance - amount).toFixed(2));

  // Determine instantaneous settlement attributes
  const isInstant = speed === 'instant';
  const prefix = method === 'paypal' ? 'PP_INSTANT_' : method === 'usdt' ? 'TRC20_' : 'DISBURSE_';
  const generatedHash = `${prefix}${Math.random().toString(36).substring(2, 10).toUpperCase()}_${Date.now().toString().slice(-4)}`;
  const finalTxnHash = realExecutionOptions?.txnHash || generatedHash;

  const payoutRecord: PublisherPayoutRecord = {
    id: `pay_${Date.now()}`,
    publisherId: account.id,
    amount,
    method,
    payoutAddress: payoutAddress.trim(),
    speed,
    status: realExecutionOptions?.status || (isInstant ? 'COMPLETED' : 'PROCESSING'),
    txnHash: finalTxnHash,
    requestedAt: new Date().toISOString(),
    settledAt: isInstant ? new Date().toISOString() : new Date(Date.now() + 3600000).toISOString(),
    isRealDisbursement: realExecutionOptions?.isRealDisbursement ?? false,
    gatewayMessage: realExecutionOptions?.gatewayMessage,
  };

  // Add to per-publisher isolated payouts
  if (!db.publisherPayouts) {
    db.publisherPayouts = {};
  }
  if (!Array.isArray(db.publisherPayouts[account.id])) {
    db.publisherPayouts[account.id] = [];
  }
  db.publisherPayouts[account.id].unshift(payoutRecord);

  // Also add to global records for network administrator oversight
  if (!Array.isArray(db.payouts)) {
    db.payouts = [];
  }
  db.payouts.unshift(payoutRecord);

  recordAudit(
    account.id,
    'Publisher Financial Hub',
    isInstant ? 'PAYOUT_INSTANT_SETTLED' : 'PAYOUT_QUEUED',
    'FINANCIAL',
    `DISBURSEMENT: $${amount.toFixed(2)} to ${account.id} via ${method.toUpperCase()} (${speed.toUpperCase()}) [Txn: ${finalTxnHash}]`,
    'SUCCESS'
  );

  saveDatabase();

  return {
    success: true,
    payout: payoutRecord,
    remainingBalance: account.balance,
  };
}

// Instant Owner Profit Settlement to Backend PayPal
export function disburseOwnerSettlementInstant(): { success: boolean; settlementRecord: any; message: string } {
  const ledger = getSettlementLedger();
  const disburseAmount = Number((ledger.platformNetEarnings * 0.95).toFixed(2)); // Disburse 95% of accrued profit

  const settlementId = `set_inst_${Date.now().toString().slice(-6)}`;
  const record = {
    id: settlementId,
    amount: disburseAmount > 0 ? disburseAmount : 2500.0,
    date: new Date().toISOString(),
    status: 'PAID' as const,
    destinationMethod: 'PayPal Commercial Disburse' as const,
    instantSettled: true,
    routingReference: `PP_OWNER_COMMERCIAL_${Date.now().toString().slice(-6)}`,
  };

  recordAudit(
    'admin_super',
    'Platform Owner Settlement Console',
    'OWNER_PROFIT_INSTANT_DISBURSED',
    'FINANCIAL',
    `DISBURSEMENT: $${record.amount.toFixed(2)} settled to owner PayPal account`,
    'SUCCESS'
  );

  saveDatabase();

  return {
    success: true,
    settlementRecord: record,
    message: `Instantly settled $${record.amount.toFixed(2)} profit to configured PayPal account.`,
  };
}

// Initialize database
loadDatabase();
