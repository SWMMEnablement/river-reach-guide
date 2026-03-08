# Handover Document — Learn River Reach & 2D Modeling

## 1. Project Overview

**Name:** Learn River Reach & 2D Modeling  
**Published URL:** https://river-reach-guide.lovable.app  
**Purpose:** An immersive, interactive learning platform for hydraulic engineering — covering 1D river modeling, 2D mesh/coupling in Autodesk InfoWorks ICM, urban drainage (EPA SWMM 5), and Sustainable Drainage Systems (SuDS/LID).  
**Target Audience:** Hydraulic engineers, civil engineering students, water resources professionals, and anyone learning open-channel hydraulics or hydraulic modeling software.

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui component library |
| Animation | Framer Motion |
| Charts | Recharts |
| PDF Generation | jsPDF |
| SQLite Parsing | sql.js (client-side, for ICM database import) |
| Backend | Lovable Cloud (Supabase) |
| Edge Functions | Deno (Supabase Edge Functions) |
| State Management | React useState/useContext + TanStack React Query |
| Routing | React Router v6 |
| PWA | Service Worker (`public/sw.js`) + Web App Manifest |

---

## 3. Project Structure

```
src/
├── pages/
│   ├── Index.tsx              # Main single-page application
│   └── NotFound.tsx           # 404 page
├── components/
│   ├── Header.tsx             # Top navigation bar
│   ├── HeroSection.tsx        # Landing hero with animated intro
│   ├── ModelingSteps.tsx       # Step-by-step modeling guide
│   ├── ComponentCard.tsx       # Reusable info card component
│   ├── KnowledgeQuiz.tsx       # Interactive hydraulics quiz
│   ├── RiverReachDiagram.tsx   # Static river reach diagram
│   ├── BeginnerModeToggle.tsx  # Toggle for simplified UI
│   ├── NavLink.tsx             # Navigation link component
│   ├── CrossSectionEditor.tsx  # Standalone cross-section editor
│   │
│   ├── ChannelVisualizer/      # ★ Core interactive module
│   │   ├── index.tsx           # Main orchestrator (presets, view tabs, layout)
│   │   ├── types.ts            # TypeScript interfaces (ChannelGeometry, HydraulicParams, etc.)
│   │   ├── useHydraulicCalculations.ts  # Manning's equation solver hook
│   │   ├── ControlPanel.tsx    # Sliders for geometry & hydraulic params
│   │   ├── ResultsPanel.tsx    # Computed results display
│   │   ├── CrossSectionView.tsx       # SVG cross-section visualisation
│   │   ├── LongProfileView.tsx        # SVG longitudinal profile
│   │   ├── PlanView.tsx               # SVG plan view
│   │   ├── IrregularCrossSectionEditor.tsx  # Survey point editor
│   │   ├── BridgeCulvertView.tsx      # Bridge/culvert visualisation
│   │   ├── CouplingZonesView.tsx      # 1D/2D coupling zones
│   │   ├── ICMConceptCard.tsx         # Concept explanation card
│   │   ├── AdvancedConceptsSection.tsx
│   │   ├── TroubleshootingSection.tsx # Static troubleshooting guides
│   │   ├── TwoDModelingSection.tsx    # 2D modeling concepts
│   │   ├── SWMM5ChannelsSection.tsx   # SWMM open channels
│   │   ├── SWMM5ConduitsSection.tsx   # SWMM conduit types
│   │   ├── SuDSSection.tsx            # Sustainable drainage info
│   │   ├── LIDControlsSection.tsx     # LID control details
│   │   ├── RatingCurveGenerator.tsx   # Stage-discharge calculator
│   │   ├── CulvertDesignCalculator.tsx    # HY-8 style culvert calc
│   │   ├── FroudeNumberCalculator.tsx     # Flow regime analysis
│   │   ├── GVFProfileCalculator.tsx       # Gradually varied flow profiles
│   │   ├── WeirOrificeCalculator.tsx      # Weir & orifice equations
│   │   ├── CompoundChannelCalculator.tsx  # Multi-zone conveyance
│   │   ├── QuickReferenceCard.tsx     # Printable reference sheet
│   │   ├── CalculatorInsights.tsx     # Post-calculation learning tips
│   │   ├── CalculatorQuiz.tsx         # Quiz tied to calculator results
│   │   ├── ReportGeneratorButton.tsx  # PDF report generation
│   │   ├── SWMMFileImport.tsx         # EPA SWMM .inp file parser
│   │   ├── ICMDatabaseImport.tsx      # ICM .sqlite database importer
│   │   ├── ICMExportButton.tsx        # Export results to ICM CSV format
│   │   ├── TroubleshootingAIChat.tsx  # AI diagnostic assistant
│   │   ├── HydraulicsAIChat.tsx       # AI hydraulics tutor
│   │   └── RubyScriptsSection.tsx     # ICM Ruby scripting examples
│   │
│   ├── ConceptFinder/          # Searchable knowledge base
│   │   ├── ConceptFinder.tsx
│   │   ├── knowledgeBase.ts    # Static knowledge entries
│   │   └── index.ts
│   │
│   ├── GuidedDiagram/          # Interactive tutorial diagram
│   │   ├── GuidedRiverDiagram.tsx
│   │   ├── tutorialSteps.ts
│   │   └── index.ts
│   │
│   ├── LearningPathways/       # Structured learning tracks
│   │   ├── LearningDashboard.tsx
│   │   ├── PathwayCard.tsx
│   │   ├── pathwayData.tsx
│   │   └── index.ts
│   │
│   ├── StoryMode/              # Scenario-based learning
│   │   ├── StoryModeExperience.tsx
│   │   ├── StoryModeButton.tsx
│   │   ├── StoryModeGuide.tsx
│   │   ├── storyScenarios.ts
│   │   └── index.ts
│   │
│   └── ui/                     # shadcn/ui components (40+ components)
│
├── hooks/
│   ├── useBeginnerMode.ts      # Beginner/advanced mode context
│   ├── use-mobile.tsx          # Mobile detection
│   ├── usePWA.ts               # PWA install prompt
│   └── use-toast.ts            # Toast notifications
│
├── lib/
│   ├── utils.ts                # Tailwind merge utility
│   ├── swmm-parser.ts          # EPA SWMM .inp file parser
│   ├── icm-sqlite-parser.ts    # ICM SQLite database parser (sql.js)
│   ├── icm-csv-exporter.ts     # ICM-compatible CSV export
│   └── pdf-report-generator.ts # jsPDF report builder
│
├── integrations/supabase/
│   ├── client.ts               # Auto-generated Supabase client
│   └── types.ts                # Auto-generated DB types
│
├── index.css                   # Global styles + CSS custom properties
├── App.tsx                     # Router + providers
└── main.tsx                    # Entry point

supabase/
├── config.toml                 # Auto-managed Supabase config
└── functions/
    └── hydraulics-chat/
        └── index.ts            # Edge function: AI chat (streams responses)

public/
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker for offline caching
├── icons/                      # PWA icons (72–512px)
├── favicon.ico
├── robots.txt
└── placeholder.svg
```

