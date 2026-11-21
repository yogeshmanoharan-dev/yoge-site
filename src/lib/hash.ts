const encoder = new TextEncoder();

async function signHmac(secret: BufferSource, message: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', key, encoder.encode(message));
}

export async function dailyIpHash(secret: string, ip: string, day: string): Promise<string> {
  const dailyKey = await signHmac(encoder.encode(secret), 'yoge:rate-limit:' + day);
  const digest = await signHmac(dailyKey, ip);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
