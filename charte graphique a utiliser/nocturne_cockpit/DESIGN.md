---
name: Nocturne Cockpit
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#b9cbb9'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#849585'
  outline-variant: '#3b4b3d'
  surface-tint: '#00e478'
  primary: '#f1ffef'
  on-primary: '#003919'
  primary-container: '#00ff87'
  on-primary-container: '#007138'
  inverse-primary: '#006d36'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#fffaf8'
  on-tertiary: '#472a00'
  tertiary-container: '#ffd8ad'
  on-tertiary-container: '#8a5700'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#60ff98'
  primary-fixed-dim: '#00e478'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005227'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Geist
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  metric-huge:
    fontFamily: Geist
    fontSize: 52px
    fontWeight: '800'
    lineHeight: 56px
  metric-huge-mobile:
    fontFamily: Geist
    fontSize: 38px
    fontWeight: '800'
    lineHeight: 44px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

The design system establishes a high-performance, executive HUD (Heads-Up Display) tailored for independent luxury VTC drivers operating during both day and demanding night shifts. The design style combines an uncompromising **Ultra-Dark Glassmorphic** aesthetic with tactical ergonomics: deep optical blacks (#050505), multi-layered frosted glass panels, hairline translucent borders, and focused chromatic signals.

The emotional signature conveys absolute operational composure, executive discretion, and financial command. Every interaction must accommodate one-handed operation on a dashboard mount or single-hand thumb reach, eliminating visual noise and ambiguous gestures while driving. High-contrast typography and glowing system indicators ensure immediate legibility under changing ambient lighting (streetlamps, tunnel crossings, direct sunlight).

## Colors

The palette operates on a strict functional stratification against void-grade blacks:

- **Obsidian Foundations (Neutrals):**
  - Canvas Root: `#050505` (prevents OLED bleed, minimizes cabin light pollution).
  - Surface Glass Base: `#0A0A0A` at 70% opacity with 20px blur.
  - Surface Elevated: `#121212` at 85% opacity with 1px border `rgba(255, 255, 255, 0.08)`.
  - Contrast Borders: Hairline `rgba(255, 255, 255, 0.12)` for panel perimeter definition.

- **Status & Telemetry (Primary - Neon Mint / Tactical Green):**
  - Core: `#00FF87` | Auxiliary: `#10B981`.
  - Reserved strictly for operational active states: "En Service" (Online), dispatch accepted, incoming revenue positive delta, and vehicle ready states. Accompanied by a subtle radial emission glow (`rgba(0, 255, 135, 0.2)`).

- **Navigation & Tactics (Secondary - Electric Azure):**
  - Core: `#3B82F6` | Deep State: `#2563EB`.
  - Governs interactive controls, route changes, recalculation triggers, client contact actions, and primary confirmations.

- **Prestige & Tier Status (Tertiary - Imperial Gold / Amber):**
  - Core: `#F59E0B` | Deep Tone: `#D97706`.
  - Represents VIP clients, private concierge bookings, surge multipliers, high-value corporate trips, and fleet bonuses.

- **Intelligence & Autopilot (Accent - Electric Indigo / Violet):**
  - Accent: `#6366F1` | Aura: `#8B5CF6`.
  - Applied specifically to the Copilot AI assistant, predictive route insights, heatmaps, and automatic earnings forecasting.

## Typography

The type architecture relies exclusively on **Geist**, leveraging its geometric neutrality, monospaced numerals, and high-aperture legibility under severe low-light conditions.

Key implementation rules:
- **Numerical Telemetry:** All dynamic variables (fares, timers, speeds, distances) must use tabular numbers (`font-variant-numeric: tabular-nums`) to prevent layout shift during high-frequency GPS updates.
- **Glanceability:** Important metrics (e.g., hourly gross revenue, distance to pickup) utilize `metric-huge` or `display-lg`, paired with micro-labels in uppercase `label-sm` with +0.08em letter tracking for zero-latency recognition.
- **Text Contrast:** Base text is rendered in `rgba(255, 255, 255, 0.94)`, secondary metadata in `rgba(255, 255, 255, 0.62)`, and disabled or baseline framing in `rgba(255, 255, 255, 0.38)`. No critical driving data is placed below 13px.

## Layout & Spacing

The layout is built mobile-first, prioritizing vehicle-mount reachability.

- **Thumb Zone Anchor:** The lower 45% of the mobile viewport is reserved for interactive commands, toggle switches, and route selectors. Primary operational controls never reside in the top screen corners.
- **HUD Metric Zone:** The top 30% of the display contains telemetry, active mission status, and Copilot AI advisories.
- **Target Dimensions:** All interactive targets strictly enforce a minimum height and width of 56px (`min-h-[56px]`), ensuring confident triggering during road vibrations.
- **Grid Architecture:** 
  - Mobile (up to 640px): Single-column, 16px lateral margin, vertical stacking with 12px card gaps.
  - Tablet/Landscape Cockpit Mount (641px - 1024px): 2-column asymmetric split (60% active map/telemetry HUD, 40% dispatch, financial queue, and AI insights), with 16px gutters.
  - Desktop Backoffice (>1024px): 12-column fluid grid, 24px margins, max-width 1440px centered container.

## Elevation & Depth

Visual hierarchy uses frosted glassmorphism rather than heavy drop shadows to preserve pure black levels on automotive displays.

- **Level 0 (Chassis/Base):** Deep `#050505` backdrop.
- **Level 1 (Glass Tiles & Cards):** Background `rgba(255, 255, 255, 0.04)` combined with `backdrop-filter: blur(24px)` and a subtle interior highlight: `1px solid rgba(255, 255, 255, 0.08)`.
- **Level 2 (Active Panels / Floating Action Sheets):** Background `rgba(18, 18, 18, 0.78)` with `backdrop-filter: blur(32px)`, bordered by `rgba(255, 255, 255, 0.14)`. Ambient drop shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.7)`.
- **Level 3 (Modal Alerts / Urgent Dispatch / VIP Offers):** Background `rgba(24, 24, 27, 0.94)` with `backdrop-filter: blur(40px)`. High-priority borders take on color-matched luminescent halos:
  - Tactical Request: Hairline `#3B82F6` with outer glow `0 0 24px rgba(59, 130, 246, 0.25)`.
  - VIP Booking: Hairline `#F59E0B` with outer glow `0 0 24px rgba(245, 158, 11, 0.25)`.
  - Copilot Dialogue: Hairline `#6366F1` with outer glow `0 0 24px rgba(99, 102, 241, 0.25)`.

