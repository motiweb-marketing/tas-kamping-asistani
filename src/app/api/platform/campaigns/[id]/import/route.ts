import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { getCampaignLimits } from '@/lib/campaign-limits';
import { parseUsersFile } from '@/lib/user-import';
import { formatPersonName, formatTitleCase } from '@/lib/format';
import { requirePlatformAdmin } from '@/lib/platform-auth';
import { syncAllListQuantities } from '@/lib/sync-ai-list-quantities';
import { normalizeUsername } from '@/lib/user-validation';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Excel veya CSV dosyası gerekli' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const { rows, errors: parseErrors } = parseUsersFile(buffer, file.name);
  if (parseErrors.length && !rows.length) {
    return NextResponse.json({ error: parseErrors.join(' ') }, { status: 400 });
  }

  const supabase = createServerClient();
  const campaignId = params.id;

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id')
    .eq('id', campaignId)
    .single();

  if (!campaign) {
    return NextResponse.json({ error: 'Kamp bulunamadı' }, { status: 404 });
  }

  const limits = await getCampaignLimits(supabase, campaignId);
  const { data: existingTents } = await supabase
    .from('tents')
    .select('id, name')
    .eq('campaign_id', campaignId);

  const tentByName = new Map(
    (existingTents || []).map((t) => [t.name.toLowerCase(), t])
  );

  const results = { created: 0, skipped: 0, errors: [...parseErrors] as string[] };

  for (const row of rows) {
    const limitsNow = await getCampaignLimits(supabase, campaignId);
    if (!limitsNow.can_add_user) {
      results.errors.push(`${row.username}: kamp kişi limiti doldu`);
      results.skipped++;
      continue;
    }

    const tentKey = formatTitleCase(row.tent_name).toLowerCase();
    let tent = tentByName.get(tentKey);

    if (!tent) {
      const limitsTent = await getCampaignLimits(supabase, campaignId);
      if (!limitsTent.can_add_tent) {
        results.errors.push(`${row.username}: çadır limiti doldu (${row.tent_name})`);
        results.skipped++;
        continue;
      }

      const { data: newTent, error: tentErr } = await supabase
        .from('tents')
        .insert({
          campaign_id: campaignId,
          name: formatTitleCase(row.tent_name),
          max_capacity: limitsTent.max_users_per_tent,
        })
        .select('id, name')
        .single();

      if (tentErr || !newTent) {
        results.errors.push(`${row.username}: çadır oluşturulamadı — ${tentErr?.message}`);
        results.skipped++;
        continue;
      }
      tent = newTent;
      tentByName.set(tentKey, tent);
    }

    const { count: inTent } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('tent_id', tent.id);

    const tentCap =
      (await supabase.from('tents').select('max_capacity').eq('id', tent.id).single()).data
        ?.max_capacity ?? limits.max_users_per_tent;

    if ((inTent ?? 0) >= tentCap) {
      results.errors.push(`${row.username}: çadır dolu (${tent.name})`);
      results.skipped++;
      continue;
    }

    const cleanUsername = normalizeUsername(row.username);
    if (!cleanUsername) {
      results.errors.push(`${row.username}: geçersiz kullanıcı adı`);
      results.skipped++;
      continue;
    }

    const { data: dup } = await supabase
      .from('users')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('username', cleanUsername)
      .maybeSingle();

    if (dup) {
      results.errors.push(`${row.username}: kullanıcı adı zaten var`);
      results.skipped++;
      continue;
    }

    const password_hash = await hashPassword(row.password);
    const { error: insErr } = await supabase.from('users').insert({
      campaign_id: campaignId,
      tent_id: tent.id,
      name: formatPersonName(row.name),
      age: row.age,
      username: cleanUsername,
      password_hash,
      role: 'user',
    });

    if (insErr) {
      results.errors.push(`${row.username}: ${insErr.message}`);
      results.skipped++;
      continue;
    }

    results.created++;
  }

  try {
    await syncAllListQuantities(supabase, campaignId);
  } catch {
    /* ignore */
  }

  return NextResponse.json(results);
}
