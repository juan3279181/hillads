export type AdFormatType = 'popunder' | 'direct_link' | 'in_page_push' | 'banner' | 'video_vast';

export interface Campaign {
  id: string;
  name: string;
  advertiserId: string;
  advertiserName: string;
  adFormat: AdFormatType;
  pricingModel: 'CPM' | 'CPC' | 'CPA';
  bid: number;
  dailyBudget: number;
  totalBudget: number;
  spent: number;
  targetGeos: string[];
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
  format: AdFormatType;
  bannerSize?: '300x250' | '728x90' | '320x50' | '160x600';
  antiAdblockEnabled: boolean;
  status: 'active' | 'paused' | 'moderation';
  impressions: number;
  clicks: number;
  eCPM: number;
  grossRevenue: number;
  publisherEarnings: number;
  platformCommission: number;
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
  score: number;
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

export interface PlatformSettlementLedger {
  totalGrossSpend: number;
  totalPublisherPaid: number;
  totalPublisherPending: number;
  platformCommissionPercent: number;
  platformNetEarnings: number;
  lastSettlementDate: string;
  nextScheduledSettlement: string;
  settlementStatus: 'PENDING_DISBURSEMENT' | 'PROCESSING' | 'COMPLETED';
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

export interface PlatformOverviewStats {
  totalImpressions: number;
  totalClicks: number;
  ctr: number;
  grossRevenue: number;
  publisherEarnings: number;
  platformNetProfit: number;
  activeCampaigns: number;
  activeZones: number;
  trafficQualityScore: number;
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

export type ActiveAppView = 'landing' | 'advertiser' | 'publisher' | 'admin' | 'api_docs' | 'sandbox';