## Shapes

The geometry uses a balanced modern radius profile (`roundedness: 2` = 0.5rem base) with strategic variations:
- Cards, modal containers, and glass panels use `1rem` (16px) corners to preserve a sleek, premium tech silhouette without appearing toy-like.
- Full-width operational switches (e.g., the primary "Glisser pour passer EN SERVICE" slider) use pill-shaped containers (`9999px`) to immediately convey physical drag ergonomics.
- Status pips, notification badges, and micro-metrics employ subtle 6px corner radii to maintain tight, clean data density.

## Components

### 1. Primary Service Switch ("Cockpit Ignition")
- Pill-shaped slider component with a minimum 64px height.
- Inactive state: Deep obsidian background (`rgba(255, 255, 255, 0.06)`), label "HORS SERVICE" in subdued white (`rgba(255, 255, 255, 0.4)`).
- Active state ("EN SERVICE"): Neon green glow track (`rgba(0, 255, 135, 0.15)`), active thumb bathed in `#00FF87` with an intense glow shadow (`0 0 20px rgba(0, 255, 135, 0.45)`). Slide-to-confirm interaction prevents pocket or accidental touch triggers while driving.

### 2. Tactical & Action Buttons
- Height: Minimum 56px for tactile hit reliability.
- **Electric Action (Navigation/Accept):** Solid `#3B82F6` filling with crisp white `label-lg` bold typography. Active state triggers 0.98 scale compress with an intensified neon edge.
- **Secondary Ghost:** `rgba(255, 255, 255, 0.05)` background, `1px solid rgba(255, 255, 255, 0.12)`, text `#FFFFFF`.
- **Emergency / Decline Action:** Deep crimson glass tint (`rgba(239, 68, 68, 0.12)`) with a hairline `#EF4444` border.

### 3. VIP / Prestige Cards
- Encased in a double-wall glass treatment: base card `rgba(18, 18, 18, 0.65)` layered with a top-to-bottom subtle gradient border tinted with `#F59E0B`.
- Integrated badges display gold micro-badges: `text-[#F59E0B]`, background `rgba(245, 158, 11, 0.12)`, `border: 1px solid rgba(245, 158, 11, 0.3)`.

### 4. Copilot AI Assistant Floating Bubble & Card
- Frosted indigo-spectrum backplate with a continuous breathing border pulse (`#6366F1` to `#8B5CF6`).
- Displays concise, bulleted strategic recommendations (e.g., "Forte demande attendue : Sortie Opéra Garnier dans 12 min (+1.6x)"). Dismissable via quick horizontal swipe.

### 5. Input Fields & Ride Notes
- Minimum 54px height, background `rgba(255, 255, 255, 0.03)`, border `rgba(255, 255, 255, 0.1)`. Focus state illuminates field borders with `#3B82F6` and adds an internal soft blur. Text size remains at 16px to prevent iOS auto-zoom behavior.

### 6. Cockpit Metric Cards (KPMs - Key Performance Metrics)
- Dark glass tiles featuring modular layout: tiny uppercase label at the top, bold metric value (`tabular-nums`) centered, and trend indicators (+% in `#00FF87` or -% in `#EF4444`) with subtle colored micro-sparklines.