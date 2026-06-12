# Kamp Asistanı

Kamp organizasyonu için mobil uyumlu SaaS web uygulaması. Organizatörler kamp kurar; katılımcılar listelerden malzeme üstlenir, harcama girer, nöbet ve menüyü takip eder. AI (OpenRouter) ile menü düzenleme ve alışveriş listesi üretimi desteklenir.

**Canlı:** https://tas-kamping-hesaplayici.vercel.app

---

## İçindekiler

1. [Mimari özeti](#mimari-özeti)
2. [Teknoloji yığını](#teknoloji-yığını)
3. [Üç katmanlı erişim modeli](#üç-katmanlı-erisim-modeli)
4. [Proje dizin yapısı](#proje-dizin-yapısı)
5. [Sayfa haritası](#sayfa-haritası)
6. [API uç noktaları](#api-uç-noktaları)
7. [Kimlik doğrulama ve oturum](#kimlik-doğrulama-ve-oturum)
8. [İş mantığı](#iş-mantığı)
9. [Listeler (3 katman)](#listeler-3-katman)
10. [Deneme / Pro planı](#deneme--pro-planı)
11. [Yapay zeka (OpenRouter)](#yapay-zeka-openrouter)
12. [Veritabanı şeması](#veritabanı-şeması)
13. [Migration sırası](#migration-sırası)
14. [Ortam değişkenleri](#ortam-değişkenleri)
15. [E-posta bildirimleri](#e-posta-bildirimleri)
16. [Kurulum ve geliştirme](#kurulum-ve-geliştirme)
17. [Deploy](#deploy)

---

## Mimari özeti

```mermaid
flowchart TB
  subgraph clients [İstemciler]
    Landing[Landing /]
    Setup[/setup — yeni kamp]
    App[Katılımcı uygulaması]
    Admin[Kamp admin /admin]
    Platform[Platform sahibi /platform]
  end

  subgraph next [Next.js 14 App Router]
    MW[middleware.ts — route koruması]
    API[Route Handlers /api/*]
    RSC[React Server + Client Components]
  end

  subgraph data [Veri katmanı]
    PG[(Supabase PostgreSQL)]
    Session[iron-session çerez]
  end

  subgraph external [Dış servisler]
    OR[OpenRouter API]
    Resend[Resend — e-posta]
    Vercel[Vercel hosting]
  end

  clients --> MW --> RSC
  RSC --> API
  API --> PG
  API --> Session
  API --> OR
  API --> Resend
  next --> Vercel
```

**Temel prensipler:**

- **Multi-tenant:** Her kamp (`campaigns`) kendi veri kümesine sahiptir; tüm sorgular `campaign_id` ile filtrelenir.
- **Supabase Auth kullanılmaz.** Kullanıcı adı + bcrypt şifre `users` tablosunda; oturum `iron-session` ile imzalı HTTP-only çerezde tutulur.
- **RLS kapalı.** Yetkilendirme Next.js middleware + API route kontrollerinde yapılır.
- **API anahtarları** kamp bazında veritabanında (`campaigns.openrouter_api_key`) veya platform env’de (`PLATFORM_OPENROUTER_API_KEY`) saklanır; istemciye düz metin olarak dönülmez.

---

## Teknoloji yığını

| Katman | Teknoloji | Not |
|--------|-----------|-----|
| Framework | Next.js 14 (App Router) | `src/app/`, Server/Client Components |
| Dil | TypeScript | `src/types/` — DB ve uygulama tipleri |
| Stil | Tailwind CSS | Mobil öncelikli, `forest` / `slate` paletleri |
| UI | Lucide React, Framer Motion | İkonlar, landing animasyonları |
| Veritabanı | Supabase PostgreSQL | `pg` ile migration scriptleri |
| Oturum | iron-session | `tas-kamping-session` çerezi |
| Şifre | bcryptjs | `users.password_hash` |
| AI | OpenRouter Chat Completions | Menü yayınlama, liste üretimi |
| E-posta | Resend | Yeni deneme kaydı bildirimi |
| Deploy | Vercel + GitHub | `scripts/push.ps1` |

---

## Üç katmanlı erişim modeli

| Rol | Giriş | Panel | Yetki |
|-----|-------|-------|-------|
| **Katılımcı** | `/login` | `/items`, `/budget`, `/chat`… | Kendi kampı; çadır bazlı üstlenme |
| **Kamp organizatörü** | `/login/admin` | `/admin/*` | Tek kamp: çadır, menü, listeler, ayarlar |
| **Platform sahibi (siz)** | `/platform/login` | `/platform/*` | Tüm kamplar, Pro yükseltme, CSV import, silme |

Platform oturumu (`session.platformAdmin`) kamp oturumundan (`session.user`) bağımsızdır.

---

## Proje dizin yapısı

```
tas-kamping-hesaplayici/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # Katılımcı layout (alt nav)
│   │   ├── admin/              # Kamp organizatör paneli
│   │   ├── platform/           # Platform sahibi paneli
│   │   ├── api/                # REST API route handlers
│   │   ├── login/, setup/      # Giriş ve kayıt
│   │   └── page.tsx            # Landing
│   ├── components/
│   │   ├── admin/              # TentsManager, kurulum sihirbazı…
│   │   ├── platform/           # PlatformShell
│   │   ├── auth/               # AuthField, AuthButton…
│   │   ├── landing/            # LandingPage, SEO
│   │   └── layout/             # BottomNav, AppHeader
│   ├── lib/                    # İş mantığı, yardımcılar
│   │   ├── campaign-limits.ts  # Deneme/Pro limitleri
│   │   ├── camp-plan.ts        # Nöbet şablonu üretimi
│   │   ├── notify-owner.ts     # Resend e-posta
│   │   ├── openrouter.ts       # AI çağrıları
│   │   ├── platform-auth.ts    # Platform giriş doğrulama
│   │   └── supabase/           # server + client Supabase
│   ├── types/                  # database.ts, app.ts
│   └── middleware.ts           # Route koruması
├── supabase/migrations/        # SQL migration dosyaları (001–012)
├── scripts/
│   ├── push.ps1                # GitHub + Vercel deploy
│   ├── apply-migrations.ts     # DB migration çalıştırıcı
│   └── setup-vercel-env.ps1    # Env → Vercel
├── public/                     # PWA ikonları, manifest
├── .env.local                  # Gizli anahtarlar (gitignore)
└── kurallar.md                 # Detaylı iş kuralları (agent referansı)
```

---

## Sayfa haritası

### Herkese açık
| URL | Açıklama |
|-----|----------|
| `/` | Landing: özellikler, deneme, FAQ, iletişim |
| `/setup` | Yeni kamp + organizatör hesabı (deneme başlatır) |
| `/login` | Katılımcı girişi |
| `/login/admin` | Organizatör girişi |

### Katılımcı (`(app)` layout, alt navigasyon)
| URL | Açıklama |
|-----|----------|
| `/items` | Kişisel / çadır / kamp listeleri |
| `/my-tent` | Çadır görevleri |
| `/budget` | Harcama ve bakiye |
| `/duties` | Nöbet planı |
| `/menu` | Yayınlanan menü |
| `/chat` | Kamp sohbeti |
| `/summary` | Özet |

### Kamp admin (`/admin`)
| URL | Açıklama |
|-----|----------|
| `/admin` | Genel bakış |
| `/admin/kurulum` | Program tanıtımı (adım adım) |
| `/admin/kamp` | Kamp adı, konum, tarihler |
| `/admin/cadirlar` | Çadır kartları, kişi ekleme, kapasite |
| `/admin/ucret` | Konaklama ücreti |
| `/admin/menu-duzenle` | Ham menü + AI yayınlama |
| `/admin/listeler/*` | Kişisel / çadır / kamp listeleri |
| `/admin/ayarlar` | OpenRouter API anahtarı |
| `/admin/pro` | Pro yükseltme iletişim |
| `/admin/paylas` | Giriş bilgisi paylaşımı |

### Platform sahibi (`/platform`)
| URL | Açıklama |
|-----|----------|
| `/platform/login` | Platform girişi |
| `/platform` | Tüm kamplar, deneme/Pro filtresi |
| `/platform/campaigns/[id]` | Detay, Pro, CSV import, kişi silme |

---

## API uç noktaları

### Kimlik
- `POST /api/auth/login` — `mode: tent | admin`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Kamp
- `POST /api/campaigns` — Yeni deneme kampı (+ e-posta bildirimi)
- `GET /api/campaign` — Oturumdaki kamp + limitler
- `PATCH /api/admin/campaign` — Kamp güncelleme (admin)

### Çadır / kullanıcı
- `GET|POST /api/tents`, `PATCH|DELETE /api/tents/[id]`
- `GET|POST /api/users`, `PATCH|DELETE /api/users/[id]`

### Listeler ve menü
- `GET|POST /api/items`, `PATCH /api/items/[id]`
- `POST /api/items/claim`, `assign`, `check`, `publish`
- `GET|PUT /api/menus/day`, `GET /api/menus`

### AI
- `POST /api/ai/publish-menu` — Menüyü AI ile düzenle ve yayınla
- `POST /api/ai/generate-items` — Kamp alışveriş listesi üret

### Platform (sadece `platformAdmin` oturumu)
- `POST /api/platform/auth/login|logout`
- `GET /api/platform/campaigns`
- `GET|PATCH|DELETE /api/platform/campaigns/[id]`
- `POST /api/platform/campaigns/[id]/import` — CSV toplu kişi
- `DELETE /api/platform/users/[id]`

---

## Kimlik doğrulama ve oturum

```typescript
// src/lib/session.ts
interface SessionData {
  user?: SessionUser;      // Kamp katılımcısı veya admin
  platformAdmin?: boolean; // Platform sahibi
  isLoggedIn: boolean;
}
```

- Şifreler `bcrypt` ile hash’lenir (`src/lib/auth.ts`).
- Girişte `users.last_login_at` güncellenir (platform panelinde “son giriş” için).
- Middleware (`src/middleware.ts`):
  - `/admin/*` → `role === 'admin'`
  - `/platform/*` → `platformAdmin === true`
  - Katılımcı rotaları → `isLoggedIn`

---

## İş mantığı

### Çadır bazlı sorumluluk
Malzeme ve görevler **kişi değil çadır** adına üstlenilir (`item_claims.tent_id`, `items.assigned_tent_id`).

### Bütçe
- Yaş &lt; sınır → çocuk payı; yetişkin → tam pay
- Konaklama ücreti + harcamalar çadır bazında dağıtılır (`src/lib/budget` mantığı, `/api/budget`)

### Nöbet
Kamp tarihlerinden otomatik şablon (`generateCampDutyPlan`); çadırlar `/duties` üzerinden üstlenir.

### Menü
Organizatör ham notları girer → AI (`publish-menu`) düzenler → `campaigns.published_menu` + `menus` tablosu.

---

## Listeler (3 katman)

`items.list_scope` enum:

| Scope | Kim görür | Açıklama |
|-------|-----------|----------|
| `personal` | Kişi | Kendi çantası |
| `tent` | Çadır | Çadır ekipmanı |
| `shared` | Tüm kamp | Ortak alışveriş; çadır adet seçerek üstlenir |

Admin akışı: `/admin/listeler` hub → AI veya manuel düzenleme → yayınla.  
Katılımcı: `/items` sekmeleri (Kişisel / Çadır / Kamp).

---

## Deneme / Pro planı

`campaigns.plan_tier`: `trial` | `paid`

| | Deneme | Pro |
|--|--------|-----|
| Çadır | 1 | 99 |
| Kişi (kamp toplam) | 2 | 99 |
| Kişi / çadır | 4 (çadır `max_capacity`) | 20 |

Limitler `src/lib/campaign-limits.ts` ve API’de (`/api/users`, `/api/tents`) zorlanır.  
Pro yükseltme: platform panelinden veya Supabase’de `plan_tier = 'paid'`.

---

## Yapay zeka (OpenRouter)

1. **Müşteri kendi anahtarı:** Admin → Ayarlar → `campaigns.openrouter_api_key`
2. **Platform AI paketi:** `use_platform_ai = true` + `PLATFORM_OPENROUTER_API_KEY` env

Çözümleme: `src/lib/resolve-openrouter-key.ts`  
Kullanıldığı yerler: `generate-items`, `publish-menu`.

---

## Veritabanı şeması

### Enum tipleri

| Enum | Değerler |
|------|----------|
| `user_role` | `admin`, `user` |
| `meal_type` | `breakfast`, `dinner` |
| `item_category` | `food`, `equipment` |
| `item_list_scope` | `shared`, `tent`, `personal` |
| `duty_period` | `breakfast`, `dinner` |
| `duty_kind` | `meal_prep`, `fire`, `tea`, `dishes` |
| `menu_entry_kind` | `breakfast`, `meal`, `snack` |
| `meal_period` | `breakfast`, `dinner` |

### `campaigns` — Kamp organizasyonu

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID PK | |
| name, location | TEXT | Kamp adı, konum |
| start_date, end_date | DATE | Varış / ayrılış |
| admin_id | UUID FK → users | Organizatör |
| openrouter_api_key | TEXT | Müşteri AI anahtarı (gizli) |
| menu_ai_prompt | TEXT | AI talimatı |
| published_menu | TEXT | Yayınlanan menü JSON |
| adult/child_accommodation_fee | NUMERIC | Konaklama ücretleri |
| accommodation_use_age_pricing | BOOLEAN | Yaşa göre fiyat |
| accommodation_child_age_max | INT | Çocuk yaş sınırı |
| plan_tier | TEXT | `trial` / `paid` |
| max_tents, max_users | INT | Plan limitleri |
| use_platform_ai | BOOLEAN | Satıcı OpenRouter kullanımı |
| platform_notes | TEXT | Satış notları |
| owner_contact_name/email | TEXT | Müşteri iletişim |
| created_at | TIMESTAMPTZ | |

### `tents` — Çadırlar

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID PK | |
| campaign_id | UUID FK | |
| name | TEXT | UNIQUE(campaign_id, name) |
| max_capacity | INT | Kişi kapasitesi (1–99) |
| created_at | TIMESTAMPTZ | |

### `users` — Kullanıcılar

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID PK | |
| campaign_id | UUID FK | |
| tent_id | UUID FK | Nullable |
| name, age | TEXT, INT | |
| role | user_role | |
| username | TEXT | UNIQUE(campaign_id, username) |
| password_hash | TEXT | bcrypt |
| last_login_at | TIMESTAMPTZ | Son giriş |
| created_at | TIMESTAMPTZ | |

### `menus` — Gün gün menü satırları

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| campaign_id, day | | |
| meal_type, period, entry_kind | | Kahvaltı / yemek / ara öğün |
| description | TEXT | |
| camp_day_number, is_departure, sort_order | | Slot meta |

### `items` — Liste kalemleri

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| list_scope | item_list_scope | personal / tent / shared |
| name, quantity, category | | |
| needed_count, unit_label | | Ortak listede adet |
| is_standard, is_recommendation | | Şablon / öneri |
| is_published, is_extra | | Yayın ve ekstra |
| assigned_tent_id, added_by | FK | |
| disposition | TEXT | consumable / returnable |
| price | NUMERIC | Bütçe |

### `item_claims` — Çadır üstlenmeleri (ortak liste)

| Sütun | Tip |
|-------|-----|
| item_id, tent_id | FK |
| quantity | INT |

### `item_checks` — Kişisel/çadır işaretleme

| Sütun | Tip |
|-------|-----|
| item_id, user_id, tent_id | FK |

### `camp_expenses` — Harcama kayıtları

| Sütun | Tip |
|-------|-----|
| campaign_id, tent_id, item_id | FK |
| amount, description, created_by | |

### `camp_duties` — Nöbet planı

| Sütun | Tip |
|-------|-----|
| slot_date, period, duty_kind | |
| assigned_tent_id, assigned_user_id | FK |
| release_requested | BOOLEAN |

### `chat_messages` — Kamp sohbeti

Realtime: `supabase_realtime` publication’da.

---

## Migration sırası

`supabase/migrations/` dosyalarını **sırayla** çalıştırın (veya `npm run db:migrate`):

| Dosya | İçerik |
|-------|--------|
| 001_initial_schema | campaigns, tents, users, menus, items, chat |
| 002_add_openrouter_api_key | (001’de birleşik olabilir) |
| 003_camp_duties | Nöbet tablosu |
| 004_menu_slots | Menü slot alanları |
| 005_menu_ai_prompt | AI prompt, published_menu |
| 006_item_list_scope | 3 katmanlı liste, item_checks |
| 007_claims_expenses | claims, expenses, needed_count |
| 008_accommodation_fees | Konaklama ücreti |
| 009_accommodation_age_option | Yaş ayrımı |
| 010_campaign_plan | plan_tier, limitler |
| 011_tent_capacity | tents.max_capacity |
| 012_platform_admin | use_platform_ai, last_login_at |

---

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Evet | Supabase proje URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Evet | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Evet | Sunucu tarafı DB |
| `SESSION_SECRET` | Evet | iron-session (32+ karakter) |
| `NEXT_PUBLIC_SITE_URL` | Önerilir | Canonical URL, SEO |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Önerilir | Landing iletişim |
| `NEXT_PUBLIC_CONTACT_WHATSAPP` | Önerilir | WhatsApp CTA |
| `PLATFORM_ADMIN_USERNAME` | Platform için | `/platform/login` |
| `PLATFORM_ADMIN_PASSWORD` | Platform için | |
| `PLATFORM_OPENROUTER_API_KEY` | Opsiyonel | Müşteriye AI paketi |
| `RESEND_API_KEY` | Bildirim için | [resend.com](https://resend.com) |
| `PLATFORM_NOTIFY_EMAIL` | Opsiyonel | Varsayılan: qa.omerkacar@gmail.com |
| `NOTIFY_FROM_EMAIL` | Opsiyonel | Gönderen (Resend domain) |
| `SUPABASE_DB_PASSWORD` | Migration için | veya `wpd.txt` |

Örnek: `.env.local.example`

---

## E-posta bildirimleri

Yeni **deneme** kampı oluşturulduğunda (`POST /api/campaigns`) platform sahibine e-posta gider.

**Kurulum:**

1. [Resend](https://resend.com) hesabı açın (ücretsiz katman yeterli).
2. API anahtarı alın → `RESEND_API_KEY=re_...`
3. `.env.local` ve Vercel’e ekleyin:
   ```
   RESEND_API_KEY=re_...
   PLATFORM_NOTIFY_EMAIL=qa.omerkacar@gmail.com
   NOTIFY_FROM_EMAIL=Kamp Asistanı <onboarding@resend.dev>
   ```
4. Domain doğrulaması olmadan test için `onboarding@resend.dev` yalnızca Resend hesabınızdaki e-postaya gider; production için kendi domain’inizi Resend’de doğrulayın.

Kod: `src/lib/notify-owner.ts`

---

## Kurulum ve geliştirme

```bash
npm install
cp .env.local.example .env.local
# .env.local doldurun
npm run dev          # http://localhost:3000
npm run db:migrate   # Supabase migration (wpd.txt veya SUPABASE_DB_PASSWORD)
npm run db:seed      # Test verisi (opsiyonel)
```

---

## Deploy

```powershell
.\scripts\setup-vercel-env.ps1   # .env.local → Vercel production
.\scripts\push.ps1               # git push + Vercel deploy
.\scripts\push.ps1 -Message "feat: açıklama"
```

İlk kurulum: `scripts/push.config.example` → `push.config.local` (`GITHUB_TOKEN`, `VERCEL_TOKEN`).

---

## İlgili dosyalar

- [kurallar.md](kurallar.md) — Detaylı iş ve AI kuralları (geliştirici/agent referansı)
- [kamp_asistani plan dosyası] — Ürün yol haritası (varsa)

---

*Kamp Asistanı — kamp organizasyonunu tek yerde toplayan SaaS.*
