import { timingSafeEqual } from 'crypto';
import { getSession } from '@/lib/session';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function isPlatformAdminConfigured(): boolean {
  return Boolean(
    process.env.PLATFORM_ADMIN_USERNAME?.trim() &&
      process.env.PLATFORM_ADMIN_PASSWORD?.trim()
  );
}

export function verifyPlatformCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.PLATFORM_ADMIN_USERNAME?.trim() || '';
  const expectedPass = process.env.PLATFORM_ADMIN_PASSWORD?.trim() || '';
  if (!expectedUser || !expectedPass) return false;
  return safeEqual(username.trim(), expectedUser) && safeEqual(password, expectedPass);
}

export async function requirePlatformAdmin() {
  const session = await getSession();
  if (!session.platformAdmin) {
    return { ok: false as const, status: 403, error: 'Platform yetkisi gerekli' };
  }
  return { ok: true as const, session };
}

export function isPlatformAiAvailable(): boolean {
  return Boolean(process.env.PLATFORM_OPENROUTER_API_KEY?.trim());
}
