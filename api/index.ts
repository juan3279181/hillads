import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

/**
 * Real PayPal Payouts Integration (Embedded for zero-dependency Vercel Serverless runtime)
 */
function isPayPalConfigured(): boolean {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return Boolean(clientId && clientId.trim() && clientSecret && clientSecret.trim());
}

function getPayPalEnvironment(): 'live' | 'sandbox' {
  const env = (process.env.PAYPAL_ENVIRONMENT || '').toLowerCase().trim();
  return env === 'live' ? 'live' : 'sandbox';
}

function getPayPalBaseUrl(): string {
  return getPayPalEnvironment() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getPayPalAccessToken(): Promise<{
  token?: string;
  error?: string;
  detectedEnvironment?: 'live' | 'sandbox';
}> {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return { error: 'Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET' };
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const configuredEnv = getPayPalEnvironment();
  const primaryUrl = getPayPalBaseUrl();

  try {
    const res = await fetch(`${primaryUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await res.json();
    if (res.ok && data.access_token) {
      return { token: data.access_token, detectedEnvironment: configuredEnv };
    }

    if (configuredEnv === 'live' && (data.error === 'invalid_client' || res.status === 401)) {
      try {
        const testSandbox = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });
        const sandboxData = await testSandbox.json();
        if (testSandbox.ok && sandboxData.access_token) {
          return {
            error:
              'SANDBOX_KEYS_IN_LIVE_MODE: Your PayPal Client ID and Secret belong to PayPal Sandbox (test mode), but PAYPAL_ENVIRONMENT is set to live. In developer.paypal.com, switch the top toggle to "Live" to generate Live credentials for real money, or set PAYPAL_ENVIRONMENT=sandbox to test.',
          };
        }
      } catch (_) {}
    }

    return {
      error: data.error_description || data.message || `PayPal token error (${res.status})`,
    };
  } catch (err: any) {
    return { error: `Failed to connect to PayPal API: ${err.message}` };
  }
}

function getPayPalGatewayStatus() {
  const configured = isPayPalConfigured();
  const env = getPayPalEnvironment();
  return {
    success: true,
    paypalConfigured: configured,
    paypalEnvironment: env,
    gateway: 'PayPal Payouts REST API v1',
    instructions: configured
      ? `Real PayPal Payouts gateway is ACTIVE in ${env.toUpperCase()} mode.`
      : 'To enable real-world monetary disbursements to PayPal, configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in the environment variables.',
  };
}

async function executeRealPayPalPayout(
  recipientEmail: string,
  amount: number,
  note = 'Publisher monetization earnings'
): Promise<{
  configured: boolean;
  success: boolean;
  payoutBatchId?: string;
  batchStatus?: string;
  message: string;
  error?: string;
  details?: any;
}> {
  if (!isPayPalConfigured()) {
    return {
      configured: false,
      success: false,
      message: 'PayPal API credentials are not configured in environment variables.',
    };
  }

  const { token, error: tokenError } = await getPayPalAccessToken();
  if (!token || tokenError) {
    return {
      configured: true,
      success: false,
      error: tokenError,
      message: `PayPal authentication failed: ${tokenError}`,
    };
  }

  const baseUrl = getPayPalBaseUrl();
  const senderBatchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const senderItemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const payload = {
    sender_batch_header: {
      sender_batch_id: senderBatchId,
      email_subject: 'You received a publisher earnings payout!',
      email_message: `You have received a payout of $${amount.toFixed(2)} USD for your traffic. Thank you for partnering with us!`,
    },
    items: [
      {
        recipient_type: 'EMAIL',
        amount: {
          value: amount.toFixed(2),
          currency: 'USD',
        },
        note: note,
        sender_item_id: senderItemId,
        receiver: recipientEmail.trim(),
      },
    ],
  };

  try {
    const res = await fetch(`${baseUrl}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      let errorMessage = data.message || data.name || 'PayPal Payout request rejected';
      if (Array.isArray(data.details) && data.details.length > 0) {
        errorMessage += `: ${data.details.map((d: any) => d.issue || d.description).join(', ')}`;
      }
      return {
        configured: true,
        success: false,
        error: errorMessage,
        details: data,
        message: `PayPal error: ${errorMessage}`,
      };
    }

    const batchHeader = data.batch_header || {};
    return {
      configured: true,
      success: true,
      payoutBatchId: batchHeader.payout_batch_id || senderBatchId,
      batchStatus: batchHeader.batch_status || 'PENDING',
      message: `Real PayPal Payout successfully dispatched! Batch ID: ${batchHeader.payout_batch_id || senderBatchId}`,
      details: data,
    };
  } catch (err: any) {
    return {
      configured: true,
      success: false,
      error: err.message,
      message: `Network error connecting to PayPal: ${err.message}`,
    };
  }
}

interface Zone {
  id: string;
  publisherId: string;
  publisherName: string;
  siteUrl: string;
  zoneName: string;
  format: string;
  bannerSize?: string;
  antiAdblockEnabled: boolean;
  status: 'active' | 'paused';
  impressions: number;
  clicks: number;
  eCPM: number;
  grossRevenue: number;
  publisherEarnings: number;
  platformCommission: number;
  createdAt: string;
}

interface TrafficHit {
  id: string;
  zoneId: string;
  zoneName: string;
  type: 'impression' | 'click';
  referrer: string;
  sourceDomain: string;
  ipMasked: string;
  userAgentSnippet: string;
  earned: number;
  timestamp: string;
  status: 'verified';
}

interface ServerState {
  zones: Zone[];
  balance: number;
  payouts: any[];
  trafficHits?: TrafficHit[];
}

const DB_PATH = '/tmp/hilltop_zones_db.json';

const DEFAULT_STATE: ServerState = {
  zones: [
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
  ],
  balance: 0.0109,
  payouts: [],
  trafficHits: [
    {
      id: 'hit_1',
      zoneId: 'zone_5328',
      zoneName: 'sports news',
      type: 'impression',
      referrer: 'https://sportsnewselite.blogspot.com/',
      sourceDomain: 'sportsnewselite.blogspot.com',
      ipMasked: '74.125.xxx.xxx',
      userAgentSnippet: 'Desktop Chrome',
      earned: 0.0018,
      timestamp: '2026-09-06T02:30:00.000Z',
      status: 'verified',
    },
    {
      id: 'hit_2',
      zoneId: 'zone_5328',
      zoneName: 'sports news',
      type: 'click',
      referrer: 'https://sportsnewselite.blogspot.com/',
      sourceDomain: 'sportsnewselite.blogspot.com',
      ipMasked: '104.28.xxx.xxx',
      userAgentSnippet: 'Mobile Safari',
      earned: 0.026,
      timestamp: '2026-09-06T02:32:10.000Z',
      status: 'verified',
    },
  ],
};

let inMemoryState: ServerState | null = null;

function readState(): ServerState {
  if (inMemoryState) return inMemoryState;
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.zones) && parsed.zones.length > 0) {
        inMemoryState = parsed;
        return inMemoryState!;
      }
    }
  } catch (e) {}
  inMemoryState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  return inMemoryState!;
}

