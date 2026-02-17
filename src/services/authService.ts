import 'react-native-get-random-values';
import * as Keychain from 'react-native-keychain';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { Platform } from 'react-native';
import { PlexPin, PlexUser, PlexProfile, PlexServer, PlexResource, PlexConnection } from '../types';

const PLEX_API_BASE = 'https://plex.tv/api/v2';
const APP_NAME = 'Tru Photos';
const APP_VERSION = '1.0.0';

// Secure storage keys
const STORAGE_KEYS = {
  CLIENT_ID: 'plex_client_id',
  AUTH_TOKEN: 'plex_auth_token',
  USER: 'plex_user',
  SELECTED_PROFILE: 'plex_selected_profile',
  SELECTED_SERVER: 'plex_selected_server',
};

// Service name for keychain
const KEYCHAIN_SERVICE = 'com.truphotos';

// Helper functions for secure storage using react-native-keychain
async function getSecureItem(key: string): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: `${KEYCHAIN_SERVICE}.${key}` });
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch {
    return null;
  }
}

async function setSecureItem(key: string, value: string): Promise<void> {
  await Keychain.setGenericPassword(key, value, { service: `${KEYCHAIN_SERVICE}.${key}` });
}

async function removeSecureItem(key: string): Promise<void> {
  await Keychain.resetGenericPassword({ service: `${KEYCHAIN_SERVICE}.${key}` });
}

// Generate UUID v4 using crypto.getRandomValues (polyfilled by react-native-get-random-values)
function generateUUID(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Set version (4) and variant (RFC4122)
  // eslint-disable-next-line no-bitwise
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // eslint-disable-next-line no-bitwise
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Get or generate client identifier
export async function getClientIdentifier(): Promise<string> {
  let clientId = await getSecureItem(STORAGE_KEYS.CLIENT_ID);
  if (!clientId) {
    clientId = generateUUID();
    await setSecureItem(STORAGE_KEYS.CLIENT_ID, clientId);
  }
  return clientId;
}

// Build standard Plex headers
async function getPlexHeaders(authToken?: string | null): Promise<Record<string, string>> {
  const clientId = await getClientIdentifier();

  // Detect platform dynamically
  const platform = Platform.OS === 'ios' ? 'iOS' : 'Android';
  const platformVersion = Platform.Version?.toString() || '14';

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Plex-Product': APP_NAME,
    'X-Plex-Version': APP_VERSION,
    'X-Plex-Client-Identifier': clientId,
    'X-Plex-Platform': platform,
    'X-Plex-Platform-Version': platformVersion,
    'X-Plex-Device': 'Mobile',
    'X-Plex-Device-Name': APP_NAME,
  };
  if (authToken) {
    headers['X-Plex-Token'] = authToken;
  }
  return headers;
}

// Create a new PIN for authentication
export async function createPin(): Promise<PlexPin> {
  const headers = await getPlexHeaders();

  const response = await fetch(`${PLEX_API_BASE}/pins?strong=true`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Plex Auth: Failed to create PIN:', response.status, errorText);
    throw new Error(`Failed to create PIN: ${response.status}`);
  }

  const pin = await response.json();
  return pin;
}

