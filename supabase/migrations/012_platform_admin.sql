-- Platform sahibi (satış / operasyon) alanları
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS use_platform_ai BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS platform_notes TEXT;

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS owner_contact_name TEXT;

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS owner_contact_email TEXT;

COMMENT ON COLUMN campaigns.use_platform_ai IS 'true ise PLATFORM_OPENROUTER_API_KEY kullanılır (satıcı AI paketi)';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

COMMENT ON COLUMN users.last_login_at IS 'Son başarılı giriş zamanı';
