-- Dinamik liste bölümleri (kamp / çadır / kişisel)
CREATE TABLE IF NOT EXISTS list_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  list_scope item_list_scope NOT NULL,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_list_sections_campaign_scope
  ON list_sections(campaign_id, list_scope);

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES list_sections(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_items_section_id ON items(section_id);

COMMENT ON TABLE list_sections IS 'Admin tanımlı liste kategorileri (Baharatlar, Giyecek vb.)';
COMMENT ON COLUMN items.section_id IS 'list_sections FK — admin gruplama';
