import bcrypt from 'bcryptjs';
import type { SafeUser, SessionUser, User } from '@/types';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function toSafeUser(user: User): SafeUser {
  const { password_hash: _, ...safe } = user;
  return safe;
}

export function toSessionUser(user: User): SessionUser {
  const safe = toSafeUser(user);
  return {
    id: safe.id,
    campaign_id: safe.campaign_id,
    tent_id: safe.tent_id,
    name: safe.name,
    age: safe.age,
    role: safe.role,
    username: safe.username,
  };
}
