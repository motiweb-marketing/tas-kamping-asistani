-- Platform genel ayarları (singleton satır)
CREATE TABLE IF NOT EXISTS platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  openrouter_api_key TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO platform_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE platform_settings IS 'Platform sahibi ayarları — OpenRouter anahtarı vb.';
COMMENT ON COLUMN platform_settings.openrouter_api_key IS 'Pro kamplar için kullanılan OpenRouter API anahtarı';
