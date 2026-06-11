/**
 * Veritabanını temizler ve okacar admin + örnek kamp oluşturur.
 * Kullanım: npm run db:seed
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '../src/lib/auth';
import { generateCampDutyPlan } from '../src/lib/camp-plan';

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

async function deleteAll(supabase: ReturnType<typeof createClient>, table: string) {
  const { error } = await supabase.from(table).delete().gte('created_at', '1970-01-01');
  if (error && !error.message.includes('does not exist')) {
    // camp_duties may lack created_at filter on empty - try id filter
    const { error: err2 } = await supabase
      .from(table)
      .delete()
      .not('id', 'is', null);
    if (err2) throw new Error(`${table} silinemedi: ${err2.message}`);
  }
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Supabase URL veya anahtar eksik (.env.local)');
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Veritabanı temizleniyor...');

  const tables = [
    'camp_duties',
    'chat_messages',
    'items',
    'menus',
    'users',
    'tents',
    'campaigns',
  ];

  for (const table of tables) {
    try {
      if (table === 'camp_duties') {
        const { error } = await supabase.from(table).delete().not('id', 'is', null);
        if (error && !error.message.includes('does not exist')) {
          console.warn(`  ${table}: ${error.message}`);
        } else {
          console.log(`  ${table} temizlendi`);
        }
        continue;
      }
      await deleteAll(supabase, table);
      console.log(`  ${table} temizlendi`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('does not exist')) {
        console.warn(`  ${table} tablosu yok, atlanıyor`);
      } else {
        throw e;
      }
    }
  }

  const start_date = '2026-06-30';
  const end_date = '2026-07-02';

  console.log('Kamp oluşturuluyor...');

  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .insert({
      name: 'Taş Kamping 2026',
      location: 'Taş Kamping',
      start_date,
      end_date,
      admin_id: null,
    })
    .select()
    .single();

  if (campErr || !campaign) {
    throw new Error(`Kamp oluşturulamadı: ${campErr?.message}`);
  }

  const { data: tent, error: tentErr } = await supabase
    .from('tents')
    .insert({ campaign_id: campaign.id, name: 'Okacar Ailesi' })
    .select()
    .single();

  if (tentErr || !tent) {
    throw new Error(`Çadır oluşturulamadı: ${tentErr?.message}`);
  }

  const password_hash = await hashPassword('1234');

  const { data: admin, error: adminErr } = await supabase
    .from('users')
    .insert({
      campaign_id: campaign.id,
      tent_id: tent.id,
      name: 'Okacar',
      age: 30,
      role: 'admin',
      username: 'okacar',
      password_hash,
    })
    .select()
    .single();

  if (adminErr || !admin) {
    throw new Error(`Admin oluşturulamadı: ${adminErr?.message}`);
  }

  await supabase.from('campaigns').update({ admin_id: admin.id }).eq('id', campaign.id);

  const dutyTemplates = generateCampDutyPlan(start_date, end_date);
  if (dutyTemplates.length) {
    const { error: dutyErr } = await supabase.from('camp_duties').insert(
      dutyTemplates.map((t) => ({ campaign_id: campaign.id, ...t }))
    );
    if (dutyErr) {
      console.warn(`Nöbet planı eklenemedi (003 migration çalıştırıldı mı?): ${dutyErr.message}`);
    } else {
      console.log(`  ${dutyTemplates.length} nöbet slotu oluşturuldu`);
    }
  }

  console.log('\nSeed tamamlandı!');
  console.log(`  Kamp ID: ${campaign.id}`);
  console.log(`  Admin: okacar / 1234`);
  console.log(`  Çadır: Okacar Ailesi`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
