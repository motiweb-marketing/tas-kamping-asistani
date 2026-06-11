# Taş Kamping Asistanı

Kamp organizasyonu için mobil uyumlu web uygulaması: katılımcılar, çadırlar, AI destekli malzeme listesi, bütçe hesaplama ve gerçek zamanlı sohbet.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- Supabase PostgreSQL
- OpenRouter API (anahtar admin ayarlarından girilir)
- Vercel deploy

## Kurulum

```bash
npm install
cp .env.local.example .env.local
# .env.local içini doldurun
npm run dev
```

## Supabase

`supabase/migrations/` altındaki SQL dosyalarını sırayla Supabase SQL Editor'da çalıştırın.

## Deploy / Push

```powershell
.\push.ps1                    # GitHub push + Vercel prod deploy (3 denemeye kadar otomatik retry)
.\push.ps1 -Message "feat: x" # Özel commit mesajı
```

İlk kurulum: `scripts/push.config.example` → `scripts/push.config.local` kopyalayın.

| Anahtar | Nereden |
|---------|---------|
| `GITHUB_TOKEN` | github.com/settings/tokens |
| `VERCEL_TOKEN` | vercel.com/account/tokens |

Detaylı kurallar: [kurallar.md](kurallar.md)
