// Centralized knowledge base for hydraulic concepts
export interface Concept {
  id: string;
  title: string;
  category: 'fundamentals' | 'equations' | 'modeling' | 'troubleshooting' | 'structures' | 'software';
  keywords: string[];
  formula?: string;
  description: string;
  details: string[];
  relatedConcepts?: string[];
}

export const knowledgeBase: Concept[] = [
  // Fundamentals
  {
    id: 'mannings-equation',
    title: "Manning's Equation",
    category: 'fundamentals',
    keywords: ['manning', 'roughness', 'velocity', 'flow', 'n coefficient', 'open channel'],
    formula: 'V = (1/n) × R^(2/3) × S^(1/2)',
    description: "The fundamental equation for calculating flow velocity in open channels based on roughness, hydraulic radius, and slope.",
    details: [
      'n = Manning\'s roughness coefficient (0.01 to 0.15)',
      'R = Hydraulic radius = Area / Wetted Perimeter',
      'S = Channel bed slope',
      'Typical n values: concrete (0.013), gravel (0.025), vegetated (0.05-0.15)',
    ],
    relatedConcepts: ['roughness-zones', 'conveyance'],
  },
  {
    id: 'froude-number',
    title: 'Froude Number',
    category: 'fundamentals',
    keywords: ['froude', 'subcritical', 'supercritical', 'critical', 'flow regime', 'fr'],
    formula: 'Fr = V / √(gy)',
    description: 'Dimensionless number that classifies flow regime. Critical for understanding hydraulic jumps and backwater effects.',
    details: [
      'Fr < 1: Subcritical (tranquil) flow - controlled from downstream',
      'Fr = 1: Critical flow condition',
      'Fr > 1: Supercritical (rapid) flow - controlled from upstream',
      'Hydraulic jumps occur when supercritical transitions to subcritical',
    ],
    relatedConcepts: ['hydraulic-jump', 'gvf', 'energy-equation'],
  },
  {
    id: 'hydraulic-radius',
    title: 'Hydraulic Radius',
    category: 'fundamentals',
    keywords: ['hydraulic radius', 'area', 'wetted perimeter', 'geometry', 'cross section'],
    formula: 'R = A / P',
    description: 'Ratio of flow area to wetted perimeter. A key geometric parameter in open channel flow calculations.',
    details: [
      'A = Cross-sectional area of flow',
      'P = Wetted perimeter (length of channel boundary in contact with water)',
      'Larger R = more efficient channel (less friction)',
      'Semicircular channels have optimal hydraulic radius',
    ],
    relatedConcepts: ['mannings-equation', 'conveyance'],
  },
  {
    id: 'conveyance',
    title: 'Conveyance (K)',
    category: 'fundamentals',
    keywords: ['conveyance', 'capacity', 'flow carrying', 'compound channel'],
    formula: 'K = (1/n) × A × R^(2/3)',
    description: 'Represents the flow-carrying capacity of a channel section. Combines geometry and roughness into single value.',
    details: [
      'Q = K × √S (discharge from conveyance)',
      'Different K values for channel vs floodplain zones',
      'Used in compound channel calculations',
      'Total K = sum of individual zone conveyances',
    ],
    relatedConcepts: ['mannings-equation', 'roughness-zones'],
  },

  // Equations
  {
    id: 'saint-venant',
    title: 'Saint-Venant Equations',
    category: 'equations',
    keywords: ['saint-venant', 'shallow water', 'unsteady flow', 'continuity', 'momentum', '1d'],
    formula: '∂A/∂t + ∂Q/∂x = q (Continuity)',
    description: 'The fundamental equations governing unsteady open-channel flow, consisting of continuity and momentum equations.',
    details: [
      'Continuity: mass conservation (∂A/∂t + ∂Q/∂x = q)',
      'Momentum: force balance along flow direction',
      'Solved numerically using finite difference methods',
      'ICM uses Preissmann implicit scheme for stability',
    ],
    relatedConcepts: ['preissmann-slot', 'courant-number'],
  },
  {
    id: 'energy-equation',
    title: 'Energy Equation',
    category: 'equations',
    keywords: ['energy', 'bernoulli', 'head', 'egl', 'hgl', 'velocity head', 'specific energy'],
    formula: 'z + y + V²/2g = constant + hL',
    description: 'Conservation of energy for gradually varied flow. Total head = elevation + pressure head + velocity head, minus losses.',
    details: [
      'z = bed elevation above datum',
      'y = water depth (pressure head)',
      'V²/2g = velocity head (kinetic energy)',
      'hL = head losses (friction + local)',
    ],
    relatedConcepts: ['gvf', 'hydraulic-jump'],
  },
  {
    id: 'gvf',
    title: 'Gradually Varied Flow (GVF)',
    category: 'equations',
    keywords: ['gvf', 'gradually varied', 'backwater', 'drawdown', 'm1', 'm2', 's1', 's2', 'profile'],
    formula: 'dy/dx = (S₀ - Sf) / (1 - Fr²)',
    description: 'Describes how water depth changes along a channel. Used for backwater calculations and profile classification.',
    details: [
      'S₀ = bed slope, Sf = friction slope',
      'Predicts drawdown curves and backwater profiles',
      'M1/M2 profiles: Mild slope (yn > yc)',
      'S1/S2 profiles: Steep slope (yn < yc)',
    ],
    relatedConcepts: ['froude-number', 'energy-equation', 'normal-depth'],
  },
  {
    id: 'normal-depth',
    title: 'Normal Depth',
    category: 'equations',
    keywords: ['normal depth', 'uniform flow', 'yn', 'equilibrium', 'steady'],
    formula: 'Sf = S₀ (when y = yn)',
    description: 'The depth at which uniform flow occurs - friction slope equals bed slope. The equilibrium depth for a given discharge.',
    details: [
      'Calculated iteratively from Manning\'s equation',
      'Q = (1/n) × A × R^(2/3) × S₀^(1/2)',
      'Used as downstream boundary condition',
      'yn > yc for mild slopes, yn < yc for steep slopes',
    ],
    relatedConcepts: ['gvf', 'critical-depth'],
  },
  {
    id: 'critical-depth',
    title: 'Critical Depth',
    category: 'equations',
    keywords: ['critical depth', 'yc', 'minimum energy', 'control section', 'weir'],
    formula: 'yc = (Q²/gB²)^(1/3) for rectangular',
    description: 'The depth at which specific energy is minimum for a given discharge. Fr = 1 at critical depth.',
    details: [
      'Occurs at controls like weirs, sluice gates, channel transitions',
      'Minimum specific energy point',
      'Important for establishing boundary conditions',
      'Separates subcritical from supercritical regimes',
    ],
    relatedConcepts: ['froude-number', 'normal-depth', 'gvf'],
  },

  // Modeling Concepts
  {
    id: 'preissmann-slot',
    title: 'Preissmann Slot',
    category: 'modeling',
    keywords: ['preissmann', 'slot', 'pressurized', 'surcharge', 'pipe', 'culvert', 'sewer'],
    formula: 'Slot width: b_s = A / (c²/g)',
    description: 'A numerical technique that allows Saint-Venant equations to handle pressurized flow by adding a narrow imaginary slot.',
    details: [
      'Maintains free-surface equations under pressure',
      'Slot width calculated to preserve correct wave celerity',
      'Enables smooth transition between free-surface and pressurized flow',
      'Critical for culvert and sewer modeling in ICM',
    ],
    relatedConcepts: ['saint-venant', 'courant-number'],
  },
  {
    id: 'courant-number',
    title: 'Courant Number (CFL)',
    category: 'modeling',
    keywords: ['courant', 'cfl', 'stability', 'timestep', 'oscillation', 'explicit', 'implicit'],
    formula: 'Cr = (V + c) × Δt / Δx ≤ 1',
    description: 'The Courant-Friedrichs-Lewy condition ensures numerical stability. Must be ≤1 for explicit schemes.',
    details: [
      'V = flow velocity, c = wave celerity √(gy)',
      'Δt = time step, Δx = spatial step',
      'Cr > 1 causes oscillations and instability',
      'ICM auto-adjusts time step to maintain stability',
    ],
    relatedConcepts: ['oscillations', 'preissmann-slot'],
  },
  {
    id: 'oscillations',
    title: 'Numerical Oscillations',
    category: 'modeling',
    keywords: ['oscillation', 'instability', 'wiggle', 'spurious', 'noise', 'unstable'],
    description: 'Spurious oscillations in model results often indicate numerical instability rather than physical phenomena.',
    details: [
      'Check Courant number (reduce time step)',
      'Review cross-section spacing (Δx too large)',
      'Examine sudden geometry changes',
      'Consider using implicit solver for stiff problems',
    ],
    relatedConcepts: ['courant-number', 'troubleshooting-slow'],
  },
  {
    id: 'roughness-zones',
    title: 'Roughness Zones',
    category: 'modeling',
    keywords: ['roughness', 'zones', 'manning n', 'floodplain', 'bank', 'channel'],
    formula: 'n = 0.015 to 0.15',
    description: "Different Manning's n values applied to distinct parts of the cross-section for accurate conveyance.",
    details: [
      'Main channel: typically 0.025-0.045',
      'Gravel/cobble bed: 0.03-0.05',
      'Vegetated floodplain: 0.05-0.15',
      'Concrete lined: 0.012-0.018',
    ],
    relatedConcepts: ['mannings-equation', 'conveyance'],
  },
  {
    id: '1d-2d-coupling',
    title: '1D/2D Coupling',
    category: 'modeling',
    keywords: ['1d', '2d', 'coupling', 'lateral', 'spill', 'floodplain', 'mesh', 'bank'],
    description: 'Connecting 1D river channels with 2D floodplain meshes for accurate out-of-bank flood modeling.',
    details: [
      'Bank markers define where spill occurs',
      'Lateral spill links connect 1D to 2D elements',
      'Water exchanges based on level difference',
      '2D mesh captures complex floodplain flow paths',
    ],
    relatedConcepts: ['bank-markers', 'cross-section'],
  },
  {
    id: 'bank-markers',
    title: 'Bank Markers',
    category: 'modeling',
    keywords: ['bank', 'marker', 'left bank', 'right bank', 'lb', 'rb', 'overbank'],
    description: 'Markers on cross-sections that define the main channel limits and where floodplain begins.',
    details: [
      'Place at TOP of bank, not water\'s edge',
      'Left bank on left when looking downstream',
      'Define extent of main channel conveyance zone',
      'Critical for compound channel calculations and 1D/2D coupling',
    ],
    relatedConcepts: ['cross-section', '1d-2d-coupling', 'roughness-zones'],
  },

  // Structures
  {
    id: 'culvert-inlet-control',
    title: 'Culvert Inlet Control',
    category: 'structures',
    keywords: ['culvert', 'inlet control', 'headwater', 'entrance', 'capacity'],
    description: 'Flow is limited by culvert entrance geometry. Headwater rises rapidly with increasing discharge.',
    details: [
      'Occurs when barrel capacity exceeds inlet capacity',
      'Headwater depth depends on inlet geometry',
      'Improved inlets (beveled edges) increase capacity',
      'Check using FHWA HY-8 methodology',
    ],
    relatedConcepts: ['culvert-outlet-control', 'headwater'],
  },
  {
    id: 'culvert-outlet-control',
    title: 'Culvert Outlet Control',
    category: 'structures',
    keywords: ['culvert', 'outlet control', 'barrel', 'friction', 'tailwater'],
    description: 'Flow is limited by barrel friction and tailwater. Full-flow or partly full conditions.',
    details: [
      'Occurs when inlet capacity exceeds barrel capacity',
      'Headwater computed using energy equation',
      'Tailwater elevation affects performance',
      'May flow full (pressurized) or partly full',
    ],
    relatedConcepts: ['culvert-inlet-control', 'preissmann-slot'],
  },
  {
    id: 'weir-flow',
    title: 'Weir Flow',
    category: 'structures',
    keywords: ['weir', 'broad crested', 'sharp crested', 'overflow', 'spillway', 'crest'],
    formula: 'Q = C × L × H^(3/2)',
    description: 'Flow over an obstruction where water level is controlled by the weir crest elevation.',
    details: [
      'C = discharge coefficient (1.6-2.1 for broad-crested)',
      'L = weir crest length',
      'H = head above crest',
      'Sharp-crested weirs have higher C values',
    ],
    relatedConcepts: ['critical-depth', 'orifice-flow'],
  },
  {
    id: 'orifice-flow',
    title: 'Orifice Flow',
    category: 'structures',
    keywords: ['orifice', 'sluice', 'gate', 'submerged', 'outlet'],
    formula: 'Q = Cd × A × √(2gH)',
    description: 'Flow through an opening where discharge is controlled by the opening size and head difference.',
    details: [
      'Cd = discharge coefficient (0.6-0.8 typical)',
      'A = orifice area',
      'H = head above orifice center',
      'Submerged orifices use head difference',
    ],
    relatedConcepts: ['weir-flow', 'culvert-inlet-control'],
  },
  {
    id: 'hydraulic-jump',
    title: 'Hydraulic Jump',
    category: 'structures',
    keywords: ['hydraulic jump', 'energy dissipation', 'stilling basin', 'supercritical', 'transition'],
    formula: 'y₂/y₁ = 0.5 × (√(1 + 8Fr₁²) - 1)',
    description: 'Rapid transition from supercritical to subcritical flow with significant energy loss.',
    details: [
      'Occurs downstream of spillways, gates, steep chutes',
      'Used for energy dissipation in stilling basins',
      'Sequent depth ratio depends on upstream Froude number',
      'Significant air entrainment and turbulence',
    ],
    relatedConcepts: ['froude-number', 'energy-equation'],
  },

  // Troubleshooting
  {
    id: 'troubleshooting-drying',
    title: 'River Drying Out',
    category: 'troubleshooting',
    keywords: ['drying', 'zero depth', 'negative depth', 'empty', 'no water'],
    description: 'Water depth drops to zero or negative values, often due to steep slopes or boundary conditions.',
    details: [
      'Check bed levels for sudden drops or data errors',
      'Use stage-discharge boundary or fixed water level downstream',
      'Ensure smooth transitions between cross-sections',
      'Verify Manning\'s n values are appropriate',
    ],
    relatedConcepts: ['normal-depth', 'boundary-conditions'],
  },
  {
    id: 'troubleshooting-floodplain',
    title: 'Floodplain Not Activating',
    category: 'troubleshooting',
    keywords: ['floodplain', 'overbank', 'not flooding', 'stays in channel'],
    description: 'Water stays in main channel even at high flows - usually a bank marker placement issue.',
    details: [
      'Place bank markers at TOP of bank, not water\'s edge',
      'Remove any "inactive" designations on floodplain areas',
      'Check extended cross-sections include floodplain geometry',
      'Verify bank markers are correctly labeled (L/R)',
    ],
    relatedConcepts: ['bank-markers', '1d-2d-coupling'],
  },
  {
    id: 'troubleshooting-slow',
    title: 'Model Running Slowly',
    category: 'troubleshooting',
    keywords: ['slow', 'performance', 'stuck', 'long runtime', 'taking forever'],
    description: 'Simulation takes excessively long due to numerical stiffness or over-refinement.',
    details: [
      'Check if time step is too small (over-refined)',
      'Review Preissmann slot width (too narrow causes stiffness)',
      'Reduce number of cross-sections if spacing is excessive',
      'Coarsen 2D mesh in non-critical areas',
    ],
    relatedConcepts: ['courant-number', 'preissmann-slot'],
  },
  {
    id: 'troubleshooting-negative',
    title: 'Negative Depths',
    category: 'troubleshooting',
    keywords: ['negative', 'crash', 'initialization', 'initial conditions'],
    description: 'Model reports negative water depths or crashes at startup due to initialization issues.',
    details: [
      'Set initial water levels above lowest bed point',
      'Use "hot start" from a steady-state simulation',
      'Verify all cross-section elevations use same datum',
      'Check inflow boundary doesn\'t cause drawdown below bed',
    ],
    relatedConcepts: ['boundary-conditions', 'normal-depth'],
  },

  // Software-Specific
  {
    id: 'icm-river-reach',
    title: 'ICM River Reach',
    category: 'software',
    keywords: ['icm', 'river reach', 'link', 'infoworks', 'autodesk'],
    description: 'The river reach object in InfoWorks ICM connects nodes and contains multiple cross-sections.',
    details: [
      'Contains multiple cross-sections along its length',
      'Uses 1D Saint-Venant equations for flow routing',
      'Can couple to 2D zones for floodplain modeling',
      'Supports inline structures (bridges, culverts, weirs)',
    ],
    relatedConcepts: ['cross-section', '1d-2d-coupling', 'saint-venant'],
  },
  {
    id: 'cross-section',
    title: 'Cross Section',
    category: 'software',
    keywords: ['cross section', 'xs', 'survey', 'geometry', 'chainage', 'elevation'],
    description: 'Defines the channel geometry at a specific location using survey points and bank markers.',
    details: [
      'Survey data: chainage (distance) and elevation pairs',
      'Bank markers separate channel from floodplain',
      'Manning\'s roughness assigned by zone',
      'Interpolated between surveyed sections',
    ],
    relatedConcepts: ['bank-markers', 'roughness-zones', 'icm-river-reach'],
  },
  {
    id: 'boundary-conditions',
    title: 'Boundary Conditions',
    category: 'software',
    keywords: ['boundary', 'upstream', 'downstream', 'inflow', 'hydrograph', 'stage'],
    description: 'Required inputs at model extents: inflow hydrographs upstream, water levels downstream.',
    details: [
      'Upstream: flow hydrograph (Q vs time)',
      'Downstream: stage hydrograph, normal depth, or rating curve',
      'Tidal boundaries use time-varying water levels',
      'Free outfall assumes critical depth at exit',
    ],
    relatedConcepts: ['normal-depth', 'critical-depth', 'gvf'],
  },
  {
    id: 'swmm-conduits',
    title: 'SWMM Conduits',
    category: 'software',
    keywords: ['swmm', 'conduit', 'pipe', 'link', 'storm', 'sewer', 'epa'],
    description: 'Pipes and channels in EPA SWMM that convey flow between junction nodes.',
    details: [
      'Predefined shapes: circular, rectangular, trapezoidal, etc.',
      'Uses dynamic wave or kinematic wave routing',
      'Roughness specified via Manning\'s n',
      'Can surcharge and pressurize (Preissmann slot)',
    ],
    relatedConcepts: ['preissmann-slot', 'mannings-equation'],
  },
  {
    id: 'lid-controls',
    title: 'LID Controls',
    category: 'software',
    keywords: ['lid', 'low impact', 'green infrastructure', 'bioretention', 'swale', 'permeable'],
    description: 'Low Impact Development controls in SWMM for stormwater management at the source.',
    details: [
      'Bio-retention cells: layered soil/gravel systems',
      'Permeable pavement: infiltration through surface',
      'Vegetative swales: grass-lined conveyance',
      'Green roofs: vegetated roof surfaces',
    ],
    relatedConcepts: ['swmm-conduits', 'roughness-zones'],
  },

  // SWMM-Specific Parameters
  {
    id: 'swmm-junctions',
    title: 'SWMM Junctions',
    category: 'software',
    keywords: ['junction', 'node', 'manhole', 'connection', 'swmm', 'invert'],
    description: 'Junction nodes in SWMM represent points where conduits connect, such as manholes or pipe junctions.',
    details: [
      'Invert elevation: lowest point in the junction',
      'Max depth: distance from invert to ground surface',
      'Surcharge depth: allowed ponding above ground',
      'External inflows can be applied at junctions',
    ],
    relatedConcepts: ['swmm-conduits', 'swmm-storage'],
  },
  {
    id: 'swmm-storage',
    title: 'SWMM Storage Units',
    category: 'software',
    keywords: ['storage', 'pond', 'basin', 'detention', 'retention', 'swmm', 'tank'],
    description: 'Storage nodes in SWMM provide volume for detention/retention, modeled with stage-area relationships.',
    details: [
      'Functional: A = a × depth^b + c (power function)',
      'Tabular: stage vs. area table from survey data',
      'Can have evaporation and seepage losses',
      'Outlet structures control discharge rate',
    ],
    relatedConcepts: ['swmm-junctions', 'swmm-outfalls'],
  },
  {
    id: 'swmm-outfalls',
    title: 'SWMM Outfalls',
    category: 'software',
    keywords: ['outfall', 'outlet', 'boundary', 'downstream', 'tide', 'swmm'],
    description: 'Outfall nodes represent terminal points where water exits the drainage system.',
    details: [
      'FREE: critical depth or normal depth outfall',
      'FIXED: constant water surface elevation',
      'TIDAL: time-varying tidal boundary',
      'TIMESERIES: user-defined stage hydrograph',
    ],
    relatedConcepts: ['boundary-conditions', 'swmm-junctions'],
  },
  {
    id: 'swmm-pumps',
    title: 'SWMM Pumps',
    category: 'software',
    keywords: ['pump', 'lift station', 'curve', 'on-off', 'swmm', 'pumping'],
    description: 'Pump links in SWMM convey water from lower to higher elevations using pump curves.',
    details: [
      'Type 1: volume vs. flow (inline/offline)',
      'Type 2: depth vs. flow (wet well)',
      'Type 3: head vs. flow (pump curve)',
      'Type 4: depth vs. flow (variable speed)',
    ],
    relatedConcepts: ['swmm-conduits', 'swmm-storage'],
  },
  {
    id: 'swmm-orifices',
    title: 'SWMM Orifices',
    category: 'software',
    keywords: ['orifice', 'outlet', 'restrictor', 'bottom', 'side', 'swmm'],
    formula: 'Q = Cd × A × √(2gH)',
    description: 'Orifice links in SWMM model outlet restrictions and flow control devices.',
    details: [
      'BOTTOM: horizontal orifice at bottom of structure',
      'SIDE: vertical orifice on side of structure',
      'Discharge coefficient (Cd) typically 0.6-0.65',
      'Can operate as submerged or free-flowing',
    ],
    relatedConcepts: ['orifice-flow', 'swmm-weirs'],
  },
  {
    id: 'swmm-weirs',
    title: 'SWMM Weirs',
    category: 'software',
    keywords: ['weir', 'overflow', 'crest', 'transverse', 'sideflow', 'swmm', 'vnotch'],
    formula: 'Q = C × L × H^n',
    description: 'Weir links in SWMM model overflow structures with various crest configurations.',
    details: [
      'TRANSVERSE: perpendicular to flow (n=1.5)',
      'SIDEFLOW: parallel to flow direction',
      'V-NOTCH: triangular opening (n=2.5)',
      'TRAPEZOIDAL: combined rectangular + triangular',
    ],
    relatedConcepts: ['weir-flow', 'swmm-orifices'],
  },
  {
    id: 'swmm-transects',
    title: 'SWMM Transects',
    category: 'software',
    keywords: ['transect', 'irregular', 'natural', 'channel', 'cross section', 'swmm', 'hec'],
    description: 'Transect data defines irregular natural channel cross-sections in SWMM using HEC-2 format.',
    details: [
      'NC line: Manning n values (left bank, channel, right bank)',
      'X1 line: number of stations and modifiers',
      'GR lines: station-elevation pairs defining geometry',
      'Station 0 = left bank; increasing = toward right bank',
    ],
    relatedConcepts: ['cross-section', 'swmm-conduits', 'roughness-zones'],
  },
  {
    id: 'swmm-infiltration',
    title: 'SWMM Infiltration Methods',
    category: 'software',
    keywords: ['infiltration', 'horton', 'green-ampt', 'curve number', 'cn', 'swmm', 'pervious'],
    description: 'SWMM offers multiple infiltration models for simulating water loss to pervious surfaces.',
    details: [
      'HORTON: exponential decay (f₀ to f∞)',
      'MODIFIED_HORTON: recovery during dry periods',
      'GREEN_AMPT: physics-based soil parameters',
      'CURVE_NUMBER: SCS CN method (0-100)',
    ],
    relatedConcepts: ['swmm-subcatchments', 'lid-controls'],
  },
  {
    id: 'swmm-subcatchments',
    title: 'SWMM Subcatchments',
    category: 'software',
    keywords: ['subcatchment', 'catchment', 'drainage area', 'runoff', 'impervious', 'swmm'],
    description: 'Subcatchments in SWMM generate runoff from rainfall using nonlinear reservoir routing.',
    details: [
      'Area, width, slope define geometry',
      '% Impervious: fraction of impermeable surface',
      'N-Imperv/N-Perv: Manning n for overland flow',
      'Dstore: depression storage depths',
    ],
    relatedConcepts: ['swmm-infiltration', 'lid-controls'],
  },
  {
    id: 'swmm-routing',
    title: 'SWMM Flow Routing',
    category: 'software',
    keywords: ['routing', 'dynamic wave', 'kinematic wave', 'steady flow', 'swmm', 'solver'],
    description: 'SWMM offers three routing methods with different complexity and capability trade-offs.',
    details: [
      'STEADY: no storage effects, fastest',
      'KINEMATIC: attenuates waves, no backwater',
      'DYNAMIC: full Saint-Venant, handles surcharge and backwater',
      'Dynamic wave required for pressurized flow and looped networks',
    ],
    relatedConcepts: ['saint-venant', 'preissmann-slot', 'courant-number'],
  },
  {
    id: 'swmm-rainfall',
    title: 'SWMM Rain Gages',
    category: 'software',
    keywords: ['rain', 'rainfall', 'precipitation', 'intensity', 'timeseries', 'swmm', 'gage'],
    description: 'Rain gages in SWMM define precipitation input for subcatchment runoff generation.',
    details: [
      'INTENSITY: rainfall rate (in/hr or mm/hr)',
      'VOLUME: accumulated depth per interval',
      'CUMULATIVE: total depth since start',
      'Can use TIMESERIES or external files',
    ],
    relatedConcepts: ['swmm-subcatchments', 'swmm-infiltration'],
  },
  {
    id: 'swmm-controls',
    title: 'SWMM Control Rules',
    category: 'software',
    keywords: ['control', 'rules', 'rbc', 'logic', 'pump', 'gate', 'operation', 'swmm'],
    description: 'Control rules in SWMM automate pump, gate, and weir operations based on conditions.',
    details: [
      'IF-THEN-ELSE logic structure',
      'Conditions: NODE depth, LINK flow, SIMULATION time',
      'Actions: SET pump ON/OFF, gate SETTING',
      'Priority levels resolve conflicting rules',
    ],
    relatedConcepts: ['swmm-pumps', 'swmm-orifices', 'swmm-weirs'],
  },

  // Additional Troubleshooting Scenarios
  {
    id: 'troubleshooting-surcharge',
    title: 'Pipe Surcharging Issues',
    category: 'troubleshooting',
    keywords: ['surcharge', 'flooding', 'overflow', 'capacity', 'manhole', 'surcharged'],
    description: 'Pipes flowing full and exceeding capacity, causing manhole flooding and model instability.',
    details: [
      'Check pipe sizing against design flow capacity',
      'Increase max depth at junction nodes to allow ponding',
      'Add parallel relief pipes for undersized sections',
      'Review inflow hydrographs for unrealistic peaks',
    ],
    relatedConcepts: ['preissmann-slot', 'swmm-junctions'],
  },
  {
    id: 'troubleshooting-mass-balance',
    title: 'Mass Balance Errors',
    category: 'troubleshooting',
    keywords: ['mass balance', 'continuity', 'error', 'water lost', 'volume', 'conservation'],
    description: 'Model shows significant mass balance errors indicating water is being lost or gained spuriously.',
    details: [
      'Errors > 10% indicate serious issues',
      'Check for disconnected network elements',
      'Reduce time step for dynamic wave routing',
      'Review storage node overflow settings',
    ],
    relatedConcepts: ['courant-number', 'swmm-routing'],
  },
  {
    id: 'troubleshooting-convergence',
    title: 'Solver Convergence Failure',
    category: 'troubleshooting',
    keywords: ['convergence', 'iteration', 'diverge', 'fail', 'crash', 'solver', 'instability'],
    description: 'Numerical solver fails to converge within maximum iterations, causing simulation failure.',
    details: [
      'Increase max iterations (default 8 may be too low)',
      'Reduce routing time step',
      'Check for very small or zero-length conduits',
      'Review adverse slopes and pump curves',
    ],
    relatedConcepts: ['swmm-routing', 'courant-number', 'oscillations'],
  },
  {
    id: 'troubleshooting-backwater',
    title: 'Backwater Not Propagating',
    category: 'troubleshooting',
    keywords: ['backwater', 'downstream', 'not affecting', 'upstream', 'tailwater'],
    description: 'Downstream conditions not affecting upstream water levels as expected.',
    details: [
      'Ensure using dynamic wave routing (not kinematic)',
      'Check for supercritical flow sections blocking backwater',
      'Verify downstream boundary condition is realistic',
      'Review conduit slopes - very steep slopes resist backwater',
    ],
    relatedConcepts: ['gvf', 'swmm-routing', 'froude-number'],
  },
  {
    id: 'troubleshooting-dry-pipes',
    title: 'Pipes Starting Dry',
    category: 'troubleshooting',
    keywords: ['dry', 'empty', 'initialization', 'no flow', 'startup'],
    description: 'Conduits have no initial flow, causing instability at simulation start.',
    details: [
      'Set initial flows in conduit properties',
      'Use hot start file from previous simulation',
      'Add baseflow to upstream nodes',
      'Allow sufficient warm-up period before event',
    ],
    relatedConcepts: ['troubleshooting-negative', 'boundary-conditions'],
  },
  {
    id: 'troubleshooting-pump-cycling',
    title: 'Pump Cycling/Hunting',
    category: 'troubleshooting',
    keywords: ['pump', 'cycling', 'oscillating', 'hunting', 'on-off', 'unstable'],
    description: 'Pumps rapidly switching on/off causing flow oscillations and unrealistic results.',
    details: [
      'Add hysteresis to pump control rules (dead band)',
      'Use start-up/shut-down delays',
      'Increase wet well storage volume',
      'Reduce time step during pump operation',
    ],
    relatedConcepts: ['swmm-pumps', 'swmm-controls', 'oscillations'],
  },
  {
    id: 'troubleshooting-flooding-volume',
    title: 'Unrealistic Flooding Volumes',
    category: 'troubleshooting',
    keywords: ['flooding', 'volume', 'unrealistic', 'too much', 'too little', 'ponding'],
    description: 'Model predicting flooding volumes that do not match observed data or expectations.',
    details: [
      'Verify subcatchment areas and percent impervious',
      'Check rainfall data units and time intervals',
      'Review infiltration parameters for reasonableness',
      'Confirm storage-depth curves for detention facilities',
    ],
    relatedConcepts: ['swmm-subcatchments', 'swmm-storage', 'swmm-infiltration'],
  },
  {
    id: 'troubleshooting-lid-performance',
    title: 'LID Not Reducing Runoff',
    category: 'troubleshooting',
    keywords: ['lid', 'green infrastructure', 'not working', 'runoff', 'infiltration'],
    description: 'Low Impact Development controls not providing expected runoff reduction.',
    details: [
      'Check soil conductivity and storage capacity values',
      'Verify LID is assigned to correct subcatchment',
      'Review % of impervious area treated by LID',
      'Ensure drain offset is set correctly for underdrain',
    ],
    relatedConcepts: ['lid-controls', 'swmm-subcatchments', 'swmm-infiltration'],
  },

  // Additional Advanced Concepts
  {
    id: 'specific-energy',
    title: 'Specific Energy',
    category: 'equations',
    keywords: ['specific energy', 'depth', 'velocity', 'minimum', 'critical', 'e-y diagram'],
    formula: 'E = y + V²/(2g) = y + Q²/(2gA²)',
    description: 'Energy per unit weight measured relative to channel bed. Minimum at critical depth.',
    details: [
      'E-y diagram shows alternate depths for same energy',
      'Subcritical: deeper, slower flow',
      'Supercritical: shallower, faster flow',
      'Critical depth occurs at minimum specific energy',
    ],
    relatedConcepts: ['critical-depth', 'froude-number', 'energy-equation'],
  },
  {
    id: 'momentum-function',
    title: 'Momentum Function',
    category: 'equations',
    keywords: ['momentum', 'force', 'specific force', 'hydraulic jump', 'conjugate'],
    formula: 'M = Q²/(gA) + ȳ×A',
    description: 'Force plus momentum flux per unit weight. Used for hydraulic jump and gate flow analysis.',
    details: [
      'Also called "specific force"',
      'Equal M values define sequent (conjugate) depths',
      'Used to locate hydraulic jump position',
      'Important for stilling basin design',
    ],
    relatedConcepts: ['hydraulic-jump', 'froude-number', 'energy-equation'],
  },
  {
    id: 'compound-channels',
    title: 'Compound Channels',
    category: 'modeling',
    keywords: ['compound', 'channel', 'floodplain', 'divided', 'subsection', 'overbank'],
    description: 'Channels with distinctly different geometry/roughness zones requiring divided flow analysis.',
    details: [
      'Divide into main channel + left/right floodplains',
      'Calculate separate conveyance for each zone',
      'Sum conveyances for total discharge capacity',
      'Account for velocity differences between zones',
    ],
    relatedConcepts: ['conveyance', 'roughness-zones', 'bank-markers'],
  },
  {
    id: 'bridge-hydraulics',
    title: 'Bridge Hydraulics',
    category: 'structures',
    keywords: ['bridge', 'contraction', 'afflux', 'pier', 'deck', 'pressure flow'],
    description: 'Flow constriction at bridges causes backwater (afflux) and potential pressure flow under decks.',
    details: [
      'Low flow: free surface through opening',
      'Intermediate: weir flow over roadway',
      'High flow: pressure flow under deck + weir overflow',
      'Pier losses: drag and blockage effects',
    ],
    relatedConcepts: ['culvert-inlet-control', 'weir-flow', 'energy-equation'],
  },
  {
    id: 'flap-gates',
    title: 'Flap Gates / Tide Gates',
    category: 'structures',
    keywords: ['flap gate', 'tide gate', 'check valve', 'backflow', 'prevention', 'one-way'],
    description: 'One-way flow devices that prevent tidal or downstream backflow into drainage systems.',
    details: [
      'Opens when upstream head > downstream head',
      'Head loss varies with opening angle',
      'Critical for coastal and tidal applications',
      'Include in control rules or as special link types',
    ],
    relatedConcepts: ['swmm-orifices', 'swmm-controls', 'boundary-conditions'],
  },
  {
    id: 'dry-weather-flow',
    title: 'Dry Weather Flow (DWF)',
    category: 'modeling',
    keywords: ['dry weather', 'baseflow', 'sanitary', 'diurnal', 'pattern', 'dwf'],
    description: 'Continuous baseflow in combined/sanitary systems from wastewater and groundwater infiltration.',
    details: [
      'Average daily flow multiplied by diurnal pattern',
      'Patterns vary by day of week (weekend/weekday)',
      'Groundwater infiltration adds during wet periods',
      'Critical for water quality and treatment plant sizing',
    ],
    relatedConcepts: ['swmm-junctions', 'boundary-conditions'],
  },

  // InfoWorks ICM Simulation Parameters
  {
    id: 'icm-simulation-engine',
    title: 'ICM Simulation Engine',
    category: 'software',
    keywords: ['icm', 'simulation', 'engine', 'solver', 'infoworks', 'autodesk', 'routing'],
    description: 'InfoWorks ICM uses an implicit finite-difference solver for 1D network routing with adaptive time-stepping.',
    details: [
      'Preissmann 4-point implicit scheme for pipe/channel routing',
      'Adaptive time-stepping based on Courant condition',
      'Supports both sewer (closed conduit) and river (open channel) modes',
      'Full hydrodynamic, kinematic, or steady-state options',
    ],
    relatedConcepts: ['saint-venant', 'preissmann-slot', 'courant-number'],
  },
  {
    id: 'icm-timestep-control',
    title: 'ICM Timestep Control',
    category: 'software',
    keywords: ['timestep', 'dt', 'time step', 'adaptive', 'icm', 'simulation'],
    formula: 'Δt = min(Δt_max, Δx/(V+c))',
    description: 'ICM automatically adjusts computational timesteps to maintain numerical stability while maximizing efficiency.',
    details: [
      'Minimum timestep: 0.5 seconds (can be reduced for stability)',
      'Maximum timestep: typically 10-60 seconds',
      'Multiplier controls timestep adjustment rate',
      'Smaller timesteps near hydraulic controls and rapid changes',
    ],
    relatedConcepts: ['courant-number', 'icm-simulation-engine'],
  },
  {
    id: 'icm-theta-value',
    title: 'ICM Theta (θ) Value',
    category: 'software',
    keywords: ['theta', 'preissmann', 'weighting', 'implicit', 'icm', 'numerical'],
    formula: 'θ = 0.55 to 1.0 (default 0.75)',
    description: 'The Preissmann weighting factor controls the balance between implicit and explicit terms in the numerical scheme.',
    details: [
      'θ = 0.5: Crank-Nicolson (2nd order, may oscillate)',
      'θ = 1.0: Fully implicit (1st order, maximum damping)',
      'θ = 0.75: Default balance of accuracy and stability',
      'Increase θ if experiencing oscillations',
    ],
    relatedConcepts: ['preissmann-slot', 'oscillations', 'icm-simulation-engine'],
  },
  {
    id: 'icm-slot-parameters',
    title: 'ICM Preissmann Slot Parameters',
    category: 'software',
    keywords: ['slot', 'preissmann', 'width', 'gradient', 'pressurized', 'icm'],
    description: 'Fine-tuning Preissmann slot behavior for pressurized flow in pipes and culverts.',
    details: [
      'Slot base width: typically 1-5% of pipe width',
      'Slot sidewall gradient: controls slot widening with pressure',
      'Transition height: where slot becomes active above soffit',
      'Too narrow slot causes stiffness; too wide causes mass errors',
    ],
    relatedConcepts: ['preissmann-slot', 'troubleshooting-slow'],
  },
  {
    id: 'icm-results-timestep',
    title: 'ICM Results Timestep',
    category: 'software',
    keywords: ['results', 'output', 'timestep', 'interval', 'storage', 'icm'],
    description: 'Controls the frequency of saving simulation results, independent of computational timestep.',
    details: [
      'Coarser results timestep reduces file size',
      'Set to match required output resolution (e.g., 5-minute for flood mapping)',
      'Does not affect computation accuracy',
      'Finer timestep for detailed hydrograph analysis',
    ],
    relatedConcepts: ['icm-timestep-control', 'icm-simulation-engine'],
  },
  {
    id: 'icm-initial-conditions',
    title: 'ICM Initial Conditions',
    category: 'software',
    keywords: ['initial', 'conditions', 'startup', 'hotstart', 'warm-up', 'icm'],
    description: 'Setting up the starting state of the hydraulic model before the main simulation period.',
    details: [
      'Options: dry start, specified depths, or hotstart file',
      'Hotstart saves state at end of simulation for reuse',
      'Warm-up period allows system to reach quasi-steady state',
      'Initial water levels must be above lowest bed elevation',
    ],
    relatedConcepts: ['troubleshooting-negative', 'boundary-conditions'],
  },
  {
    id: 'icm-inertia-term',
    title: 'ICM Inertia Term Treatment',
    category: 'software',
    keywords: ['inertia', 'acceleration', 'momentum', 'full', 'simplified', 'icm'],
    description: 'Controls how acceleration terms are handled in the momentum equation for different flow conditions.',
    details: [
      'Full: Complete momentum equation (best for rapid changes)',
      'Reduced: Partial inertia (more stable, less accurate)',
      'Ignore: Diffusion wave approximation (fastest, least accurate)',
      'Use Full for flood routing, Reduced for long-term simulations',
    ],
    relatedConcepts: ['saint-venant', 'icm-simulation-engine', 'oscillations'],
  },

  // 2D Mesh Settings
  {
    id: 'icm-2d-zone',
    title: 'ICM 2D Zone',
    category: 'software',
    keywords: ['2d', 'zone', 'mesh', 'floodplain', 'overland', 'icm'],
    description: 'A 2D zone defines the area where overland flow is computed using a triangular mesh.',
    details: [
      'Created from polygons representing floodplain extent',
      'Contains mesh generation parameters',
      'Links to 1D network via bank lines or manholes',
      'Multiple zones can be used in one model',
    ],
    relatedConcepts: ['1d-2d-coupling', 'icm-mesh-generation', 'icm-mesh-element-size'],
  },
  {
    id: 'icm-mesh-generation',
    title: 'ICM Mesh Generation',
    category: 'software',
    keywords: ['mesh', 'generation', 'triangle', 'element', 'quality', 'icm'],
    description: 'The process of discretizing a 2D zone into triangular elements for numerical solution.',
    details: [
      'Triangular elements adapt to complex geometries',
      'Mesh lines enforce element alignment along features',
      'Minimum angle controls element quality (>25° recommended)',
      'Maximum area limits largest element size',
    ],
    relatedConcepts: ['icm-2d-zone', 'icm-mesh-element-size', 'icm-mesh-roughness'],
  },
  {
    id: 'icm-mesh-element-size',
    title: 'ICM Mesh Element Size',
    category: 'software',
    keywords: ['mesh', 'element', 'size', 'resolution', 'area', 'icm', '2d'],
    formula: 'Element edge ≈ √(2 × Max Area)',
    description: 'Controls the spatial resolution of the 2D mesh - smaller elements capture more detail but increase computation.',
    details: [
      'Fine mesh (2-10m): Urban areas, critical flow paths',
      'Medium mesh (10-50m): Floodplain with moderate variation',
      'Coarse mesh (50-200m): Rural/open areas',
      'Balance detail vs. computational cost',
    ],
    relatedConcepts: ['icm-mesh-generation', 'icm-2d-timestep', 'troubleshooting-slow'],
  },
  {
    id: 'icm-mesh-roughness',
    title: 'ICM 2D Mesh Roughness',
    category: 'software',
    keywords: ['mesh', 'roughness', 'manning', 'friction', '2d', 'icm', 'land use'],
    description: 'Assigning Manning\'s n values to 2D mesh elements based on land use or surface type.',
    details: [
      'Can be uniform, from polygons, or from grid data',
      'Typical values: roads 0.015, grass 0.03, buildings 0.5+',
      'Higher roughness on buildings blocks flow (effective barrier)',
      'Consider seasonal vegetation changes',
    ],
    relatedConcepts: ['roughness-zones', 'mannings-equation', 'icm-2d-zone'],
  },
  {
    id: 'icm-2d-timestep',
    title: 'ICM 2D Timestep',
    category: 'software',
    keywords: ['2d', 'timestep', 'courant', 'stability', 'mesh', 'icm'],
    formula: 'Δt_2D = CFL × Δx / √(gh)',
    description: 'The 2D solver timestep is constrained by the smallest mesh elements and deepest water.',
    details: [
      'Automatically calculated from mesh and water depth',
      '2D often uses smaller timestep than 1D',
      'Very small elements can drastically slow simulation',
      'Check 2D Courant numbers in results',
    ],
    relatedConcepts: ['courant-number', 'icm-mesh-element-size', 'troubleshooting-slow'],
  },
  {
    id: 'icm-mesh-lines',
    title: 'ICM Mesh Lines (Breaklines)',
    category: 'software',
    keywords: ['mesh', 'lines', 'breaklines', 'alignment', 'features', 'icm'],
    description: 'Lines that force mesh edges to align along important hydraulic features like walls, roads, and channels.',
    details: [
      'Use along embankments, walls, kerbs, channels',
      'Forces element edges to follow the line',
      'Can have elevation data assigned',
      'Critical for accurate representation of barriers',
    ],
    relatedConcepts: ['icm-mesh-generation', 'icm-2d-zone', 'icm-porous-walls'],
  },
  {
    id: 'icm-porous-walls',
    title: 'ICM Porous Walls',
    category: 'software',
    keywords: ['porous', 'wall', 'barrier', 'hedge', 'fence', 'icm', '2d'],
    description: 'Linear features in 2D that allow partial flow through, representing hedges, fences, or partial barriers.',
    details: [
      'Porosity coefficient: 0 (solid) to 1 (fully open)',
      'Head loss calculated based on porosity and flow',
      'Use for hedges, permeable fences, porous dams',
      'Alternative to raising ground levels',
    ],
    relatedConcepts: ['icm-mesh-lines', 'icm-2d-zone'],
  },
  {
    id: 'icm-inline-banks',
    title: 'ICM Inline Banks',
    category: 'software',
    keywords: ['inline', 'bank', 'embankment', '2d', 'barrier', 'icm'],
    description: 'Linear barriers within 2D zones that block flow until overtopped, representing embankments or levees.',
    details: [
      'Crest level defines overtopping threshold',
      'Flow over uses weir equation',
      'No flow through until water exceeds crest',
      'Use for flood defenses, road embankments',
    ],
    relatedConcepts: ['weir-flow', 'icm-mesh-lines', 'icm-2d-zone'],
  },
  {
    id: 'icm-ground-model',
    title: 'ICM Ground Model',
    category: 'software',
    keywords: ['ground', 'model', 'terrain', 'dem', 'dtm', 'elevation', 'icm'],
    description: 'Digital terrain data used to set mesh node elevations and interpolate cross-section geometry.',
    details: [
      'Imported from TIN, grid, or ASCII formats',
      'Resolution affects mesh accuracy and 2D results',
      'Use high-resolution LiDAR where available',
      'Ground model updates mesh elevations during generation',
    ],
    relatedConcepts: ['icm-mesh-generation', 'icm-2d-zone', 'cross-section'],
  },

  // Common ICM Workflows
  {
    id: 'icm-build-1d-model',
    title: 'Building a 1D River Model',
    category: 'software',
    keywords: ['workflow', '1d', 'river', 'build', 'model', 'icm', 'steps'],
    description: 'Step-by-step workflow for creating a 1D river reach model in InfoWorks ICM.',
    details: [
      '1. Create nodes at river endpoints and key locations',
      '2. Connect with river reach links',
      '3. Add cross-sections with survey data and bank markers',
      '4. Set boundary conditions (inflow upstream, level downstream)',
      '5. Assign roughness values by zone',
    ],
    relatedConcepts: ['icm-river-reach', 'cross-section', 'boundary-conditions'],
  },
  {
    id: 'icm-add-2d-floodplain',
    title: 'Adding 2D Floodplain to River Model',
    category: 'software',
    keywords: ['workflow', '2d', 'floodplain', 'coupling', 'river', 'icm'],
    description: 'Workflow for coupling a 2D floodplain mesh to an existing 1D river model.',
    details: [
      '1. Create 2D zone polygon covering floodplain extent',
      '2. Import ground model (DEM/DTM)',
      '3. Define mesh parameters and breaklines',
      '4. Generate mesh and check quality',
      '5. Add 1D/2D connections at bank markers or lateral spills',
    ],
    relatedConcepts: ['1d-2d-coupling', 'icm-2d-zone', 'icm-mesh-generation'],
  },
  {
    id: 'icm-validate-model',
    title: 'Model Validation Workflow',
    category: 'software',
    keywords: ['workflow', 'validate', 'check', 'quality', 'errors', 'icm'],
    description: 'Essential checks to validate model data before running simulations.',
    details: [
      '1. Run validation tool (flags errors and warnings)',
      '2. Check connectivity (all nodes connected)',
      '3. Verify cross-section coverage and bank markers',
      '4. Review boundary conditions are assigned',
      '5. Check roughness values are reasonable',
    ],
    relatedConcepts: ['icm-build-1d-model', 'troubleshooting-drying', 'troubleshooting-negative'],
  },
  {
    id: 'icm-calibration',
    title: 'Model Calibration Process',
    category: 'software',
    keywords: ['workflow', 'calibration', 'observed', 'gauge', 'adjustment', 'icm'],
    description: 'Adjusting model parameters to match observed data for validation and prediction confidence.',
    details: [
      'Compare simulated vs observed water levels and flows',
      'Primary adjustment: Manning\'s n (roughness)',
      'Secondary: structure coefficients (weirs, gates)',
      'Document calibration events and parameter changes',
      'Validate with independent events not used for calibration',
    ],
    relatedConcepts: ['roughness-zones', 'mannings-equation', 'boundary-conditions'],
  },
  {
    id: 'icm-flood-mapping',
    title: 'Flood Mapping Workflow',
    category: 'software',
    keywords: ['workflow', 'flood', 'map', 'extent', 'depth', 'hazard', 'icm'],
    description: 'Generating flood extent and depth maps from 2D simulation results.',
    details: [
      '1. Run simulation with design event (e.g., 1% AEP)',
      '2. Extract maximum water level and depth results',
      '3. Export to GIS format (shapefile, grid)',
      '4. Apply styling for depth bands and hazard classification',
      '5. Consider freeboard and uncertainty in mapping',
    ],
    relatedConcepts: ['icm-2d-zone', 'icm-add-2d-floodplain'],
  },
  {
    id: 'icm-scenario-management',
    title: 'ICM Scenario Management',
    category: 'software',
    keywords: ['scenario', 'what-if', 'options', 'management', 'icm'],
    description: 'Using scenarios to compare different model configurations or mitigation options.',
    details: [
      'Base scenario: existing conditions',
      'Alternative scenarios: proposed changes (defenses, development)',
      'Scenarios share common data, differ in specific layers',
      'Compare results between scenarios easily',
      'Track changes and assumptions per scenario',
    ],
    relatedConcepts: ['icm-flood-mapping', 'icm-validate-model'],
  },
  {
    id: 'icm-long-section',
    title: 'ICM Long Section View',
    category: 'software',
    keywords: ['long section', 'profile', 'longitudinal', 'water level', 'icm'],
    description: 'Viewing water levels, bed levels, and structure positions along a river reach.',
    details: [
      'Shows bed, banks, water surface along chainage',
      'Animate through time to see flood propagation',
      'Identify backwater effects and structure impacts',
      'Compare different scenarios or time steps',
    ],
    relatedConcepts: ['gvf', 'icm-river-reach', 'cross-section'],
  },
  {
    id: 'icm-sql-queries',
    title: 'ICM SQL Queries',
    category: 'software',
    keywords: ['sql', 'query', 'select', 'data', 'extract', 'icm'],
    description: 'Using SQL syntax to select, modify, or export model data in InfoWorks ICM.',
    details: [
      'SELECT statements for data extraction',
      'UPDATE for bulk parameter changes',
      'Filter by attributes, geometry, or results',
      'Export query results to CSV or other formats',
      'Powerful for QA/QC and bulk edits',
    ],
    relatedConcepts: ['icm-validate-model', 'icm-scenario-management'],
  },
  {
    id: 'icm-ruby-scripting',
    title: 'ICM Ruby Scripting',
    category: 'software',
    keywords: ['ruby', 'script', 'automation', 'batch', 'icm', 'api'],
    description: 'Automating repetitive tasks and custom workflows using Ruby scripts in ICM.',
    details: [
      'Access network objects and properties programmatically',
      'Automate model building, validation, results extraction',
      'Batch run multiple simulations',
      'Create custom tools and reports',
      'Exchange API enables external application integration',
    ],
    relatedConcepts: ['icm-sql-queries', 'icm-scenario-management'],
  },
  {
    id: 'icm-results-analysis',
    title: 'ICM Results Analysis',
    category: 'software',
    keywords: ['results', 'analysis', 'time series', 'statistics', 'icm'],
    description: 'Tools for analyzing and visualizing simulation results in InfoWorks ICM.',
    details: [
      'Time series graphs for any node/link parameter',
      'Thematic mapping of maximum values',
      'Long section profiles with animation',
      'Statistics: peak, volume, timing',
      'Export to CSV, GIS formats',
    ],
    relatedConcepts: ['icm-long-section', 'icm-flood-mapping'],
  },

  // ICM Troubleshooting
  {
    id: 'icm-troubleshoot-unstable',
    title: 'ICM Unstable Simulation',
    category: 'troubleshooting',
    keywords: ['unstable', 'crash', 'oscillation', 'icm', 'diverge', 'fail'],
    description: 'Diagnosing and fixing simulation instability issues in ICM models.',
    details: [
      'Check for sudden geometry changes (drops, expansions)',
      'Review Preissmann slot settings (width, gradient)',
      'Reduce maximum timestep',
      'Increase theta value (more implicit damping)',
      'Check boundary conditions for realistic values',
    ],
    relatedConcepts: ['oscillations', 'icm-theta-value', 'icm-timestep-control'],
  },
  {
    id: 'icm-troubleshoot-mass-balance',
    title: 'ICM Mass Balance Errors',
    category: 'troubleshooting',
    keywords: ['mass', 'balance', 'continuity', 'error', 'volume', 'icm'],
    description: 'Investigating mass balance issues where water volume is not conserved.',
    details: [
      'Small errors (<1%) are typically acceptable',
      'Large errors: check for very short links or sudden changes',
      'Review Preissmann slot (too wide loses mass)',
      'Check for lost water at model boundaries',
      'Examine 1D/2D coupling volumes',
    ],
    relatedConcepts: ['continuity-errors', 'icm-slot-parameters', '1d-2d-coupling'],
  },
  {
    id: 'icm-troubleshoot-2d-slow',
    title: 'ICM 2D Running Slowly',
    category: 'troubleshooting',
    keywords: ['2d', 'slow', 'performance', 'mesh', 'timestep', 'icm'],
    description: 'Improving 2D simulation performance when runs take too long.',
    details: [
      'Coarsen mesh in non-critical areas',
      'Remove very small mesh elements (check minimum area)',
      'Reduce mesh extent to area of interest',
      'Use mesh zones with different resolution',
      'Check for deep, narrow channels causing small timesteps',
    ],
    relatedConcepts: ['icm-mesh-element-size', 'icm-2d-timestep', 'troubleshooting-slow'],
  },
  {
    id: 'icm-troubleshoot-flooding',
    title: 'ICM Unexpected Flooding/Drying',
    category: 'troubleshooting',
    keywords: ['flooding', 'drying', 'unexpected', 'levels', 'icm', '2d'],
    description: 'Diagnosing unexpected flood patterns or drying issues in 2D models.',
    details: [
      'Check ground model accuracy (DEM errors, buildings)',
      'Verify mesh breaklines along barriers are correct',
      'Review inline bank crest levels',
      'Check 1D/2D connection levels and coefficients',
      'Examine roughness values for buildings and barriers',
    ],
    relatedConcepts: ['icm-ground-model', 'icm-inline-banks', 'troubleshooting-floodplain'],
  },
];

