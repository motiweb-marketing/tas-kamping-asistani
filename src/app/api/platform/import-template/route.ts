import { NextResponse } from 'next/server';
import { buildUserImportTemplateBuffer } from '@/lib/user-import';
import { requirePlatformAdmin } from '@/lib/platform-auth';

export async function GET() {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const buffer = buildUserImportTemplateBuffer();
  const body = new Uint8Array(buffer);

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="kamp-katilimcilar-ornek.xlsx"',
    },
  });
}