// Check if PIN has been authorized
export async function checkPin(pinId: number): Promise<PlexPin> {
  const headers = await getPlexHeaders();
  const response = await fetch(`${PLEX_API_BASE}/pins/${pinId}`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to check PIN: ${response.status}`);
  }
  return response.json();
}

// Browser result type for compatibility
export interface BrowserResult {
  type: 'cancel' | 'dismiss' | 'success';
}

// Open browser for Plex authentication
export async function openPlexAuth(pinCode: string): Promise<BrowserResult> {
  const clientId = await getClientIdentifier();

  // Build auth URL with proper encoding per Plex documentation
  // context[device][product] must be encoded as context%5Bdevice%5D%5Bproduct%5D
  const params = new URLSearchParams({
    clientID: clientId,
    code: pinCode,
    'context[device][product]': APP_NAME,
  });

  const authUrl = `https://app.plex.tv/auth#?${params.toString()}`;

  try {
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(authUrl, {
        // iOS options
        dismissButtonStyle: 'close',
        preferredBarTintColor: '#1a1a2e',
        preferredControlTintColor: 'white',
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android options
        showTitle: true,
        toolbarColor: '#1a1a2e',
        secondaryToolbarColor: 'black',
        navigationBarColor: 'black',
        navigationBarDividerColor: 'white',
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        forceCloseOnRedirection: false,
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
      });
      return { type: result.type === 'cancel' ? 'cancel' : 'dismiss' };
    } else {
      // Fallback: open in external browser
      const { Linking } = require('react-native');
      await Linking.openURL(authUrl);
      return { type: 'dismiss' };
    }
  } catch {
    return { type: 'cancel' };
  }
}

// Get user info with auth token
export async function getUser(authToken: string): Promise<PlexUser> {
  const headers = await getPlexHeaders(authToken);
  const response = await fetch(`${PLEX_API_BASE}/user`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to get user: ${response.status}`);
  }
  return response.json();
}

// Get user's Plex resources (servers)
export async function getResources(authToken: string): Promise<PlexResource[]> {
  const headers = await getPlexHeaders(authToken);
  const response = await fetch(`${PLEX_API_BASE}/resources?includeHttps=1&includeRelay=1`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to get resources: ${response.status}`);
  }
  return response.json();
}

// Convert PlexResource to PlexServer
export function resourceToServer(resource: PlexResource): PlexServer | null {
  if (resource.provides !== 'server') return null;
  const connections = resource.connections || [];
  if (connections.length === 0) return null;

  // Sort connections: remote (non-local) first, then local
  // This helps with Android emulator which can't reach local IPs
  const sortedConnections = [...connections].sort((a, b) => {
    if (a.local === b.local) return 0;
    return a.local ? 1 : -1; // non-local first
  });

  const bestConnection = sortedConnections[0];

  // Build list of all connection URIs, remote first
  const connectionUris = sortedConnections.map((c: PlexConnection) => c.uri);

  return {
    name: resource.name,
    address: bestConnection.address,
    port: bestConnection.port,
    version: resource.productVersion || '',
    scheme: bestConnection.protocol,
    host: bestConnection.address,
    localAddresses: connections
      .filter((c: PlexConnection) => c.local)
      .map((c: PlexConnection) => c.address)
      .join(',') || '',
    machineIdentifier: resource.clientIdentifier,
    accessToken: resource.accessToken,
    owned: resource.owned,
    synced: false,
    connectionUris,
  };
}

// Get available profiles (home users)
export async function getProfiles(authToken: string): Promise<PlexProfile[]> {
  const headers = await getPlexHeaders(authToken);
  const response = await fetch(`${PLEX_API_BASE}/home/users`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to get profiles: ${response.status}`);
  }
  const data = await response.json();
  return data.users || [];
}

// Switch to a different profile
// Note: This endpoint uses /api/ not /api/v2/ and returns XML
const PLEX_HOME_API = 'https://plex.tv/api/home/users';

export async function switchProfile(authToken: string, userId: string, pin?: string): Promise<string> {
  const headers = await getPlexHeaders(authToken);

  // PIN must be passed as URL query parameter, not in body
  let url = `${PLEX_HOME_API}/${userId}/switch`;
  if (pin) {
    url += `?pin=${encodeURIComponent(pin)}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to switch profile: ${response.status}`);
  }

  // Response is XML, need to parse authenticationToken attribute
  const text = await response.text();
  const match = text.match(/authenticationToken="([^"]+)"/);
  if (!match) {
    throw new Error('No authentication token in response');
  }
  return match[1];
}

// Export secure storage helpers for use in AuthContext
export const SecureStorage = {
  getItem: getSecureItem,
  setItem: setSecureItem,
  removeItem: removeSecureItem,
};
