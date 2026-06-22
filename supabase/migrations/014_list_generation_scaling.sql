-- AI liste oluşturma bağlamı ve kişi sayısına göre ölçekleme
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS list_generation_context JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS list_baseline_headcount INTEGER,
  ADD COLUMN IF NOT EXISTS list_baseline_adults INTEGER,
  ADD COLUMN IF NOT EXISTS list_baseline_children INTEGER,
  ADD COLUMN IF NOT EXISTS list_generated_at TIMESTAMPTZ;

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS scales_with_people BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS quantity_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS quantity_unit_text TEXT,
  ADD COLUMN IF NOT EXISTS baseline_headcount INTEGER;

COMMENT ON COLUMN campaigns.list_generation_context IS 'AI liste oluşturma öncesi admin cevapları (pişirme, diyet vb.)';
COMMENT ON COLUMN campaigns.list_baseline_headcount IS 'Son liste oluşturma/ölçekleme anındaki kişi sayısı';
COMMENT ON COLUMN items.scales_with_people IS 'Kişi sayısı değişince miktar otomatik güncellenir';
COMMENT ON COLUMN items.quantity_amount IS 'Sayısal miktar (ölçekleme için)';
COMMENT ON COLUMN items.baseline_headcount IS 'Bu miktarın hesaplandığı kişi sayısı';
