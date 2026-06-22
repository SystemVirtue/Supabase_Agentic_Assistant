CREATE SCHEMA IF NOT EXISTS extensions;

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS world_state (
  entity_id UUID NOT NULL,
  attribute TEXT NOT NULL,
  value JSONB NOT NULL,
  confidence DOUBLE PRECISION NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  state_type TEXT NOT NULL CHECK (state_type IN ('fact', 'belief')),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ,
  source_event_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  evidence_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (valid_until IS NULL OR valid_until > valid_from)
);

ALTER TABLE world_state
  DROP CONSTRAINT IF EXISTS no_overlap;

ALTER TABLE world_state
  ADD CONSTRAINT no_overlap
  EXCLUDE USING GIST (
    entity_id WITH =,
    attribute WITH =,
    tstzrange(valid_from, COALESCE(valid_until, 'infinity'::timestamptz), '[)') WITH &&
  );

CREATE INDEX IF NOT EXISTS world_state_current_idx
  ON world_state (entity_id, attribute, state_type)
  WHERE valid_until IS NULL;

CREATE INDEX IF NOT EXISTS world_state_value_gin_idx
  ON world_state USING GIN (value);

CREATE TABLE IF NOT EXISTS evidence (
  evidence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_event_id UUID,
  inference_method TEXT NOT NULL,
  entity_id UUID,
  attribute TEXT,
  raw_value JSONB NOT NULL,
  confidence DOUBLE PRECISION NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  observed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS evidence_entity_attribute_idx
  ON evidence (entity_id, attribute, observed_at DESC);

CREATE TABLE IF NOT EXISTS sensors (
  sensor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  location TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  trust_weight DOUBLE PRECISION NOT NULL DEFAULT 1.0 CHECK (trust_weight >= 0.0),
  active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entities_type_name_idx
  ON entities (type, name);

CREATE INDEX IF NOT EXISTS entities_attributes_gin_idx
  ON entities USING GIN (attributes);

CREATE TABLE IF NOT EXISTS relationships (
  source_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  rel_type TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ,
  PRIMARY KEY (source_id, target_id, rel_type),
  CHECK (valid_until IS NULL OR valid_until > valid_from)
);

CREATE INDEX IF NOT EXISTS relationships_target_idx
  ON relationships (target_id, rel_type);

CREATE INDEX IF NOT EXISTS relationships_properties_gin_idx
  ON relationships USING GIN (properties);

ALTER TABLE world_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;

