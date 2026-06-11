-- Tesis kişi başı konaklama ücreti (yetişkin / çocuk ayrı)

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS adult_accommodation_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS child_accommodation_fee NUMERIC(10, 2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN campaigns.adult_accommodation_fee IS 'Kişi başı yetişkin (15+) konaklama ücreti (₺)';
COMMENT ON COLUMN campaigns.child_accommodation_fee IS 'Kişi başı çocuk (15 altı) konaklama ücreti (₺)';
