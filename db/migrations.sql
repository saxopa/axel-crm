-- ============================================================
-- Migrations — Axel la main verte CRM
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Colonnes consentement + statut sur clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS email_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_consent_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending'));

-- 2. Champs détails de séance
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS intensity SMALLINT CHECK (intensity BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS body_zones TEXT[];

-- 3. Vue revenus mensuels
CREATE OR REPLACE VIEW revenue_by_month AS
SELECT
  date_trunc('month', session_date)::DATE AS month,
  COUNT(*) AS session_count,
  COALESCE(SUM(price_charged), 0) AS total_revenue,
  COALESCE(AVG(price_charged), 0) AS avg_price
FROM sessions
GROUP BY date_trunc('month', session_date)
ORDER BY month DESC;

-- 4. Vue revenus par type de massage
CREATE OR REPLACE VIEW revenue_by_massage_type AS
SELECT
  mt.id AS massage_type_id,
  mt.name AS massage_name,
  COUNT(s.id) AS session_count,
  COALESCE(SUM(s.price_charged), 0) AS total_revenue,
  COALESCE(AVG(s.duration_minutes), 0) AS avg_duration
FROM massage_types mt
LEFT JOIN sessions s ON s.massage_type_id = mt.id
GROUP BY mt.id, mt.name
ORDER BY session_count DESC;

-- 5. Accès aux vues pour le rôle authenticated
GRANT SELECT ON revenue_by_month TO authenticated;
GRANT SELECT ON revenue_by_massage_type TO authenticated;

-- 6. Permettre aux anonymes d'insérer via le formulaire public
--    (uniquement avec status = 'pending')
GRANT INSERT (first_name, last_name, email, phone, date_of_birth, notes, email_consent, email_consent_date, status)
  ON clients TO anon;

DROP POLICY IF EXISTS "clients: anon intake insert" ON clients;
CREATE POLICY "clients: anon intake insert"
  ON clients
  FOR INSERT
  TO anon
  WITH CHECK (status = 'pending');
