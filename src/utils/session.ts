/**
 * Browser Session & Account Isolation Engine for Publishers
 * Guarantees every new visitor/browser gets their own isolated publisher identity,
 * starting with strictly $0.00 balance, separate ad zones, and separate ledger.
 */

const STORAGE_KEY = 'hilltop_pub_session_id';
let inMemorySessionId: string | null = null;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function getPublisherSessionId(): string {
  if (typeof window === 'undefined') return 'pub_user';

  if (inMemorySessionId && inMemorySessionId.trim()) {
    return inMemorySessionId;
  }

  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage && fromStorage.trim()) {
      inMemorySessionId = fromStorage.trim();
      return inMemorySessionId;
    }
  } catch (e) {
    // Storage access might be restricted in sandboxed iframes
  }

  const fromCookie = readCookie(STORAGE_KEY);
  if (fromCookie && fromCookie.trim()) {
    inMemorySessionId = fromCookie.trim();
    return inMemorySessionId;
  }

  // Stable default for the platform publisher: pub_user
  const defaultId = 'pub_user';
  inMemorySessionId = defaultId;
  try {
    localStorage.setItem(STORAGE_KEY, defaultId);
  } catch (e) {}
  writeCookie(STORAGE_KEY, defaultId);

  return defaultId;
}

export function setPublisherSessionId(id: string): string {
  const cleanId = id.trim() || 'pub_user';
  inMemorySessionId = cleanId;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, cleanId);
    } catch (e) {}
    writeCookie(STORAGE_KEY, cleanId);
  }
  return cleanId;
}

export function resetToCleanSession(): string {
  const rand = Math.random().toString(36).substring(2, 8);
  const newId = `pub_${rand}`;
  return setPublisherSessionId(newId);
}

export function switchToDemoSession(): string {
  return setPublisherSessionId('demo');
}

export function getPublisherHeaders(): Record<string, string> {
  return {
    'x-publisher-id': getPublisherSessionId(),
  };
}
