# Checklist Sécurité — Axel La Main Verte CRM

Données de santé clients → obligations RGPD renforcées (article 9).
Cocher chaque point avant mise en production.

---

## Supabase

- [ ] **RLS activé** sur les 3 tables (`db/rls.sql` appliqué via SQL Editor)
- [ ] **Sign-up public désactivé** (Dashboard → Authentication → Providers → Email → "Enable sign-ups" = OFF)
- [ ] **Compte Axel créé manuellement** avec un mot de passe ≥ 16 caractères
- [ ] **service_role key absente du frontend** — seule la clé `anon` figure dans `config.js`
- [ ] **Providers inutiles désactivés** (Phone, OAuth social) — Email uniquement

## GitHub Pages

- [ ] **Fichier `_headers` présent** à la racine du repo → Content-Security-Policy active
- [ ] **config.js absent du repo** (ajouté dans `.gitignore`) — l'anon key ne doit pas être commitée en clair
- [ ] **HTTPS uniquement** — GitHub Pages l'active par défaut, vérifier dans Settings → Pages → "Enforce HTTPS"

## RGPD

- [ ] **Mentions légales** accessibles depuis l'interface (données traitées, durée de conservation)
- [ ] **Pas de transfert hors UE** — Supabase région EU West (Frankfurt) sélectionnée à la création du projet

---

> Dernier contrôle recommandé : tous les 6 mois ou à chaque mise à jour majeure.
