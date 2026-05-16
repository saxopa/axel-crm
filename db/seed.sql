-- ============================================================
-- Axel la main verte — Seed : types de massage
-- ============================================================

INSERT INTO massage_types (name, description, duration_minutes, price, sort_order) VALUES
  ('Massage bien-être', 'Séance de relaxation profonde, détente musculaire globale', 60, 70.00, 1),
  ('Massage profond', 'Travail musculaire en profondeur, libération des tensions', 75, 85.00, 2),
  ('Acupressure', 'Stimulation des points d''acupuncture par pression manuelle', 60, 75.00, 3),
  ('Processus BAZ', 'Programme personnalisé 21 jours — bilan + suivi holistique', 90, 120.00, 4),
  ('Séance découverte', 'Premier contact, évaluation du bien-être et des besoins', 45, 50.00, 5),
  ('Massage sportif', 'Récupération musculaire, préparation physique', 60, 80.00, 6),
  ('Relaxation guidée', 'Respiration + massage, état de relaxation profonde', 60, 70.00, 7);
