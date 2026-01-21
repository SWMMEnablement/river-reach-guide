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
