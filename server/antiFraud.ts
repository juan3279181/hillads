import { getDb, saveDatabase, recordAudit } from './db';
import { FraudLogEvent } from './types';

// IP ranges and bot user-agent signatures
const KNOWN_BOT_AGENTS = [
  'headless',
  'puppeteer',
  'playwright',
  'selenium',
  'python-urllib',
  'curl/',
  'wget',
  'scrapy',
  'httpclient',
  'go-http-client',
  'phantomjs',
];

const KNOWN_DATACENTER_IP_PREFIXES = [
  '54.210.',
  '52.90.',
  '185.220.',
  '45.154.',
  '194.26.',
];

// In-memory velocity map: ip -> last timestamp
const clickVelocityTracker = new Map<string, number[]>();

export interface FraudInspectionResult {
  isFraud: boolean;
  score: number; // 0 - 100
  reason: string;
  action: 'allow' | 'quarantine' | 'block';
}

export function inspectTraffic(
  ip: string,
  userAgent: string,
  zoneId: string,
  referrer: string = ''
): FraudInspectionResult {
  const db = getDb();
  let fraudScore = 0;
  const reasons: string[] = [];

  const uaLower = (userAgent || '').toLowerCase();

  // 1. User Agent checks
  const ruleUa = db.fraudRules.find((r) => r.type === 'bot_user_agent' && r.enabled);
  if (ruleUa) {
    for (const botSignature of KNOWN_BOT_AGENTS) {
      if (uaLower.includes(botSignature)) {
        fraudScore += 85;
        reasons.push(`Detected headless/automated user-agent (${botSignature})`);
        ruleUa.triggeredCount++;
        break;
      }
    }
  }

  // 2. Data center IP & Tor checks
  const ruleAsn = db.fraudRules.find((r) => r.type === 'datacenter_asn' && r.enabled);
  if (ruleAsn) {
    for (const prefix of KNOWN_DATACENTER_IP_PREFIXES) {
      if (ip.startsWith(prefix)) {
        fraudScore += 75;
        reasons.push(`Non-residential data center or Tor IP address (${prefix}*)`);
        ruleAsn.triggeredCount++;
        break;
      }
    }
  }

  // 3. Click Velocity Tracking
  const ruleVelocity = db.fraudRules.find((r) => r.type === 'click_velocity' && r.enabled);
  if (ruleVelocity) {
    const now = Date.now();
    const timestamps = clickVelocityTracker.get(ip) || [];
    // Keep timestamps from last 10 seconds
    const recent = timestamps.filter((t) => now - t < 10000);
    recent.push(now);
    clickVelocityTracker.set(ip, recent);

    if (recent.length > 5) {
      fraudScore += 65;
      reasons.push(`High-frequency click rate: ${recent.length} requests in <10s`);
      ruleVelocity.triggeredCount++;
    }
  }

  // 4. Missing User-Agent or Referrer anomaly
  if (!userAgent || userAgent.length < 15) {
    fraudScore += 45;
    reasons.push('Anomalous or blank User-Agent header');
  }

  // Determine final status
  let action: 'allow' | 'quarantine' | 'block' = 'allow';
  let isFraud = false;

  if (fraudScore >= 70) {
    isFraud = true;
    action = 'block';
  } else if (fraudScore >= 40) {
    isFraud = true;
    action = 'quarantine';
  }

  // If flagged as fraud, record log
  if (isFraud) {
    const logItem: FraudLogEvent = {
      id: `fl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ip,
      country: 'US', // default or geo-lookup
      userAgent: userAgent.slice(0, 100),
      zoneId,
      reason: reasons.join('; ') || 'Heuristic traffic anomaly detected',
      score: Math.min(100, fraudScore),
      actionTaken: action === 'block' ? 'blocked' : 'quarantined',
    };
    db.fraudLogs.unshift(logItem);
    if (db.fraudLogs.length > 300) {
      db.fraudLogs.pop();
    }
    saveDatabase();
  }

  return {
    isFraud,
    score: Math.min(100, fraudScore),
    reason: reasons.join('; ') || 'Traffic verified genuine',
    action,
  };
}
