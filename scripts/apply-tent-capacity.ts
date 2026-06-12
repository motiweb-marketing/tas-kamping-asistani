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

function loadCredentials() {
  loadEnvFile();
  const wpdPath = resolve(process.cwd(), 'wpd.txt');
  let password = process.env.SUPABASE_DB_PASSWORD || '';
  if (!password && existsSync(wpdPath)) {
    const line = readFileSync(wpdPath, 'utf-8')
      .split('\n')
      .find((l) => l.trim() && !l.includes('supabase'));
    if (line) password = line.trim();
  }
  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref || !password) {
    console.error('Supabase DB şifresi gerekli: .env.local içine SUPABASE_DB_PASSWORD ekleyin');
    console.error('veya proje köküne wpd.txt (tek satır şifre) koyun.');
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
  ];

  let lastErr: unknown;
  for (const connectionString of candidates) {
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });
    try {
      await client.connect();
      return client;
    } catch (e) {
      lastErr = e;
      await client.end().catch(() => undefined);
    }
  }
  throw lastErr;
}

async function main() {
  const { ref, password } = loadCredentials();
  const sql = readFileSync(resolve('scripts/apply-tent-capacity.sql'), 'utf-8');
  const client = await connectClient(ref, password);

  console.log('Çadır kapasitesi migration çalıştırılıyor...');
  await client.query(sql);

  const { rows } = await client.query(
    `SELECT column_name, data_type, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'tents' AND column_name = 'max_capacity'`
  );

  if (!rows.length) {
    console.error('Hata: max_capacity sütunu oluşmadı');
    process.exit(1);
  }

  const { rows: sample } = await client.query(
    'SELECT id, name, max_capacity FROM tents LIMIT 5'
  );
  console.log('Tamam — tents.max_capacity eklendi.');
  console.log('Örnek:', sample);
  await client.end();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
