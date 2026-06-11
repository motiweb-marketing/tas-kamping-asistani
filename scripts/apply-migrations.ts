import dns from 'dns';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import pg from 'pg';

dns.setDefaultResultOrder('ipv4first');

const { Client } = pg;

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
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

function loadEnv() {
  loadEnvFile();
  const wpdPath = resolve(process.cwd(), 'wpd.txt');
  let password = process.env.SUPABASE_DB_PASSWORD || '';
  if (!password) {
    try {
      const wpd = readFileSync(wpdPath, 'utf-8');
      const line = wpd.split('\n').find((l) => l.trim() && !l.includes('supabase'));
      if (line) password = line.trim();
    } catch {
      /* ignore */
    }
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref || !password) {
    console.error('Supabase URL veya DB şifresi bulunamadı');
    process.exit(1);
  }
  return { ref, password };
}

async function connectClient(ref: string, password: string) {
  const encoded = encodeURIComponent(password);
  const candidates = [
    `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${encoded}@[2a05:d018:cb7:ae00:153:b087:f3be:b36c]:5432/postgres`,
  ];

  let lastErr: unknown;
  for (const connectionString of candidates) {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log('DB baglantisi:', connectionString.replace(encoded, '***'));
      return client;
    } catch (e) {
      lastErr = e;
      await client.end().catch(() => undefined);
    }
  }
  throw lastErr;
}

async function main() {
  const { ref, password } = loadEnv();
  const client = await connectClient(ref, password);
  const files = [
    '003_camp_duties.sql',
    '004_menu_slots.sql',
    '005_menu_ai_prompt.sql',
    '006_item_list_scope.sql',
  ];

  for (const file of files) {
    const sql = readFileSync(resolve('supabase/migrations', file), 'utf-8');
    console.log(`Çalıştırılıyor: ${file}`);
    try {
      await client.query(sql);
      console.log('  Tamam');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log('  Zaten var, atlandı');
      } else {
        console.error('  Hata:', msg);
      }
    }
  }

  const { rows } = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='menus' ORDER BY ordinal_position`
  );
  console.log('\nmenus sütunları:', rows.map((r) => r.column_name).join(', '));
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
