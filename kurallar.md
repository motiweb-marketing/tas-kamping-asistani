# Taş Kamping Asistanı — Proje Anayasası

Bu dosya projenin tüm teknik, iş ve tasarım kurallarını tanımlar. Her agent bu dosyayı okumadan kod yazmamalıdır.

---

## 1. Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Dil | TypeScript |
| Stil | Tailwind CSS |
| Veritabanı | Supabase PostgreSQL |
| Deploy | Vercel |
| AI | OpenRouter API |
| Auth | Basit kullanıcı adı/şifre (Supabase Auth kullanılmaz) |

---

## 2. Roller ve Erişim

### Admin
- Kamp oluşturur (campaigns)
- Çadırları ve kişileri ekler (tents, users)
- Menüyü girer (menus)
- **OpenRouter API anahtarını** Ayarlar sayfasından girer (`/admin/settings`)
- AI listesini oluşturur, düzenler ve yayınlar
- Admin paneline erişir (`/admin/*`)

### Kullanıcı (User)
- Kendisine verilen link ve şifre ile giriş yapar
- Ana listeyi görür, eşya üstlenir
- Çadırının görevlerini görür
- Bütçe ve chat'e erişir
- Listeye ekstra malzeme ekleyebilir

---

## 3. İş Kuralları (Business Logic)

### 3.1 Çadır Bazlı Sorumluluk
- Alınacak eşya veya yemek **kişi değil, çadır** tarafından üstlenilir.
- "Ben Getiriyorum" butonuna basıldığında `items.assigned_tent_id` = kullanıcının `tent_id` olur.
- Herkes kendi çadırının görevlerini `/my-tent` sayfasında görür.

### 3.2 Ekstra Malzemeler
- Kullanıcılar listeye yeni malzeme ekleyebilir.
- Eklenen malzemelerin `is_extra = true` olur.
- UI'da `"Selahattin Ekledi"` gibi dikkat çekici rozet gösterilir.
- Eklendiğinde chat'e sistem mesajı düşer: `"Selahattin listeye Nargile ekledi"`.

### 3.3 Bütçe Hesaplama
- **15 yaş altı** → 0.5 pay (yarım)
- **15 yaş ve üstü** → 1 pay (tam)
- Toplam kamp maliyeti ÷ toplam pay = 1 payın maliyeti
- Her çadır için:
  - Beklenen katkı = çadır üyelerinin toplam payı × 1 payın maliyeti
  - Gerçek harcama = çadırın üstlendiği item'ların `price` toplamı
  - Bakiye = gerçek harcama − beklenen katkı
  - Pozitif → **Alacaklı**, negatif → **Borçlu**, sıfıra yakın → **Denk**

### 3.4 AI Liste Yayınlama
- AI'dan gelen liste **doğrudan yayınlanmaz**.
- `is_published = false` olarak kaydedilir.
- Admin düzenleme ekranında siler, miktarları değiştirir.
- "Yayınla" ile `is_published = true` yapılır.

---

## 4. Yapay Zeka Kuralları (OpenRouter)

### 4.1 Dinamik Sistem Promptu

```
Sen Taş Kamping'e gidecek bir grubun asistanısın. Grupta toplam {total_people} kişi var ({adult_count} yetişkin, {child_count} çocuk). Katılımcılar {tent_count} adet çadırda kalacak.

İşte gün gün kamp menüsü:
{menu_details}

Bu menüye ve kişi sayısına göre milimetrik bir alışveriş listesi çıkar.

Ayrıca Taş Kamping kurallarına göre şu donanımları kesinlikle listeye ekle:
- Sahil taşlık olduğu için {total_people} adet 'Deniz Ayakkabısı'
- Ortak buzdolabı yetersiz kalacağı için 'Büyük Boy Kamp Buzluğu/Termos'
- Çadırlarda elektrik var, içerde telefonu şarj etmek için {tent_count} adet 'Çoklu Priz / Uzatma Kablosu'

Sadece JSON formatında, {name, quantity, category (food/equipment)} dönecek bir liste ver.
```