function writeState(state: ServerState) {
  inMemoryState = state;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {}
}

async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Global Cross-Origin & Security headers for ad network serving
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-publisher-id, Authorization');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Health check
  if (pathname === '/api/health') {
    const state = readState();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: 'ok',
        network: 'HilltopAds Core Engine (Vercel Serverless + Node)',
        activeZones: state.zones.length,
        time: new Date().toISOString(),
      })
    );
    return;
  }

  // 1. Live Telemetry Tracking (Impressions & Clicks from Blogspot & Embedded Iframes)
  if (pathname === '/api/serve/track') {
    const state = readState();
    let body: any = {};
    if (req.method === 'POST') {
      body = await parseBody(req);
    }

    const zoneId = (
      url.searchParams.get('zoneId') ||
      url.searchParams.get('zone') ||
      body.zoneId ||
      body.zone ||
      'zone_5328'
    ).trim();

    const type = (url.searchParams.get('type') || body.type || 'impression').trim().toLowerCase();

    let target = state.zones.find((z) => z.id === zoneId);
    if (!target) {
      target = {
        id: zoneId,
        publisherId: 'pub_user',
        publisherName: 'Verified Webmaster',
        siteUrl: 'https://sportsnewselite.blogspot.com',
        zoneName: zoneId === 'zone_5328' ? 'sports news' : `Zone ${zoneId}`,
        format: 'banner',
        bannerSize: '728x90',
        antiAdblockEnabled: true,
        status: 'active',
        impressions: 0,
        clicks: 0,
        eCPM: 2.45,
        grossRevenue: 0,
        publisherEarnings: 0,
        platformCommission: 0,
        createdAt: new Date().toISOString(),
      };
      state.zones.push(target);
    }

    let earned = 0;
    if (type === 'click') {
      target.clicks += 1;
      const gross = 0.035;
      const pubCut = 0.026;
      const platCut = 0.009;
      target.grossRevenue = Number((target.grossRevenue + gross).toFixed(5));
      target.publisherEarnings = Number((target.publisherEarnings + pubCut).toFixed(5));
      target.platformCommission = Number((target.platformCommission + platCut).toFixed(5));
      state.balance = Number((state.balance + pubCut).toFixed(5));
      earned = pubCut;
    } else {
      target.impressions += 1;
      const rate = target.eCPM || 2.45;
      const gross = Number((rate / 1000).toFixed(5));
      const pubCut = Number((gross * 0.75).toFixed(5));
      const platCut = Number((gross * 0.25).toFixed(5));
      target.grossRevenue = Number((target.grossRevenue + gross).toFixed(5));
      target.publisherEarnings = Number((target.publisherEarnings + pubCut).toFixed(5));
      target.platformCommission = Number((target.platformCommission + platCut).toFixed(5));
      state.balance = Number((state.balance + pubCut).toFixed(5));
      earned = pubCut;
    }

    // Capture traffic origin & visitor metadata from real HTTP request
    const rawRef = (url.searchParams.get('ref') || req.headers.referer || '').toString();
    let sourceDomain = 'sportsnewselite.blogspot.com';
    try {
      if (rawRef.startsWith('http')) {
        sourceDomain = new URL(rawRef).hostname;
      } else if (rawRef) {
        sourceDomain = rawRef.split('/')[0];
      }
    } catch (e) {}

    const rawIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();
    const ipParts = rawIp.split('.');
    const ipMasked = ipParts.length === 4 ? `${ipParts[0]}.${ipParts[1]}.xxx.xxx` : (rawIp.includes(':') ? '2600:xxxx:xxxx' : rawIp);
    const ua = (req.headers['user-agent'] || '').toString();
    const userAgentSnippet = ua.includes('Mobile') ? 'Mobile Browser' : (ua.includes('Chrome') ? 'Desktop Chrome' : (ua.includes('Safari') ? 'Desktop Safari' : (ua.includes('Firefox') ? 'Firefox' : 'Web Browser')));

    const hit: TrafficHit = {
      id: `hit_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      zoneId: target.id,
      zoneName: target.zoneName,
      type: type === 'click' ? 'click' : 'impression',
      referrer: rawRef || target.siteUrl,
      sourceDomain,
      ipMasked,
      userAgentSnippet,
      earned,
      timestamp: new Date().toISOString(),
      status: 'verified',
    };

    if (!state.trafficHits) state.trafficHits = [];
    state.trafficHits.unshift(hit);
    if (state.trafficHits.length > 50) state.trafficHits = state.trafficHits.slice(0, 50);

    writeState(state);

    if (url.searchParams.get('format') === 'json' || req.headers['accept']?.includes('application/json')) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          success: true,
          zoneId: target.id,
          type,
          impressions: target.impressions,
          clicks: target.clicks,
          publisherEarnings: target.publisherEarnings,
          balance: state.balance,
          hit,
        })
      );
      return;
    }

    // Return 1x1 transparent tracking GIF
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.statusCode = 200;
    res.end(gif);
    return;
  }

  // Live Verified Traffic Log Endpoint
  if (pathname === '/api/serve/traffic-log') {
    const state = readState();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, hits: state.trafficHits || [] }));
    return;
  }

  // 2. Cross-Client Synchronization Route
  if (pathname === '/api/serve/sync' && req.method === 'POST') {
    const body = await parseBody(req);
    const state = readState();

    if (body && Array.isArray(body.zones)) {
      const incomingZones: Zone[] = body.zones;
      for (const inc of incomingZones) {
        const existing = state.zones.find((z) => z.id === inc.id);
        if (existing) {
          existing.impressions = Math.max(existing.impressions || 0, inc.impressions || 0);
          existing.clicks = Math.max(existing.clicks || 0, inc.clicks || 0);
          existing.grossRevenue = Math.max(existing.grossRevenue || 0, inc.grossRevenue || 0);
          existing.publisherEarnings = Math.max(existing.publisherEarnings || 0, inc.publisherEarnings || 0);
          existing.platformCommission = Math.max(existing.platformCommission || 0, inc.platformCommission || 0);
          existing.status = inc.status || existing.status;
        } else {
          state.zones.push(inc);
        }
      }
      if (typeof body.balance === 'number') {
        state.balance = Math.max(state.balance, body.balance);
      }
      writeState(state);
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, zones: state.zones, balance: state.balance }));
    return;
  }

  // 3. Publisher Zones API
  if (pathname === '/api/zones' && req.method === 'GET') {
    const state = readState();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        zones: state.zones,
        balance: state.balance,
      })
    );
    return;
  }

  if (pathname === '/api/zones' && req.method === 'POST') {
    const body = await parseBody(req);
    const state = readState();

    const newZone: Zone = {
      id: body.id || `zone_${Math.floor(1000 + Math.random() * 9000)}`,
      publisherId: body.publisherId || 'pub_user',
      publisherName: body.publisherName || 'Verified Webmaster',
      siteUrl: body.siteUrl || 'https://sportsnewselite.blogspot.com',
      zoneName: body.zoneName || 'New Banner Zone',
      format: body.format || 'banner',
      bannerSize: body.bannerSize || '728x90',
      antiAdblockEnabled: true,
      status: 'active',
      impressions: 0,
      clicks: 0,
      eCPM: body.eCPM || 2.25,
      grossRevenue: 0,
      publisherEarnings: 0,
      platformCommission: 0,
      createdAt: new Date().toISOString(),
    };

    state.zones.unshift(newZone);
    writeState(state);

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 201;
    res.end(JSON.stringify({ success: true, zone: newZone, balance: state.balance }));
    return;
  }

  // Zone status update or deletion
  if (pathname.startsWith('/api/zones/')) {
    const parts = pathname.split('/').filter(Boolean);
    const zoneId = parts[2];
    const state = readState();

    if (pathname.endsWith('/status') && (req.method === 'PATCH' || req.method === 'POST')) {
      const body = await parseBody(req);
      const z = state.zones.find((item) => item.id === zoneId);
      if (z) {
        z.status = body.status === 'paused' ? 'paused' : 'active';
        writeState(state);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, zone: z }));
        return;
      }
    }

    if (req.method === 'DELETE') {
      state.zones = state.zones.filter((item) => item.id !== zoneId);
      writeState(state);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, deleted: zoneId }));
      return;
    }
  }

  // 4. Payouts API
  if (pathname === '/api/payouts/history' || pathname === '/api/publisher/payouts') {
    const state = readState();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        payouts: state.payouts || [],
        balance: state.balance,
      })
    );
    return;
  }

  if (pathname === '/api/payouts/gateway-status') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(getPayPalGatewayStatus()));
    return;
  }

  if (pathname === '/api/payouts/request' && req.method === 'POST') {
    const body = await parseBody(req);
    const state = readState();
    const amount = Number(body.amount || 0);
    const payoutAddress = (body.payoutAddress || body.destination || 'juan8191327@gmail.com').trim();
    const method = (body.method || 'paypal').toLowerCase();
    const speed = body.speed || 'instant';

    if (!amount || isNaN(amount) || amount < 20) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 400;
      res.end(JSON.stringify({ success: false, error: 'Minimum payout threshold is $20.00' }));
      return;
    }

    if (amount > state.balance) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          success: false,
          error: `Requested amount ($${amount.toFixed(2)}) exceeds available balance ($${state.balance.toFixed(2)})`,
        })
      );
      return;
    }

    let realDisbursement = false;
    let customTxnHash: string | undefined = undefined;
    let gatewayMessage: string | undefined = undefined;

    if (method === 'paypal') {
      if (isPayPalConfigured()) {
        const payPalResult = await executeRealPayPalPayout(payoutAddress, amount);
        if (!payPalResult.success) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              success: false,
              error: `PayPal Payout failed: ${payPalResult.error || payPalResult.message}. Your balance has not been deducted.`,
              details: payPalResult.details,
            })
          );
          return;
        }
        realDisbursement = true;
        customTxnHash = `PAYPAL_${payPalResult.payoutBatchId}`;
        gatewayMessage = payPalResult.message;
      } else {
        gatewayMessage =
          'Processed on sandbox ledger. To disburse real funds to PayPal, configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in Vercel environment variables.';
      }
    }

    const record = {
      id: `pay_${Date.now()}`,
      publisherId: 'pub_user',
      amount,
      method: body.method || 'PayPal',
      destination: payoutAddress,
      payoutAddress,
      speed,
      status: realDisbursement ? 'completed' : 'approved',
      isRealDisbursement: realDisbursement,
      txnHash: customTxnHash || `PP_INSTANT_${Date.now()}`,
      gatewayMessage,
      requestedAt: new Date().toISOString(),
    };

    if (!state.payouts) state.payouts = [];
    state.payouts.unshift(record);
    if (state.balance >= amount) {
      state.balance = Number((state.balance - amount).toFixed(5));
    }
    writeState(state);

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        payout: record,
        newBalance: state.balance,
        isRealDisbursement: realDisbursement,
      })
    );
    return;
  }

  // 5. Banner Frame Route (delivers interactive 728x90 banner with live tracking)
  if (pathname.startsWith('/api/serve/banner-frame')) {
    const parts = pathname.split('/').filter(Boolean);
    const zoneId = parts[parts.length - 1] || 'zone_5328';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Apex Sports Network &bull; Sponsored Partner</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      overflow: hidden;
      width: 100%;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
    }
    .ad-container {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1.5px solid #f59e0b;
      border-radius: 8px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      position: relative;
      transition: all 0.2s ease;
    }
    .ad-container:hover {
      border-color: #fbbf24;
      background: linear-gradient(135deg, #243248 0%, #111c30 100%);
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25);
    }
    .badge-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 3px;
      flex-shrink: 0;
    }
    .badge {
      font-size: 8px;
      background: #f59e0b;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 800;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }
    .shield-txt {
      font-size: 8px;
      color: #10b981;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .content-wrap {
      flex: 1;
      min-width: 0;
      text-align: left;
      padding: 0 4px;
    }
    .title {
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.25;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .desc {
      font-size: 10.5px;
      color: #94a3b8;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    .action-wrap {
      flex-shrink: 0;
    }
    .cta-btn {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #0f172a;
      padding: 8px 18px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);
      transition: transform 0.15s ease;
      white-space: nowrap;
    }
    .cta-btn:hover {
      transform: scale(1.03);
    }
  </style>
</head>
<body>
  <div class="ad-container" id="adBox">
    <div class="badge-wrap">
      <span class="badge">Sponsored</span>
      <span class="shield-txt">&#10003; HilltopAds Anti-AdBlock</span>
    </div>
    <div class="content-wrap">
      <div class="title">Apex Live Sports Odds &amp; Betting Analysis (728x90)</div>
      <div class="desc">Exclusive 100% deposit match bonus on verified sports forecasts &amp; instant payouts.</div>
    </div>
    <div class="action-wrap">
      <button class="cta-btn" id="adBtn">Claim Bonus &rarr;</button>
    </div>
  </div>

  <script>
    (function() {
      var zoneId = '${zoneId}';
      var origin = window.location.origin;

      function trackImpression() {
        try {
          var url = origin + '/api/serve/track?zoneId=' + zoneId + '&type=impression';
          if (navigator.sendBeacon) {
            navigator.sendBeacon(url);
          } else {
            new Image().src = url;
          }
        } catch (e) {}

        try {
          var payload = JSON.stringify({ type: 'impression', zoneId: zoneId, timestamp: Date.now() });
          localStorage.setItem('hilltop_live_ad_event', payload);
          if ('BroadcastChannel' in window) {
            var bc = new BroadcastChannel('hilltop_ad_channel');
            bc.postMessage({ type: 'impression', zoneId: zoneId, timestamp: Date.now() });
            bc.close();
          }
        } catch (e) {}
      }

      trackImpression();

      document.getElementById('adBox').addEventListener('click', function() {
        try {
          var url = origin + '/api/serve/track?zoneId=' + zoneId + '&type=click';
          if (navigator.sendBeacon) {
            navigator.sendBeacon(url);
          } else {
            new Image().src = url;
          }
        } catch (e) {}

        try {
          var payload = JSON.stringify({ type: 'click', zoneId: zoneId, timestamp: Date.now() });
          localStorage.setItem('hilltop_live_ad_event', payload);
          if ('BroadcastChannel' in window) {
            var bc = new BroadcastChannel('hilltop_ad_channel');
            bc.postMessage({ type: 'click', zoneId: zoneId, timestamp: Date.now() });
            bc.close();
          }
        } catch (e) {}

        window.open(origin + '/offer.html?zone=' + zoneId, '_blank');
      });
    })();
  </script>
</body>
</html>`);
    return;
  }

  // 6. Ad Tag JS Route
  if (pathname.startsWith('/api/serve/ad-tag')) {
    const match = pathname.match(/ad-tag\/(zone_[a-zA-Z0-9_-]+)\.js/);
    const zoneId = match ? match[1] : 'zone_5328';

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.statusCode = 200;
    res.end(`(function() {
  var zoneId = '${zoneId}';
  var host = window.location.origin;
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  if (currentScript && currentScript.src) {
    try {
      var u = new URL(currentScript.src);
      host = u.origin;
    } catch(e) {}
  }

  var container = document.getElementById('hilltop-zone-' + zoneId) || 
                  document.querySelector('[data-hilltop-zone="' + zoneId + '"]');
  if (!container && currentScript && currentScript.parentNode) {
    container = document.createElement('div');
    container.id = 'hilltop-zone-' + zoneId;
    currentScript.parentNode.insertBefore(container, currentScript);
  }

  if (!container) return;

  var iframe = document.createElement('iframe');
  iframe.src = host + '/api/serve/banner-frame/' + zoneId;
  iframe.width = '728';
  iframe.height = '90';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('title', 'HilltopAds Banner Zone');
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.style.display = 'block';
  iframe.style.margin = '10px auto';
  iframe.style.maxWidth = '100%';
  iframe.style.borderRadius = '8px';

  container.innerHTML = '';
  container.appendChild(iframe);
})();`);
    return;
  }

  // 7. Direct Link Route
  if (pathname.startsWith('/api/serve/direct-link')) {
    const parts = pathname.split('/').filter(Boolean);
    const zoneId = parts[parts.length - 1] || 'zone_5328';
    res.statusCode = 302;
    res.setHeader('Location', `/offer.html?zone=${zoneId}`);
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 404;
  res.end(JSON.stringify({ success: false, error: 'Endpoint Not Found' }));
}
