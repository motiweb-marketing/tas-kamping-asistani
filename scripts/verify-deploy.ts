/**
 * Deploy doğrulama: DB şeması + canlı API smoke testleri
 */
import dns from 'dns';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import pg from 'pg';

dns.setDefaultResultOrder('ipv4first');

const BASE = process.env.VERIFY_BASE_URL || 'https://tas-kamping-hesaplayici.vercel.app';

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

async function connectDb() {
  loadEnvFile();
  const wpdPath = resolve(process.cwd(), 'wpd.txt');
  let password = process.env.SUPABASE_DB_PASSWORD || '';
  if (!password) {
    const wpd = readFileSync(wpdPath, 'utf-8');
    const line = wpd.split('\n').find((l) => l.trim() && !l.includes('supabase'));
    if (line) password = line.trim();
  }
  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref || !password) throw new Error('Supabase env eksik');

  const encoded = encodeURIComponent(password);
  const client = new pg.Client({
    connectionString: `postgresql://postgres.${ref}:${encoded}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

const REQUIRED_CAMPAIGN_COLS = [
  'openrouter_api_key',
  'menu_ai_prompt',
  'published_menu',
  'adult_accommodation_fee',
  'child_accommodation_fee',
  'accommodation_use_age_pricing',
  'accommodation_child_age_max',
  'plan_tier',
  'max_tents',
  'max_users',
];

const REQUIRED_TABLES = [
  'campaigns',
  'users',
  'tents',
  'items',
  'item_claims',
  'camp_expenses',
  'camp_duties',
  'menus',
  'chat_messages',
];

const REQUIRED_ITEM_COLS = [
  'list_scope',
  'needed_count',
  'unit_label',
  'is_standard',
  'disposition',
  'is_recommendation',
];

async function checkDb(client: pg.Client) {
  const issues: string[] = [];
  const ok: string[] = [];

  for (const table of REQUIRED_TABLES) {
    const { rows } = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS exists`,
      [table]
    );
    if (rows[0]?.exists) ok.push(`tablo: ${table}`);
    else issues.push(`Eksik tablo: ${table}`);
  }

  const { rows: campCols } = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'campaigns'`
  );
  const campSet = new Set(campCols.map((r) => r.column_name as string));
  for (const col of REQUIRED_CAMPAIGN_COLS) {
    if (campSet.has(col)) ok.push(`campaigns.${col}`);
    else issues.push(`Eksik sütun: campaigns.${col}`);
  }

  const { rows: itemCols } = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'items'`
  );
  const itemSet = new Set(itemCols.map((r) => r.column_name as string));
  for (const col of REQUIRED_ITEM_COLS) {
    if (itemSet.has(col)) ok.push(`items.${col}`);
    else issues.push(`Eksik sütun: items.${col}`);
  }

  const { rows: counts } = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM campaigns) AS campaigns,
      (SELECT COUNT(*)::int FROM users) AS users,
      (SELECT COUNT(*)::int FROM items) AS items,
      (SELECT COUNT(*)::int FROM camp_expenses) AS expenses
  `);
  ok.push(`kayıt sayıları: ${JSON.stringify(counts[0])}`);

  return { ok, issues };
}

async function checkFrontend() {
  const issues: string[] = [];
  const ok: string[] = [];

  const pages = [
    { path: '/', expect: 'Kamp Asistanı' },
    { path: '/login', expect: 'Çadıra giriş yap' },
    { path: '/login/admin', expect: 'Çadıra giriş yap' },
    { path: '/items', expect: null }, // redirect to login
  ];

  for (const { path, expect } of pages) {
    const res = await fetch(`${BASE}${path}`, { redirect: 'follow' });
    const html = await res.text();
    if (res.status >= 500) {
      issues.push(`${path} → HTTP ${res.status}`);
    } else {
      ok.push(`${path} → HTTP ${res.status}`);
    }
    if (expect && !html.includes(expect)) {
      issues.push(`${path} içeriğinde "${expect}" bulunamadı`);
    }
  }

  // Kamp kodu kaldırıldı mı?
  const loginRes = await fetch(`${BASE}/login`);
  const loginHtml = await loginRes.text();
  if (loginHtml.includes('Kamp Kodu')) {
    issues.push('/login hâlâ "Kamp Kodu" alanı gösteriyor (eski deploy?)');
  } else {
    ok.push('/login kamp kodu alanı yok ✓');
  }

  return { ok, issues };
}

async function checkApiRoutes() {
  const issues: string[] = [];
  const ok: string[] = [];

  const protectedRoutes = [
    '/api/campaign',
    '/api/items',
    '/api/budget',
    '/api/expenses',
    '/api/summary',
    '/api/auth/me',
  ];

  for (const route of protectedRoutes) {
    const res = await fetch(`${BASE}${route}`);
    const data = await res.json().catch(() => ({}));
    const body = data as { error?: string; user?: unknown };
    if (res.status === 401 && (body.error || route === '/api/auth/me')) {
      ok.push(`${route} → 401 (auth korumalı) ✓`);
    } else if (res.status >= 500) {
      issues.push(`${route} → HTTP ${res.status} (sunucu hatası)`);
    } else {
      issues.push(`${route} → beklenmeyen HTTP ${res.status}`);
    }
  }

  // Login API — kamp kodsuz tent giriş denemesi
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'x', password: 'y', mode: 'tent' }),
  });
  const loginData = await loginRes.json();
  if (loginRes.status === 400 && String(loginData.error).includes('Kamp kodu')) {
    issues.push('API hâlâ kamp kodu zorunlu tutuyor');
  } else if (loginRes.status === 401) {
    ok.push('/api/auth/login tent → kamp kodsuz 401 (kullanıcı yok) ✓');
  } else {
    ok.push(`/api/auth/login tent → HTTP ${loginRes.status}`);
  }

  return { ok, issues };
}

async function main() {
  console.log('=== Deploy Doğrulama ===\n');
  console.log(`Frontend URL: ${BASE}\n`);

  let client: pg.Client | null = null;
  try {
    client = await connectDb();
    console.log('--- BACKEND (Supabase DB) ---');
    const db = await checkDb(client);
    db.ok.forEach((l) => console.log('  OK', l));
    db.issues.forEach((l) => console.log('  FAIL', l));

    console.log('\n--- FRONTEND (Vercel sayfalar) ---');
    const fe = await checkFrontend();
    fe.ok.forEach((l) => console.log('  OK', l));
    fe.issues.forEach((l) => console.log('  FAIL', l));

    console.log('\n--- API (Vercel serverless) ---');
    const api = await checkApiRoutes();
    api.ok.forEach((l) => console.log('  OK', l));
    api.issues.forEach((l) => console.log('  FAIL', l));

    const totalIssues = db.issues.length + fe.issues.length + api.issues.length;
    console.log('\n=== SONUÇ ===');
    if (totalIssues === 0) {
      console.log('Tüm kontroller geçti.');
    } else {
      console.log(`${totalIssues} sorun bulundu.`);
      process.exit(1);
    }
  } finally {
    await client?.end().catch(() => undefined);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