---

## 4. Core Features

### 4.1 Interactive Channel Visualiser
- **3 channel presets:** Natural River, Concrete Channel, Vegetated Swale
- **6 view modes:** Cross-Section, Long Profile, Plan View, Irregular Section, Bridge/Culvert, 1D/2D Coupling
- **Real-time calculations** via Manning's equation (area, wetted perimeter, hydraulic radius, velocity, discharge, Froude number)
- **Animated SVG** renderings with flow particles

### 4.2 Hydraulic Calculators
| Calculator | Purpose |
|-----------|---------|
| Rating Curve Generator | Stage-discharge relationships with graphing |
| Culvert Design Calculator | Inlet/outlet control analysis |
| Froude Number Calculator | Flow regime classification |
| GVF Profile Calculator | Backwater/drawdown curve computation |
| Weir & Orifice Calculator | Structure flow equations |
| Compound Channel Calculator | Multi-zone conveyance splitting |

### 4.3 Professional Data Integration
- **SWMM .inp Import:** Parse EPA SWMM input files to extract conduit/junction data
- **ICM .sqlite Import:** Load InfoWorks ICM model databases client-side using sql.js
- **ICM CSV Export:** Export calculator results in formats compatible with InfoWorks import wizards

### 4.4 AI-Powered Assistants (Edge Function)
- **Hydraulics AI Chat:** General hydraulic engineering Q&A
- **Troubleshooting AI Chat:** Diagnostic guidance for modeling issues (instability, flow errors, performance)
- Both use streaming responses via the `hydraulics-chat` Supabase Edge Function
- Model: Lovable AI (Google Gemini) — no external API key required

### 4.5 Learning Features
- **Beginner Mode:** Simplified UI that hides advanced sections; toggled via context
- **Guided Diagram:** Step-by-step interactive river reach tutorial
- **Learning Pathways:** Structured tracks (Beginner → Advanced) with progress tracking
- **Story Mode:** Scenario-based learning (e.g., "Flood hits a village")
- **Knowledge Quiz:** Multiple-choice questions on hydraulic concepts
- **Concept Finder:** Searchable static knowledge base
- **Calculator Quizzes & Insights:** Post-calculation learning reinforcement

