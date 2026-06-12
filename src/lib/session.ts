import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionUser } from '@/types';

export interface SessionData {
  user?: SessionUser;
  /** Kamp Asistanı platform sahibi (satış / operasyon) oturumu */
  platformAdmin?: boolean;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'tas-kamping-dev-secret-min-32-chars!!',
  cookieName: 'tas-kamping-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 14,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
