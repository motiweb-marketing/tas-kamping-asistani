-- Kamp kurulum profili (tip, su/çay, asistan cevapları)
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS camp_setup_profile JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN campaigns.camp_setup_profile IS 'Menü/kamp kurulum sihirbazı: kamp tipi, su planı, asistan transcript';
