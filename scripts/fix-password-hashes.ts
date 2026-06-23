/**
 * Bozuk password_hash kayıtlarını düzeltir (bcrypt değilse düz metin kabul edip yeniden hashler).
 * Kullanım: npx tsx scripts/fix-password-hashes.ts
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '../src/lib/auth';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error('.env.local bulunamadı');
    process.exit(1);
  }
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadEnv();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: users, error } = await supabase.from('users').select('id, username, password_hash');
  if (error || !users) {
    console.error('Kullanıcılar okunamadı:', error?.message);
    process.exit(1);
  }

  let fixed = 0;
  for (const user of users) {
    const hash = user.password_hash || '';
    if (hash.startsWith('$2')) continue;

  const plain = hash.trim();
    if (!plain || plain.length > 128) {
      console.warn(`Atlandı (geçersiz hash): @${user.username}`);
      continue;
    }

    const newHash = await hashPassword(plain);
    const { error: updErr } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', user.id);

    if (updErr) {
      console.error(`@${user.username} güncellenemedi:`, updErr.message);
      continue;
    }

    console.log(`Düzeltildi: @${user.username}`);
    fixed++;
  }

  console.log(`Tamam. ${fixed} kayıt bcrypt'e çevrildi.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
