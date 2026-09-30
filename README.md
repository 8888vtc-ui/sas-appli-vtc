# VTC Pro Console SaaS

> **Le premier SaaS VTC propulsé par l'Intelligence Artificielle** — CRM automatisé, Comptabilité, Documents légaux, et génération de prospects B2B IA.  
> Conforme au décret du 6 août 2025 (Art. R.3122-1 Code des transports) et à l'URSSAF.

---

## 🎯 Objectif

Fournir aux flottes de chauffeurs VTC et aux indépendants un **ERP / SaaS tout-en-un de nouvelle génération** pour :
- **CRM & Prospection IA :** Trouver de nouveaux clients (hôtels, entreprises) et gérer la relation client.
- **Opérations :** Créer des courses (MAD, Transferts) et générer les bons légaux instantanément avec la localisation dynamique.
- **Finances & Comptabilité :** Gérer les Frais Réels (notes de frais scannées par l'IA) ou le barème URSSAF (Indemnités kilométriques).
- **Conformité & Sécurité :** Un coffre-fort numérique pour les "Boers" avec mode "Contrôle Routier".

---

## 🚀 Fonctionnalités "Killer Features"

### ✨ Intelligence Artificielle Embarquée (Choix Libre : Gemini / OpenAI / Anthropic)
- **Générateur de Prospects IA :** L'utilisateur tape sa cible ("Hôtels 5 étoiles à Cannes") et l'IA cherche sur le web, extrait les téléphones, rédige un conseil d'approche et injecte les 5 prospects directement dans la base de données.
- **Scanner de Notes de Frais IA (Multimodal) :** Prenez un ticket de caisse en photo. L'IA lit l'image en 3 secondes et remplit automatiquement la date, le montant, le taux de TVA récupérable et la catégorie de dépense.

### 👥 CRM VTC Avancé
- Création automatique des fiches clients lors de la saisie d'une course.
- Suggestions intelligentes lors de la frappe d'un nom.
- Historique de facturation et de CA par client.
- Export des listes et tags (Prospect vs Client).

### 💰 Hub Financier & Comptable
- **Adaptation au statut du chauffeur :** 
  - *Option Véhicule Personnel :* Saisie des compteurs kilométriques et calcul automatique de la déduction URSSAF officielle 2025 (selon les chevaux fiscaux).
  - *Option Véhicule de Société :* Scan des tickets (Carburant, péage, entretien) avec extraction de TVA.
- Export CSV complet pour l'expert-comptable.

### 📝 Gestion des Courses & Facturation Légale
- Création de Bons de commande et de contrats de Mise à Disposition (MAD).
- Champs légaux strictement obligatoires (Secteur MAD, N° Carte Pro, Téléphone).
- Raccourcis de lieux automatiques basés sur l'adresse de l'entreprise (ex: propose *CDG / Orly* à Paris, *Nice T2* à Cannes).
- Facturation PDF avec gestion TVA automatique (Assujetti ou Franchise en base).

### 🔒 Sécurité : Authentification & Multi-tenant (Supabase)
- Inscription et authentification gérées par **Supabase**.
- Sécurisation avancée du mot de passe oublié (Flux PKCE Proof Key for Code Exchange).
- Possibilité de gérer une flotte (Ajout de plusieurs chauffeurs dans l'équipe).

### 🛡️ Le Coffre-Fort Documentaire (Vault)
- Centralisation des documents (Kbis, Carte Pro, Assurances).
- **Mode Contrôle Routier :** Une page d'urgence qui masque tout le SaaS (finances, clients) et affiche une vue plein écran avec les macarons et assurances pour les forces de l'ordre.

---

## 🛠️ Stack Technique

| Technologie | Usage |
|---|---|
| **React 19** | Framework UI |
| **Vite 8** | Bundler ultra-rapide |
| **Supabase** | Backend-as-a-Service (PostgreSQL, Auth, Storage) |
| **Framer Motion** | Animations fluides, modales dynamiques |
| **Tailwind CSS 4** | Design System (Glassmorphism, Dark Mode) |
| **jsPDF** | Génération de PDF 100% côté client |
| **Google Gemini / OpenAI / Anthropic** | Moteur LLM et Vision pour les scans et prospects |

---

## 📁 Architecture Modulaire

Le projet est entièrement découpé en composants pour un maintien et une scalabilité totale :
- `/src/pages/` : Les grandes vues (Dashboard, CRM, FinancesHub, Vault...).
- `/src/components/` : Modales, boutons, mises en page (Layout PWA).
- `/src/lib/` : Services (API IA, Générateurs PDF, Auth Supabase).
- `/src/types/` : Typage TypeScript strict des objets métiers (Trip, Expense, Contact).

---

## ⚖️ Conformité VTC France

- **Bon de commande** conforme à l'arrêté du 6 août 2025.
- **TVA** : Prise en compte de l'Art. 293 B CGI ou assujettissement classique.
- **Indemnités Kilométriques** : Barème URSSAF 2025 officiel intégré.
- **Loi Thévenoud** : Obligations de réservation préalable respectées.
- **Facturation Électronique (B2B)** : Génération PDF 100% conforme à la législation actuelle. Architecture prête pour l'intégration de la norme **Factur-X** (XML embarqué) en prévision des obligations légales 2026/2027.

---

*Ce projet représente l'état de l'art du SaaS dédié au transport de personnes. Développé pour automatiser la gestion, augmenter le CA via l'IA, et assurer une sérénité comptable.*
