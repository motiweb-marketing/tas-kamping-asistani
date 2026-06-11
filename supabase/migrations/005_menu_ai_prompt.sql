-- AI menü düzenleme talimatı ve yayınlanmış menü

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS menu_ai_prompt TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS published_menu TEXT;
