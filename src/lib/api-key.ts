/** API anahtarını UI'da güvenli şekilde göstermek için maskele */
export function maskApiKey(key: string | null | undefined): string {
  if (!key) return '';
  if (key.length <= 10) return '••••••••••••';
  return `${key.slice(0, 8)}${'•'.repeat(12)}${key.slice(-4)}`;
}

export function isApiKeyConfigured(key: string | null | undefined): boolean {
  return !!key && key.trim().length > 0;
}
