export interface Campaign {
  id: string;
  name: string;
  advertiserId: string;
  advertiserName: string;
  adFormat: 'popunder' | 'direct_link' | 'in_page_push' | 'banner' | 'video_vast';
  pricingModel: 'CPM' | 'CPC' | 'CPA';
  bid: number; // e.g. $1.80 per 1000 impressions or $0.15 per click
  dailyBudget: number;
  totalBudget: number;
  spent: number;
  targetGeos: string[]; // e.g. ['US', 'GB', 'CA', 'ALL']
  targetDevices: ('desktop' | 'mobile' | 'tablet')[];
  targetCategories: string[];
  status: 'active' | 'paused' | 'completed' | 'pending_review';
  landingUrl: string;
  adTitle?: string;
  adBody?: string;
  bannerSize?: string;
  fraudSensitivity: 'standard' | 'strict' | 'maximum';
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
}

export interface PublisherZone {
  id: string;
  publisherId: string;
  publisherName: string;
  siteUrl: string;
  zoneName: string;
  format: 'popunder' | 'direct_link' | 'in_page_push' | 'banner' | 'video_vast';
  bannerSize?: '300x250' | '728x90' | '320x50' | '160x600';
  antiAdblockEnabled: boolean;
  status: 'active' | 'paused' | 'moderation';
  impressions: number;
  clicks: number;
  eCPM: number;
  grossRevenue: number;
  publisherEarnings: number; // e.g. 75%
  platformCommission: number; // e.g. 25% to platform owner
  createdAt: string;
}

export interface AntiFraudRule {
  id: string;
  name: string;
  type: 'ip_reputation' | 'bot_user_agent' | 'click_velocity' | 'dwell_time' | 'datacenter_asn';
  enabled: boolean;
  action: 'block' | 'flag' | 'drop_bid';
  triggeredCount: number;
}

export interface FraudLogEvent {
  id: string;
  timestamp: string;
  ip: string;
  country: string;
  userAgent: string;
  zoneId: string;
  reason: string;
  score: number; // 0-100 (100 = blatant bot)
  actionTaken: 'blocked' | 'quarantined';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: string;
  category: 'SECURITY' | 'FINANCIAL' | 'CAMPAIGN' | 'BACKUP' | 'ZONE' | 'USER_ROLE';
  targetResource: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  ipAddress: string;
  checksum: string;
}

export interface TrafficHit {
  id: string;
  zoneId: string;
  zoneName?: string;
  type: 'impression' | 'click';
  referrer: string;
  sourceDomain: string;
  ipMasked: string;
  userAgentSnippet: string;
  earned: number;
  timestamp: string;
  status: 'verified';
}

export interface PlatformSettlementLedger {
  totalGrossSpend: number;
  totalPublisherPaid: number;
  totalPublisherPending: number;
  platformCommissionPercent: number;
  platformNetEarnings: number;
  lastSettlementDate: string;
  nextScheduledSettlement: string;
  settlementStatus: 'PENDING_DISBURSEMENT' | 'PROCESSING' | 'COMPLETED';
  // Note: Owner payout email is handled strictly server-side and never broadcasted to public clients
  payoutConfigured: boolean;
  recentSettlements: {
    id: string;
    amount: number;
    date: string;
    status: 'PAID' | 'QUEUED';
    destinationMethod: 'PayPal Commercial Disburse' | 'Direct ACH / Wire';
  }[];
}

export interface PublisherPayoutRecord {
  id: string;
  publisherId?: string;
  amount: number;
  method: 'paypal' | 'usdt' | 'paxum' | 'wire';
  payoutAddress: string;
  speed: 'instant' | 'same_day' | 'standard';
  status: 'COMPLETED' | 'PROCESSING' | 'PENDING';
  txnHash: string;
  requestedAt: string;
  settledAt: string;
  isRealDisbursement?: boolean;
  gatewayMessage?: string;
}

export interface PublisherAccount {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
}

export interface DatabaseBackupRecord {
  id: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
  type: 'AUTOMATED_CRON' | 'MANUAL_SNAPSHOT';
  checksum: string;
  status: 'HEALTHY' | 'VERIFIED';
}
