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

GitHub'a güncel kodu göndermek için (Vercel otomatik deploy eder):

```powershell
.\scripts\push.ps1
```

İlk kullanımda `scripts/push.config.example` dosyasını `scripts/push.config.local` olarak kopyalayıp GitHub token'ınızı girin.

Detaylı kurallar: [kurallar.md](kurallar.md)
