-- Taş Kamping Asistanı — İlk veritabanı şeması
-- Supabase SQL Editor'da veya migration olarak çalıştırın.

-- ---------------------------------------------------------------------------
-- Enum tipleri
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE meal_type AS ENUM ('breakfast', 'dinner');
CREATE TYPE item_category AS ENUM ('food', 'equipment');

-- ---------------------------------------------------------------------------
-- Tablolar
-- ---------------------------------------------------------------------------

-- Kamp organizasyonları
CREATE TABLE campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  location    TEXT NOT NULL DEFAULT 'Taş Kamping',
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  admin_id              UUID, -- users tablosu oluşturulduktan sonra FK eklenir
  openrouter_api_key    TEXT, -- Admin ayarlarından girilir, env'de tutulmaz
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT campaigns_date_check CHECK (end_date >= start_date)
);

-- Çadırlar (sorumluluk birimi)
CREATE TABLE tents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, name)
);

-- Kullanıcılar (basit kullanıcı adı / şifre — Supabase Auth kullanılmıyor)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  tent_id       UUID REFERENCES tents(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  age           INTEGER NOT NULL CHECK (age > 0 AND age < 120),
  role          user_role NOT NULL DEFAULT 'user',
  username      TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, username)
);

-- campaigns.admin_id → users FK (döngüsel bağımlılık çözümü)
ALTER TABLE campaigns
  ADD CONSTRAINT campaigns_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- Gün gün kamp menüsü
CREATE TABLE menus (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  day         DATE NOT NULL,
  meal_type   meal_type NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, day, meal_type)
);

-- Alışveriş / malzeme listesi
CREATE TABLE items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  quantity          TEXT NOT NULL DEFAULT '1',
  category          item_category NOT NULL,
  added_by          UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_tent_id  UUID REFERENCES tents(id) ON DELETE SET NULL,
  is_extra          BOOLEAN NOT NULL DEFAULT false,
  is_published      BOOLEAN NOT NULL DEFAULT true,
  price             NUMERIC(10, 2) DEFAULT 0 CHECK (price >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kamp sohbeti
CREATE TABLE chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  message     TEXT NOT NULL,
  is_system   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- İndeksler
-- ---------------------------------------------------------------------------

CREATE INDEX idx_tents_campaign_id       ON tents(campaign_id);
CREATE INDEX idx_users_campaign_id       ON users(campaign_id);
CREATE INDEX idx_users_tent_id           ON users(tent_id);
CREATE INDEX idx_menus_campaign_id       ON menus(campaign_id);
CREATE INDEX idx_items_campaign_id       ON items(campaign_id);
CREATE INDEX idx_items_assigned_tent_id  ON items(assigned_tent_id);
CREATE INDEX idx_items_is_published      ON items(campaign_id, is_published);
CREATE INDEX idx_chat_messages_campaign  ON chat_messages(campaign_id, created_at);

-- ---------------------------------------------------------------------------
-- Realtime (Chat için — Supabase Dashboard'da da etkinleştirilebilir)
-- ---------------------------------------------------------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ---------------------------------------------------------------------------
-- RLS kapalı (basit auth — uygulama katmanında kontrol)
-- ---------------------------------------------------------------------------

ALTER TABLE campaigns     DISABLE ROW LEVEL SECURITY;
ALTER TABLE tents         DISABLE ROW LEVEL SECURITY;
ALTER TABLE users         DISABLE ROW LEVEL SECURITY;
ALTER TABLE menus         DISABLE ROW LEVEL SECURITY;
ALTER TABLE items         DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
