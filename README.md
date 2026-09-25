# VTC Pro Console

> **Outil professionnel complet de gestion VTC** — Bons de commande, facturation, coffre-fort documentaire, accueil aéroport.  
> Conforme au décret du 6 août 2025 (Art. R.3122-1 Code des transports).

---

## 🎯 Objectif

Fournir aux chauffeurs VTC indépendants un outil **tout-en-un** pour :
- Gérer leurs courses et leur planning
- Générer automatiquement les **documents réglementaires** (bons de commande, contrats MAD, factures)
- Centraliser leurs **documents professionnels** (carte pro, assurance, Kbis...) en cas de contrôle routier
- Accueillir leurs clients à l'aéroport avec un **panneau personnalisé**

Inspiré de [bonvtc.fr](https://bonvtc.fr), mais **plus complet** avec le coffre-fort documentaire, le mode contrôle, la mise à disposition, et les statistiques intégrées.

---

## ✅ Fonctionnalités Implémentées

### 📊 Dashboard Intelligent
- Statistiques en temps réel : CA du jour, de la semaine, du mois
- Compteur de courses planifiées, transferts et mises à disposition
- **Recherche** par nom client, lieu ou numéro de vol
- **Filtrage** par statut (Planifiée, En cours, Terminée, Facturée, Annulée)
- Workflow de statut complet : `Planifiée → En cours → Terminée → Facturée`

### 📝 Bon de Commande (Décret août 2025)
- Génération PDF conforme à l'arrêté du 6 août 2025
- Toutes les mentions réglementaires Art. R.3122-1
- Informations exploitant, chauffeur, véhicule, client
- Zones de signature exploitant + client

### 💰 Facturation Professionnelle
- Numérotation séquentielle légale : `F-YYYY-NNNN`
- Gestion TVA : **franchise en base** (art. 293 B CGI) ou **assujetti 10%**
- Mentions obligatoires (pénalités de retard, escompte)
- **Page Historique Factures** avec suivi du statut de paiement (Payée / En attente)
- Total CA cumulé en temps réel

### ⏱️ Mise à Disposition (MAD)
- Contrat PDF avec conditions de mise à disposition
- Durée, zone géographique, clauses de dépassement
- Responsabilité assurance RC Pro

### 🔒 Coffre-Fort Documentaire
- **12 types de documents** pré-configurés en 3 catégories :
  - 🧑 **Conducteur** : Carte Pro VTC, Permis, Certificat Médical, Formation Continue
  - 🚗 **Véhicule** : Carte Grise, Assurance RC Pro, Contrôle Technique, Crit'Air
  - 🏢 **Administratif** : Registre VTC, Kbis/INSEE, URSSAF, Attestation de Vigilance
- Upload de fichiers (photo, PDF, scan)
- **Barre de conformité** avec score en pourcentage
- Alertes visuelles : document expiré (rouge), expire bientôt < 30j (orange)
- **🛡️ Mode Contrôle** : vue plein écran spéciale contrôle routier affichant tous les documents avec statut visuel (✓/✗)

### ✈️ Sign Mode Aéroport
- Affichage plein écran personnalisé
- Nom du client en très grand format + logo entreprise
- Numéro de vol + heure + lieu de prise en charge
- Message d'accueil et couleur personnalisables

### ⚙️ Paramètres Complets
- **Entreprise** : Nom, adresse, téléphone, email, SIRET, SIREN, registre VTC, régime TVA
- **Chauffeur** : Nom, carte pro VTC, téléphone
- **Véhicule** : Modèle, immatriculation
- **Accueil** : Message, couleur du logo

### 💾 Persistance
- Toutes les données sauvegardées dans `localStorage`
- Clés : `vtc_trips`, `vtc_settings`, `vtc_legal_docs`, `vtc_invoices`, `vtc_invoice_counter`

---

## 🛠️ Stack Technique

| Technologie | Version | Usage |
|---|---|---|
| React | 19.2.6 | Framework UI |
| Vite | 8.0.12 | Bundler + dev server |
| TypeScript | 6.0.2 | Typage statique |
| Tailwind CSS | 4.3.0 | Utilitaires CSS (via @tailwindcss/postcss) |
| Framer Motion | 12.40.0 | Animations fluides |
| jsPDF | 4.2.1 | Génération de documents PDF |
| date-fns | 4.3.0 | Formatage et calculs de dates |
| Lucide React | 1.16.0 | Iconographie |

---

## 📁 Architecture du Projet

```
SAS APPLI VTC/
├── index.html              # Shell HTML (SEO + PWA meta tags)
├── package.json            # Dépendances & scripts
├── vite.config.ts          # Configuration Vite
├── postcss.config.js       # PostCSS + @tailwindcss/postcss
├── tsconfig.app.json       # TypeScript (ES2023, verbatimModuleSyntax)
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
└── src/
    ├── main.tsx            # Point d'entrée React
    ├── App.tsx             # Composant principal (806 lignes)
    ├── index.css           # Design system glassmorphism + Tailwind v4
    │
    ├── types/
    │   └── index.ts        # Interfaces : Trip, AppSettings, LegalDocument, InvoiceRecord, View
    │
    ├── lib/
    │   ├── pdfGenerators.ts   # Moteur PDF : Bon de Commande, MAD, Facture
    │   └── utils.ts           # Helpers : dates, stats, conformité vault, formatage €
    │
    └── assets/
        └── airport-bg.png  # Image de fond Sign Mode
```

---

## 🚀 Installation & Développement

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en développement (hot-reload)
npm run dev

# 3. Build production
npm run build

# 4. Prévisualiser le build
npm run preview

# 5. Lint
npm run lint
```

---

## ⚖️ Conformité Légale

- **Bon de commande** conforme à l'arrêté du 6 août 2025 (Art. R.3122-1 Code des transports)
- **Facturation** avec mentions obligatoires (pénalités de retard, escompte)
- **TVA** : gestion franchise en base (art. 293 B CGI) ou assujetti 10%
- **Loi Thévenoud** — L.3120-1 et suivants du Code des transports
- **Coffre-fort** : centralisation des documents pour contrôle routier (carte pro, assurance, Kbis, contrôle technique)

---

## 🗺️ Roadmap — Améliorations Futures

### Priorité Haute
- [ ] Découper `App.tsx` en composants modulaires (pages + composants réutilisables)
- [ ] Migrer le stockage des documents vers IndexedDB (pour éviter la limite localStorage)
- [ ] Ajouter un système d'authentification (PIN / mot de passe)
- [ ] Export des données (CSV / PDF récapitulatif)

### Priorité Moyenne
- [ ] Historique / archivage des courses passées
- [ ] Envoi de confirmation par SMS ou email au client
- [ ] Mode hors-ligne (PWA avec Service Worker)
- [ ] Impression directe des bons de commande

### Priorité Basse
- [ ] Géolocalisation automatique du lieu de prise en charge
- [ ] Page web publique de la société (like bonvtc.fr)
- [ ] Multi-véhicule / multi-chauffeur
- [ ] Intégration calendrier (Google Calendar / Outlook)

---

*Développé pour une gestion VTC efficace et une sérénité administrative totale. — Réalisé par David Chemla*
