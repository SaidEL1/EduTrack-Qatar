const DEFAULT_PUBLIC_URL = 'http://localhost:3000';

export function buildPublicLink(path: string, token: string): string {
  const base = (process.env['APP_PUBLIC_URL'] ?? DEFAULT_PUBLIC_URL).replace(/\/$/, '');
  const prefix = process.env['API_PREFIX'] ?? 'v1';
  return `${base}/${prefix}${path}?token=${encodeURIComponent(token)}`;
}

export function shouldReturnTokensInResponse(): boolean {
  return process.env['EMAIL_RETURN_TOKENS'] === 'true';
}
