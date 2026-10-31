/**
 * QR Code Payload Parser for BRISK Smart Connect
 * Handles voucher PINs, WiFi connection strings, URLs, and JSON payloads.
 */

export interface ParsedQrResult {
  raw: string;
  type: 'VOUCHER' | 'WIFI_CONFIG' | 'URL' | 'JSON' | 'UNKNOWN';
  isBriskFormat?: boolean;
  voucherCode?: string;
  wifiConfig?: {
    ssid: string;
    password?: string;
    authType?: 'WPA' | 'WEP' | 'nopass' | string;
    hidden?: boolean;
  };
  url?: string;
  metadata?: Record<string, any>;
  displaySummary: string;
}

/**
 * Parses raw text from a scanned QR code into structured hotspot/voucher data
 */
export function parseQrCode(rawInput: string): ParsedQrResult {
  const raw = rawInput.trim();

  if (!raw) {
    return {
      raw: '',
      type: 'UNKNOWN',
      isBriskFormat: false,
      displaySummary: 'Empty QR code',
    };
  }

  const isBriskBranded =
    raw.toUpperCase().startsWith('BRK-') ||
    raw.toUpperCase().startsWith('BRISK-') ||
    raw.toLowerCase().includes('brisksmartconnect') ||
    raw.toLowerCase().includes('brisk');

  // 1. Check for Standard WiFi QR Code: WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<Password>;;
  if (raw.toUpperCase().startsWith('WIFI:')) {
    const wifiConfig: {
      ssid: string;
      password?: string;
      authType?: string;
      hidden?: boolean;
    } = { ssid: '' };

    const body = raw.slice(5);
    const tokens = body.split(';');

    for (const token of tokens) {
      if (!token) continue;
      const match = token.match(/^([STPH]):(.*)$/i);
      if (match) {
        const key = match[1].toUpperCase();
        const val = match[2];
        if (key === 'S') wifiConfig.ssid = val;
        else if (key === 'P') wifiConfig.password = val;
        else if (key === 'T') wifiConfig.authType = val.toUpperCase();
        else if (key === 'H') wifiConfig.hidden = val.toLowerCase() === 'true';
      }
    }

    return {
      raw,
      type: 'WIFI_CONFIG',
      isBriskFormat: isBriskBranded || Boolean(wifiConfig.ssid && wifiConfig.ssid.toLowerCase().includes('brisk')),
      wifiConfig,
      displaySummary: `WiFi Network: ${wifiConfig.ssid || 'Hotspot'} (${wifiConfig.authType || 'Open'})`,
    };
  }

  // 2. Check for JSON format
  if (
    (raw.startsWith('{') && raw.endsWith('}')) ||
    (raw.startsWith('[') && raw.endsWith(']'))
  ) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const potentialVoucher =
          parsed.voucher ||
          parsed.voucherCode ||
          parsed.code ||
          parsed.pin ||
          parsed.ticket;

        if (potentialVoucher) {
          const cleanCode = String(potentialVoucher).trim().toUpperCase();
          return {
            raw,
            type: 'VOUCHER',
            isBriskFormat: true,
            voucherCode: cleanCode,
            metadata: parsed,
            displaySummary: `Voucher Code: ${cleanCode}`,
          };
        }

        return {
          raw,
          type: 'JSON',
          isBriskFormat: isBriskBranded || Boolean(parsed.brisk),
          metadata: parsed,
          displaySummary: 'Configuration Data',
        };
      }
    } catch {
      // proceed
    }
  }

  // 3. Check for URL with voucher or portal query parameters
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const urlObj = new URL(raw);
      const voucherParam =
        urlObj.searchParams.get('voucher') ||
        urlObj.searchParams.get('code') ||
        urlObj.searchParams.get('pin') ||
        urlObj.searchParams.get('v');

      const isBriskUrl = urlObj.hostname.includes('brisksmartconnect') || urlObj.pathname.includes('/portal') || isBriskBranded;

      if (voucherParam) {
        const cleanCode = voucherParam.trim().toUpperCase();
        return {
          raw,
          type: 'VOUCHER',
          isBriskFormat: true,
          voucherCode: cleanCode,
          url: raw,
          displaySummary: `Voucher Link: ${cleanCode}`,
        };
      }

      return {
        raw,
        type: 'URL',
        isBriskFormat: isBriskUrl,
        url: raw,
        displaySummary: `Hotspot URL: ${urlObj.hostname}`,
      };
    } catch {
      // invalid URL structure
    }
  }

  // 4. Check for explicit voucher prefix
  const prefixMatch = raw.match(/^(?:voucher|code|pin|ticket|brisk):\s*([a-zA-Z0-9_-]+)/i);
  if (prefixMatch) {
    const cleanCode = prefixMatch[1].trim().toUpperCase();
    return {
      raw,
      type: 'VOUCHER',
      isBriskFormat: true,
      voucherCode: cleanCode,
      displaySummary: `Voucher Code: ${cleanCode}`,
    };
  }

  // 5. Check if string matches typical BRISK voucher patterns
  const isBriskVoucher = /^(?:BRK-|BRISK-)?[A-Z0-9]{4,16}$/i.test(raw);
  if (isBriskVoucher) {
    const cleanCode = raw.toUpperCase();
    return {
      raw,
      type: 'VOUCHER',
      isBriskFormat: true,
      voucherCode: cleanCode,
      displaySummary: `BRISK Voucher PIN: ${cleanCode}`,
    };
  }

  // 6. Generic Text fallback
  return {
    raw,
    type: 'UNKNOWN',
    isBriskFormat: isBriskBranded,
    voucherCode: raw.length <= 24 ? raw.toUpperCase() : undefined,
    displaySummary: raw.length > 30 ? `${raw.slice(0, 30)}...` : raw,
  };
}
