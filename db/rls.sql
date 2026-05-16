-- ============================================================
-- Row Level Security — Axel La Main Verte CRM
-- PostgreSQL 17 / Supabase
-- Utilisateur unique : Axel (authenticated)
-- Aucun accès anonymous, même en lecture
-- ============================================================

-- ------------------------------------------------------------
-- 1. Activer RLS sur les trois tables
-- ------------------------------------------------------------

ALTER TABLE massage_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions      ENABLE ROW LEVEL SECURITY;

-- Force RLS même pour le propriétaire de la table (table owner)
-- Supabase utilise le rôle postgres en interne ; cette option
-- garantit que RLS s'applique systématiquement.
ALTER TABLE massage_types FORCE ROW LEVEL SECURITY;
ALTER TABLE clients       FORCE ROW LEVEL SECURITY;
ALTER TABLE sessions      FORCE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2. Révoquer tous les accès au rôle anon (sécurité défense en profondeur)
-- Le rôle anon est celui utilisé par la clé publique anon key.
-- Même si quelqu'un trouve la clé, il n'aura aucun accès.
-- ------------------------------------------------------------

REVOKE ALL ON massage_types FROM anon;
REVOKE ALL ON clients       FROM anon;
REVOKE ALL ON sessions      FROM anon;

-- Révoquer aussi l'accès aux séquences (INSERT utilise nextval)
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- ------------------------------------------------------------
-- 3. Table : massage_types
-- Catalogue des types de massages (ex : suédois, sportif…)
-- ------------------------------------------------------------

-- SELECT
CREATE POLICY "massage_types: authenticated users only — select"
    ON massage_types
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT
CREATE POLICY "massage_types: authenticated users only — insert"
    ON massage_types
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE
CREATE POLICY "massage_types: authenticated users only — update"
    ON massage_types
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- DELETE
CREATE POLICY "massage_types: authenticated users only — delete"
    ON massage_types
    FOR DELETE
    TO authenticated
    USING (true);

-- ------------------------------------------------------------
-- 4. Table : clients
-- Données personnelles et de santé (RGPD sensible)
-- ------------------------------------------------------------

-- SELECT
CREATE POLICY "clients: authenticated users only — select"
    ON clients
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT
CREATE POLICY "clients: authenticated users only — insert"
    ON clients
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE
CREATE POLICY "clients: authenticated users only — update"
    ON clients
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- DELETE
CREATE POLICY "clients: authenticated users only — delete"
    ON clients
    FOR DELETE
    TO authenticated
    USING (true);

-- ------------------------------------------------------------
-- 5. Table : sessions
-- Historique des séances (lié à clients et massage_types)
-- ------------------------------------------------------------

-- SELECT
CREATE POLICY "sessions: authenticated users only — select"
    ON sessions
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT
CREATE POLICY "sessions: authenticated users only — insert"
    ON sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE
CREATE POLICY "sessions: authenticated users only — update"
    ON sessions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- DELETE
CREATE POLICY "sessions: authenticated users only — delete"
    ON sessions
    FOR DELETE
    TO authenticated
    USING (true);

-- ------------------------------------------------------------
-- 6. Vérification rapide (à exécuter dans l'éditeur SQL Supabase)
-- ------------------------------------------------------------

-- SELECT tablename, rowsecurity, forceroulsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('massage_types', 'clients', 'sessions');

-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;
