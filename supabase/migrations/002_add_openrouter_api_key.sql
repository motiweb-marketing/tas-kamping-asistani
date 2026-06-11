-- OpenRouter API anahtarı kamp bazında saklanır (env değil, admin ayarlarından girilir)
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS openrouter_api_key TEXT;

COMMENT ON COLUMN campaigns.openrouter_api_key IS
  'Admin tarafından ayarlar sayfasından girilen OpenRouter API anahtarı. Sadece sunucu tarafında okunur.';
