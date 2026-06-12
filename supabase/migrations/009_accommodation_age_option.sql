-- Konaklama: tek fiyat veya yaşa göre yetişkin/çocuk ayrımı (opsiyonel)

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS accommodation_use_age_pricing BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accommodation_child_age_max INTEGER NOT NULL DEFAULT 15
    CHECK (accommodation_child_age_max >= 0 AND accommodation_child_age_max <= 99);

COMMENT ON COLUMN campaigns.accommodation_use_age_pricing IS 'true: yetişkin/çocuk ayrı ücret; false: herkes yetişkin ücreti';
COMMENT ON COLUMN campaigns.accommodation_child_age_max IS 'Bu yaşın altı çocuk konaklama ücreti (yaş ayrımı açıkken)';
