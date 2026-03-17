-- ============================================================
-- Korean Tutor v2 — Auth, Units, Progress Schema
-- Run this in Supabase SQL Editor after schema_v1
-- ============================================================

-- ── Units (curriculum structure) ─────────────────────────────
CREATE TABLE units (
  id            SERIAL PRIMARY KEY,
  unit_number   INTEGER UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  theme         TEXT NOT NULL,
  description   TEXT,
  unlock_score  INTEGER DEFAULT 70
);

-- ── Links content items to units ─────────────────────────────
CREATE TABLE unit_items (
  id         SERIAL PRIMARY KEY,
  unit_id    INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  item_type  TEXT NOT NULL CHECK (item_type IN ('vocab','grammar','idiom','business','article','quiz')),
  item_id    INTEGER NOT NULL
);

-- ── Per-item progress per user ────────────────────────────────
CREATE TABLE user_progress (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type       TEXT NOT NULL,
  item_id         INTEGER NOT NULL,
  correct_count   INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_seen       TIMESTAMPTZ DEFAULT NOW(),
  next_due        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, item_type, item_id)
);

-- ── Unit completion per user ──────────────────────────────────
CREATE TABLE unit_completion (
  id           SERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id      INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  best_score   INTEGER DEFAULT 0,
  completed    BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, unit_id)
);

-- ── Row-level security ────────────────────────────────────────
ALTER TABLE units         ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_completion ENABLE ROW LEVEL SECURITY;

-- Units + unit_items: public read
CREATE POLICY "units_public_read"      ON units      FOR SELECT USING (true);
CREATE POLICY "unit_items_public_read" ON unit_items  FOR SELECT USING (true);

-- user_progress: users can only read/write their own rows
CREATE POLICY "progress_select" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_insert" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_update" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- unit_completion: users can only read/write their own rows
CREATE POLICY "completion_select" ON unit_completion FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "completion_insert" ON unit_completion FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "completion_update" ON unit_completion FOR UPDATE USING (auth.uid() = user_id);

-- Also enable RLS on existing content tables (public read)
ALTER TABLE grammar          ENABLE ROW LEVEL SECURITY;
ALTER TABLE idioms           ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab            ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grammar_public"   ON grammar          FOR SELECT USING (true);
CREATE POLICY "idioms_public"    ON idioms           FOR SELECT USING (true);
CREATE POLICY "business_public"  ON business_phrases FOR SELECT USING (true);
CREATE POLICY "vocab_public"     ON vocab            FOR SELECT USING (true);
CREATE POLICY "articles_public"  ON articles         FOR SELECT USING (true);
CREATE POLICY "quiz_public"      ON quiz_questions   FOR SELECT USING (true);