### 4.2 API Anahtarı Yönetimi
- `OPENROUTER_API_KEY` **ortam değişkeni (env) olarak kullanılmaz**.
- Anahtar `campaigns.openrouter_api_key` alanında kamp bazında saklanır.
- Admin `/admin/settings` sayfasından anahtarı girer veya günceller.
- API yanıtlarında anahtar **asla düz metin dönmez** — yalnızca maskelenmiş gösterim (`sk-or-v1••••abcd`).
- AI istekleri atılırken anahtar veritabanından okunur; `process.env` kullanılmaz.
- Anahtar tanımlı değilse AI liste oluşturma engellenir ve kullanıcı Ayarlar'a yönlendirilir.

### 4.3 Admin Review Zorunlu
- AI yanıtı parse edilir → `items` tablosuna `is_published=false` olarak eklenir.
- Admin `/admin/items-review` sayfasında düzenler.
- "Yayınla" tüm draft item'ları `is_published=true` yapar.

---

## 5. UI/UX Kuralları

### 5.1 Mobile-First
- Arayüz cep telefonunda app gibi çalışır.
- 50+ yaş kullanıcılar için: büyük butonlar (`min-h-[48px]`), okunaklı yazı (`text-lg`).

### 5.2 Renk Kodlaması (Ana Liste)
| Durum | Renk |
|-------|------|
| Atanmamış eşya (`assigned_tent_id === null`) | Turuncu/sarı arka plan |
| Atanmış eşya (`assigned_tent_id !== null`) | Yeşil arka plan |

### 5.3 Bottom Navigation
Sabit alt bar — 4 sekme:
1. **Ana Liste** (`/items`)
2. **Çadırımın Görevleri** (`/my-tent`)
3. **Bütçe** (`/budget`)
4. **Chat** (`/chat`)

### 5.4 Chat
- WhatsApp benzeri arayüz
- Kendi mesajım → sağda
- Diğerleri → solda
- Sistem mesajları → ortada, gri

### 5.5 UI Dili
- Tüm kullanıcıya dönük metinler **Türkçe**

---

## 6. Veritabanı Şeması

### Tablolar

| Tablo | Ana Alanlar |
|-------|-------------|
| `campaigns` | id, name, location (default: Taş Kamping), start_date, end_date, admin_id, openrouter_api_key |
| `tents` | id, campaign_id, name |
| `users` | id, campaign_id, tent_id, name, age, role, username, password_hash |
| `menus` | id, campaign_id, day, meal_type (breakfast/dinner), description |
| `items` | id, campaign_id, name, quantity, category, added_by, assigned_tent_id, is_extra, is_published, price |
| `chat_messages` | id, campaign_id, user_id, message, is_system, created_at |

### İlişkiler
- `campaigns` → `tents`, `users`, `menus`, `items`, `chat_messages` (1:N)
- `tents` → `users` (1:N), `items.assigned_tent_id` (1:N)
- `users` → `items.added_by`, `chat_messages.user_id`

### Güvenlik
- **RLS kapalı** — yetkilendirme Next.js middleware + API katmanında
- Şifreler `password_hash` olarak bcrypt ile saklanır

### Realtime
- `chat_messages` tablosu Supabase Realtime publication'a eklenmiştir
- Supabase Dashboard → Database → Replication → `chat_messages` etkin olmalı

---

## 7. Ortam Değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
```

> **Not:** OpenRouter API anahtarı env'de tutulmaz. Admin paneli → Ayarlar'dan girilir.

---

## 8. Kodlama Konvansiyonları

- Import alias: `@/` → `src/`
- Server component varsayılan; client component sadece interaktivite gerektiğinde (`'use client'`)
- API rotaları `src/app/api/` altında
- Tipler `src/types/` altında; tek import: `@/types`
- Tailwind utility sınıfları; custom CSS minimum

---

## 9. Agent Sırası

1. Database & Types Agent
2. Backend & Auth Agent
3. UI/Layout Agent
4. AI/Logic Agent
5. Realtime Agent

Her agent bu dosyayı okur, işini yapar, sonraki agent için not bırakır.