### 4.6 Reference & Reporting
- **Quick Reference Card:** Printable summary of key equations and Manning's n values
- **PDF Report Generator:** Export calculation results as formatted PDF documents
- **ICM Concept Cards:** Conveyance, Saint-Venant equations, roughness zones

### 4.7 PWA Support
- Service worker for offline caching of static assets
- Web app manifest with icons for home screen installation
- Install prompt hook (`usePWA`)

---

## 5. Backend — Lovable Cloud

### 5.1 Edge Functions
| Function | Path | Purpose |
|----------|------|---------|
| `hydraulics-chat` | `supabase/functions/hydraulics-chat/index.ts` | Streams AI responses for both the Hydraulics and Troubleshooting chat interfaces. Accepts an optional `customSystemPrompt` for specialised behaviour. |

### 5.2 Database
Currently no application tables are defined in the database. The app is primarily client-side with AI chat handled via edge functions. Future candidates for database tables:
- User learning progress / pathway completion
- Saved calculator sessions
- Shared team annotations

### 5.3 Authentication
Not currently implemented. No user login is required — all features are publicly accessible.

---

## 6. Design System

### Theming
- CSS custom properties defined in `src/index.css` using HSL values
- Light and dark mode support via `next-themes` + `.dark` class
- All colours referenced through semantic tokens: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--card`, `--border`, etc.
- Custom tokens: `--water` (blue), `--terrain` (amber/brown), `--flow` (cyan) for hydraulic-specific styling

### Component Library
- shadcn/ui components in `src/components/ui/` (40+ components)
- Tailwind config extends the design tokens in `tailwind.config.ts`

### Animations
- Framer Motion used throughout for page transitions, collapsible sections, hover effects, and SVG flow animations
- `isAnimating` state controls flow particle animations in visualisations

---

## 7. Key Architectural Decisions

1. **Client-side computation:** All hydraulic calculations run in the browser — no server round-trips for Manning's equation, Froude numbers, etc.
2. **Client-side SQLite:** sql.js (WebAssembly) parses ICM `.sqlite` files entirely in the browser, avoiding file upload to servers.
3. **Single-page architecture:** The app is essentially one page (`Index.tsx`) with collapsible sections rather than multi-page routing.
4. **Beginner Mode context:** A React context (`BeginnerModeContext`) controls UI complexity globally — components check `isBeginnerMode` to show/hide advanced features.
5. **Streaming AI responses:** The edge function streams tokens back to the client for responsive chat UX.
6. **No persistent state:** Currently all state is ephemeral (lost on refresh). No database tables or localStorage persistence.

---

## 8. Environment & Configuration

| File | Purpose | Editable? |
|------|---------|-----------|
| `.env` | Supabase URL, anon key, project ID | ❌ Auto-managed |
| `supabase/config.toml` | Supabase project config | ❌ Auto-managed |
| `src/integrations/supabase/client.ts` | Supabase JS client | ❌ Auto-generated |
| `src/integrations/supabase/types.ts` | Database type definitions | ❌ Auto-generated |
| `tailwind.config.ts` | Tailwind theme extensions | ✅ |
| `vite.config.ts` | Vite build config | ✅ |
| `tsconfig.*.json` | TypeScript configs | ✅ |

---

## 9. Known Limitations & Technical Debt

1. **`ChannelVisualizer/index.tsx` is 468 lines** — should be refactored into smaller orchestration files (e.g., separate preset selector, view router, advanced tools panel).
2. **No persistent storage** — learning progress, calculator sessions, and chat history are lost on page refresh.
3. **No authentication** — all features are public; adding auth would enable personalised progress tracking.
4. **No automated tests** — only a placeholder test exists (`src/test/example.test.ts`).
5. **No internationalisation (i18n)** — all content is in English.
6. **AI chat has no rate limiting** on the client side.
7. **SWMM/ICM parsers** handle common cases but may not cover all edge cases in complex model files.

---

## 10. Potential Next Steps

- **Cloud Progress Sync:** Add database tables to persist learning pathway completion and calculator sessions across devices.
- **User Authentication:** Enable login to tie progress to user accounts.
- **Collaborative Features:** Team workspaces, shared annotations, discussion threads for engineering teams.
- **Batch ICM Export:** Export multiple calculator results into a single packaged file.
- **Automated Testing:** Add Vitest unit tests for hydraulic calculation logic and Playwright E2E tests.
- **Mobile Optimisation:** Further responsive refinements for field use on tablets/phones.
- **Offline AI:** Cache common troubleshooting responses for offline PWA use.

---

## 11. How to Run Locally

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 12. Deployment

The app is deployed via Lovable's built-in publishing. To publish:
1. Open the project in Lovable
2. Click **Share → Publish**

The published URL is: https://river-reach-guide.lovable.app
