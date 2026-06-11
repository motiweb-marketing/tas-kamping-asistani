-- Kamp görevleri / nöbet planı

CREATE TYPE duty_period AS ENUM ('breakfast', 'dinner');
CREATE TYPE duty_kind AS ENUM ('meal_prep', 'fire', 'tea', 'dishes');

CREATE TABLE camp_duties (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  camp_day_number     INTEGER NOT NULL,
  slot_date           DATE NOT NULL,
  period              duty_period NOT NULL,
  duty_kind           duty_kind NOT NULL,
  title               TEXT NOT NULL,
  is_departure        BOOLEAN NOT NULL DEFAULT false,
  assigned_tent_id    UUID REFERENCES tents(id) ON DELETE SET NULL,
  assigned_user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  release_requested   BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, slot_date, period, duty_kind)
);

CREATE INDEX idx_camp_duties_campaign ON camp_duties(campaign_id, slot_date);
CREATE INDEX idx_camp_duties_tent ON camp_duties(assigned_tent_id);

ALTER PUBLICATION supabase_realtime ADD TABLE camp_duties;

ALTER TABLE camp_duties DISABLE ROW LEVEL SECURITY;
