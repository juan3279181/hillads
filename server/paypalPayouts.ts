import 'dotenv/config';

/**
 * Real PayPal Payouts Integration
 * Connects directly to PayPal's REST Payouts API v1 to disburse real funds to publisher accounts.
 */

export interface PayPalPayoutResult {
  configured: boolean;
  success: boolean;
  payoutBatchId?: string;
  batchStatus?: string;
  message: string;
  error?: string;
  details?: any;
}

export function isPayPalConfigured(): boolean {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return Boolean(clientId && clientId.trim() && clientSecret && clientSecret.trim());
}

export function getPayPalEnvironment(): 'live' | 'sandbox' {
  const env = (process.env.PAYPAL_ENVIRONMENT || '').toLowerCase().trim();
  return env === 'live' ? 'live' : 'sandbox';
}

function getPayPalBaseUrl(): string {
  return getPayPalEnvironment() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

/**
 * Retrieves an OAuth2 Bearer Access Token from PayPal
 */
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

    // If configured as 'live' but rejected as invalid_client, verify if these are actually Sandbox credentials
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
              'SANDBOX_KEYS_IN_LIVE_MODE: Your PayPal Client ID and Secret belong to PayPal Sandbox (test mode), but PAYPAL_ENVIRONMENT is set to live. PayPal Live rejected them. In developer.paypal.com, switch the top toggle to "Live" to generate Live credentials for real money, or set PAYPAL_ENVIRONMENT=sandbox to test.',
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

export function getPayPalGatewayStatus() {
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

/**
 * Disburses real money to a recipient's PayPal email using the Payouts REST API
 */
export async function executeRealPayPalPayout(
  recipientEmail: string,
  amount: number,
  note = 'Publisher monetization earnings'
): Promise<PayPalPayoutResult> {
  if (!isPayPalConfigured()) {
    return {
      configured: false,
      success: false,
      message:
        'PayPal API credentials (PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET) are not configured in your application environment. To disburse real money, add these credentials in your Settings.',
    };
  }

  const { token, error: tokenError } = await getPayPalAccessToken();
  if (!token || tokenError) {
    return {
      configured: true,
      success: false,
      error: tokenError,
      message: `PayPal authentication failed: ${tokenError}. Please verify your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.`,
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