// Search function
export const searchConcepts = (query: string): Concept[] => {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  
  const scored = knowledgeBase.map(concept => {
    let score = 0;
    
    // Title match (highest weight)
    if (concept.title.toLowerCase().includes(lowerQuery)) score += 100;
    if (concept.title.toLowerCase() === lowerQuery) score += 50;
    
    // Keyword match (high weight)
    concept.keywords.forEach(kw => {
      if (kw.includes(lowerQuery)) score += 40;
      if (lowerQuery.includes(kw)) score += 30;
      queryWords.forEach(word => {
        if (kw.includes(word)) score += 15;
      });
    });
    
    // Description match
    if (concept.description.toLowerCase().includes(lowerQuery)) score += 20;
    queryWords.forEach(word => {
      if (concept.description.toLowerCase().includes(word)) score += 5;
    });
    
    // Details match
    concept.details.forEach(detail => {
      if (detail.toLowerCase().includes(lowerQuery)) score += 10;
      queryWords.forEach(word => {
        if (detail.toLowerCase().includes(word)) score += 2;
      });
    });
    
    // Formula match
    if (concept.formula?.toLowerCase().includes(lowerQuery)) score += 25;
    
    // Category match
    if (concept.category.includes(lowerQuery)) score += 15;
    
    return { concept, score };
  });
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(s => s.concept);
};

// Get concepts by category
export const getConceptsByCategory = (category: Concept['category']): Concept[] => {
  return knowledgeBase.filter(c => c.category === category);
};

// Get related concepts
export const getRelatedConcepts = (conceptId: string): Concept[] => {
  const concept = knowledgeBase.find(c => c.id === conceptId);
  if (!concept?.relatedConcepts) return [];
  return knowledgeBase.filter(c => concept.relatedConcepts?.includes(c.id));
};
