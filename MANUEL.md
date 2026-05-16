# Manuel d'utilisation — CRM Axel la main verte

> Document réservé à Axel. Si vous avez une question, contactez Alexis (votre développeur).

---

## Table des matières

1. [🌿 Bienvenue](#1--bienvenue)
2. [🔐 Connexion](#2--connexion)
3. [👥 Gestion des clients](#3--gestion-des-clients)
4. [💆 Types de massage](#4--types-de-massage)
5. [📅 Sessions](#5--sessions)
6. [📊 Statistiques](#6--statistiques)
7. [📧 Newsletter & RGPD](#7--newsletter--rgpd)
8. [🔗 Formulaire d'inscription public](#8--formulaire-dinscription-public)
9. [📬 Rappels email — Configuration Resend](#9--rappels-email--configuration-resend)
10. [🔒 Sécurité](#10--sécurité)
11. [🆘 Dépannage](#11--dépannage)

---

## 1. 🌿 Bienvenue

Bienvenue dans votre CRM personnel ! Cet outil a été créé spécialement pour vous permettre de gérer vos clients, vos séances de massage et vos revenus, sans vous prendre la tête.

**Accès :** [https://saxopa.github.io/axel-crm/](https://saxopa.github.io/axel-crm/)
Enregistrez ce lien dans vos favoris ou sur l'écran d'accueil de votre téléphone.

---

## 2. 🔐 Connexion

Pour accéder à votre espace, saisissez l'adresse email et le mot de passe qui vous ont été fournis lors de la mise en place.

**Mot de passe oublié ?** Cliquez sur "Mot de passe oublié" sur la page de connexion — vous recevrez un email de réinitialisation à votre adresse. Si vous ne recevez rien sous 5 minutes, vérifiez vos spams ou contactez Alexis.

---

## 3. 👥 Gestion des clients

### Créer un client

Cliquez sur **Clients** dans le menu, puis sur le bouton **Nouveau**. Renseignez les informations : prénom, nom, email, téléphone, date de naissance et notes libres.

### Modifier ou supprimer un client

Dans la liste, cliquez sur la ligne d'un client pour ouvrir sa fiche. Vous trouverez les boutons **Modifier** et **Supprimer** en haut à droite. La suppression est définitive — à utiliser avec prudence.

### Signification des champs

| Champ | Description |
|-------|-------------|
| Statut | `actif` = client suivi, `en attente` = demande formulaire public à valider, `inactif` = plus suivi |
| Contre-indications | Informations médicales importantes à consulter avant chaque séance (allergies, pathologies…) |
| Consentement email | Indique si le client accepte de recevoir vos newsletters |

### Clients "En attente"

Lorsqu'un client remplit le formulaire public, il apparaît avec le statut **En attente** (badge orange). Pour le valider, ouvrez sa fiche, cliquez sur **Modifier**, changez le statut en `actif` et enregistrez.

### Exporter la liste

En bas de la liste clients, le bouton **Exporter CSV** télécharge un fichier que vous pouvez ouvrir dans Excel ou Numbers.

---

## 4. 💆 Types de massage

Rendez-vous dans **Massages** pour gérer votre catalogue de prestations. Vous pouvez ajouter un type de massage avec sa durée par défaut (en minutes) et son tarif par défaut.

Ces valeurs seront pré-remplies automatiquement lorsque vous créerez une nouvelle session pour ce type de massage — gain de temps garanti !

---

## 5. 📅 Sessions

### Enregistrer une séance

Allez dans **Sessions** puis cliquez sur **Nouvelle session**. Sélectionnez le client, le type de massage, la date et confirmez le tarif.

### Intensité (1 à 5)

L'échelle d'intensité décrit la pression appliquée pendant la séance :
- **1** — Très léger (effleurage, relaxation)
- **2** — Léger
- **3** — Modéré
- **4** — Appuyé
- **5** — Très intense (thérapeutique, profond)

### Zones du corps

Cochez les zones travaillées pendant la séance (dos, nuque, jambes, bras, etc.). Ces informations sont visibles dans l'historique du client pour assurer un suivi précis.

---

## 6. 📊 Statistiques

Accédez aux **Statistiques** depuis le menu pour visualiser vos performances.

### Tableau de bord KPI

Trois indicateurs clés s'affichent en haut : votre chiffre d'affaires depuis le 1er janvier, votre meilleur mois, et le total de sessions enregistrées.

### Graphique des revenus mensuels

Le graphique à barres affiche vos 6 derniers mois. Plus la barre est haute, plus le mois a été productif. La valeur en euros est affichée au-dessus de chaque barre non nulle.

### Revenus par type de massage

Ce graphique en barres horizontales vous montre quels types de massage génèrent le plus de revenus — utile pour orienter votre communication.

---

## 7. 📧 Newsletter & RGPD

### Consentement email

Un client ne figure dans la liste Newsletter que s'il a explicitement coché la case de consentement (formulaire public ou saisie manuelle). C'est une obligation légale RGPD.

### Copier les emails

Sur la page **Newsletter**, le bouton **Copier tous les emails** copie la liste de tous les emails consentants dans votre presse-papiers, prête à coller dans Brevo, Mailchimp ou votre client email. Vous pouvez aussi copier un seul email ligne par ligne.

### Note légale

Ne transmettez jamais cette liste à des tiers. Les clients ont le droit de demander la suppression de leurs données à tout moment — supprimez leur fiche ou retirez leur consentement dans leur profil.

---

## 8. 🔗 Formulaire d'inscription public

### Lien à partager

Transmettez ce lien à vos clients (SMS, email, réseaux sociaux, site web) :

**`https://saxopa.github.io/axel-crm/inscription.html`**

### Ce qui se passe après la soumission

Lorsqu'un client remplit et envoie le formulaire, un nouveau profil est créé automatiquement dans votre CRM avec le statut **En attente**. Vous en serez alerté dans la liste clients (badge orange visible).

### Valider un client en attente

Ouvrez la fiche du client → **Modifier** → changez le statut de `pending` à `actif` → **Enregistrer**. Le client est maintenant pleinement actif dans votre base.

---

## 9. 📬 Rappels email — Configuration Resend

> Cette étape est optionnelle. Tout fonctionne parfaitement sans Resend. Il ajoute uniquement l'envoi automatique d'emails de rappel de séance.

### Qu'est-ce que Resend ?

Resend est un service d'envoi d'emails professionnel, gratuit jusqu'à **3 000 emails par mois**. C'est lui qui permet à votre CRM d'envoyer des rappels automatiques à vos clients.

### Étapes de configuration

1. Rendez-vous sur [resend.com](https://resend.com) et créez un compte gratuit.
2. Dans le tableau de bord Resend, allez dans **Settings → Domains**.
3. Ajoutez votre nom de domaine et suivez les instructions de vérification DNS (votre hébergeur peut vous aider). Si vous n'avez pas de domaine, utilisez `onboarding.resend.dev` pour les tests.
4. Une fois le domaine vérifié, allez dans **API Keys → Create API Key**.
5. Donnez-lui un nom (ex. "axel-crm") et copiez la clé — elle commence par `re_`.

   > ⚠️ Cette clé ne s'affiche qu'une seule fois. Notez-la précieusement.

6. Transmettez cette clé à **Alexis** (votre développeur). Il l'ajoutera comme secret GitHub sous le nom `RESEND_API_KEY`.

### Adresse d'expéditeur

Une fois configuré, vos emails partiront depuis : `noreply@[votre-domaine-vérifié]`

---

## 10. 🔒 Sécurité

Vos données sont stockées sur Supabase, une plateforme certifiée SOC 2, avec chiffrement en transit et au repos. Seul votre compte a accès à votre espace — personne d'autre ne peut voir vos clients.

**Ne partagez jamais votre mot de passe**, même avec Alexis — il n'en a pas besoin pour intervenir techniquement. Si vous pensez que votre compte est compromis, changez votre mot de passe immédiatement depuis la page de connexion.

---

## 11. 🆘 Dépannage

### Je n'arrive pas à me connecter

Vérifiez que vous utilisez exactement l'adresse email fournie lors de la mise en place (avec la même casse). Essayez "Mot de passe oublié" pour réinitialiser. Si le problème persiste, contactez Alexis.

### Les données ne s'affichent pas ou l'écran reste vide

Actualisez la page (F5 ou balayez vers le bas sur mobile). Vérifiez votre connexion internet. Si le problème dure plus de quelques minutes, contactez Alexis.

### Autre problème

Contactez Alexis en décrivant ce que vous essayiez de faire, ce que vous avez vu à l'écran, et si possible une capture d'écran. Plus c'est précis, plus vite c'est résolu !
