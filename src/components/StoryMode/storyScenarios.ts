import { ReactNode } from 'react';

export interface StoryChoice {
  id: string;
  text: string;
  consequence: string;
  isCorrect: boolean;
  leadsTo?: string; // chapter id to jump to
}

export interface StoryChapter {
  id: string;
  phase: 'intro' | 'investigation' | 'modeling' | 'analysis' | 'resolution';
  title: string;
  location: string;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night' | 'storm';
  narrative: string;
  task?: string;
  targetSection?: string;
  interactionHint?: string;
  choices?: StoryChoice[];
  revealConcept?: string;
  characterDialogue?: {
    speaker: 'mentor' | 'mayor' | 'engineer' | 'narrator' | 'operator' | 'resident';
    text: string;
  };
  achievement?: string;
}

export interface StoryScenario {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  description: string;
  learningOutcomes: string[];
  chapters: StoryChapter[];
}

export const storyScenarios: StoryScenario[] = [
  {
    id: 'riverside-flood',
    title: 'The Riverside Crisis',
    subtitle: 'A Storm is Coming',
    difficulty: 'beginner',
    estimatedTime: '15-20 min',
    description: 'A severe storm system is approaching Riverside Town. As a junior hydraulic engineer, you must help your team model the river to predict flood impacts and protect the community.',
    learningOutcomes: [
      'Understand the components of a 1D river model',
      'Learn how Manning\'s equation predicts flow',
      'Apply culvert sizing to protect infrastructure',
      'Interpret Froude numbers for flow regime analysis'
    ],
    chapters: [
      {
        id: 'ch1-alert',
        phase: 'intro',
        title: 'The Alert',
        location: 'Engineering Office',
        timeOfDay: 'dawn',
        narrative: 'Your phone buzzes at 6 AM. It\'s an emergency alert from the National Weather Service: "Severe Storm Warning - 150mm rainfall expected over 24 hours." You rush to the office where your mentor, Dr. Sarah Chen, is already reviewing the situation.',
        characterDialogue: {
          speaker: 'mentor',
          text: '"Good, you\'re here. The mayor needs flood predictions by noon. We have a 1D model of the Riverside River, but I need you to verify our cross-sections and boundary conditions before we run the simulation. Let\'s start with understanding the model structure."'
        },
        targetSection: 'diagram',
        interactionHint: 'Explore the river reach diagram to understand the model components',
      },
      {
        id: 'ch2-model-structure',
        phase: 'investigation',
        title: 'Understanding the Model',
        location: 'Modeling Lab',
        timeOfDay: 'day',
        narrative: 'Dr. Chen pulls up the river model schematic on the large screen. The model shows nodes, river reaches, cross-sections, and boundary conditions. She points to each element.',
        characterDialogue: {
          speaker: 'mentor',
          text: '"This is a classic 1D river reach setup. The upstream node receives our inflow hydrograph from the storm. The downstream boundary is the tidal outlet. Between them, we have surveyed cross-sections every 200 meters. Can you identify what controls the flow capacity?"'
        },
        choices: [
          {
            id: 'choice-geometry',
            text: 'The cross-section geometry and channel roughness',
            consequence: 'Correct! Manning\'s equation shows Q depends on area, hydraulic radius, slope, and roughness coefficient n.',
            isCorrect: true,
          },
          {
            id: 'choice-slope-only',
            text: 'Only the bed slope of the channel',
            consequence: 'Partially correct, but slope alone doesn\'t determine capacity. Geometry and roughness are equally important.',
            isCorrect: false,
          },
          {
            id: 'choice-water-level',
            text: 'The downstream water level only',
            consequence: 'Downstream level affects backwater, but capacity depends on the channel\'s physical properties.',
            isCorrect: false,
          }
        ],
        revealConcept: 'Manning\'s equation: Q = (1/n) × A × R^(2/3) × S^(1/2)',
      },
      {
        id: 'ch3-cross-section',
        phase: 'modeling',
        title: 'Checking the Cross-Sections',
        location: 'Channel Visualizer',
        timeOfDay: 'day',
        narrative: 'The river through Riverside has a trapezoidal main channel with vegetated floodplains on both sides. During normal flow, water stays in the main channel. But this storm could push water onto the floodplains.',
        characterDialogue: {
          speaker: 'mentor',
          text: '"I need you to check if our assumed Manning\'s n values are reasonable. The main channel has some gravel and cobbles, while the floodplains have dense grass and scattered trees. Use the visualizer to see how different roughness affects the conveyance."'
        },
        targetSection: 'editor',
        interactionHint: 'Adjust the Manning\'s n slider and observe how velocity and discharge change',
        task: 'Find the conveyance with n=0.035 for main channel and n=0.07 for floodplain',
      },
      {
        id: 'ch4-culvert-crisis',
        phase: 'modeling',
        title: 'The Culvert Problem',
        location: 'Main Street Crossing',
        timeOfDay: 'dusk',
        narrative: 'The storm has begun. Rain is falling steadily and the river is rising. You receive a call from the mayor.',
        characterDialogue: {
          speaker: 'mayor',
          text: '"There\'s a road crossing on Main Street with a culvert that flooded last time. We can\'t evacuate if that road is underwater! Can your model tell us if it will overtop?"'
        },
        targetSection: 'culvert-calculator',
        interactionHint: 'Use the Culvert Design Calculator to check capacity',
        choices: [
          {
            id: 'choice-hw',
            text: 'I need to check if the headwater exceeds the road elevation',
            consequence: 'Exactly right. If HW > road level, the culvert overtops and the road floods.',
            isCorrect: true,
          },
          {
            id: 'choice-velocity',
            text: 'I need to check if the velocity is too high',
            consequence: 'Velocity matters for scour, but road flooding depends on headwater depth.',
            isCorrect: false,
          }
        ],
        revealConcept: 'Culverts are governed by inlet control (entrance capacity) or outlet control (barrel friction + tailwater)',
      },
      {
        id: 'ch5-froude',
        phase: 'analysis',
        title: 'Reading the Flow Regime',
        location: 'Spillway Observation Deck',
        timeOfDay: 'storm',
        narrative: 'The storm peaks overnight. By morning, you\'re at the spillway downstream of town, watching the churning water. Something looks unusual near the stilling basin.',
        characterDialogue: {
          speaker: 'mentor',
          text: '"See that violent turbulence there? That\'s a hydraulic jump. The flow coming down the spillway is supercritical—fast and shallow. It has to transition to subcritical flow to match the slower, deeper tailwater. Can you calculate where the jump should form?"'
        },
        targetSection: 'froude-calculator',
        interactionHint: 'Use the Froude Number Calculator to analyze the flow regime transition',
        task: 'Find the Froude number upstream and verify it\'s supercritical (Fr > 1)',
        revealConcept: 'Froude Number: Fr = V / √(g × D). Fr > 1 is supercritical, Fr < 1 is subcritical.',
      },
      {
        id: 'ch6-gvf',
        phase: 'analysis',
        title: 'The Backwater Effect',
        location: 'Confluence Zone',
        timeOfDay: 'day',
        narrative: 'As the storm passes, you\'re assessing the aftermath. The tributary that joins the Riverside River has higher water marks than expected. Dr. Chen suspects backwater effects.',
        characterDialogue: {
          speaker: 'mentor',
          text: '"When the main river rose, it raised the water level at the confluence. This backwater propagated upstream into the tributary as an M1 profile. That\'s why the houses upstream flooded even though the tributary flow wasn\'t that high. Can you compute the backwater curve?"'
        },
        targetSection: 'gvf-calculator',
        interactionHint: 'Use the GVF Profile Calculator to model the M1 backwater curve',
        revealConcept: 'M1 profile: Mild slope with depth > normal depth. Caused by raised downstream level.',
      },
      {
        id: 'ch7-resolution',
        phase: 'resolution',
        title: 'The Debrief',
        location: 'Town Hall',
        timeOfDay: 'day',
        narrative: 'A week after the storm, you present your findings to the town council. Your model predictions were within 10cm of observed water levels. The mayor shakes your hand.',
        characterDialogue: {
          speaker: 'mayor',
          text: '"Your team\'s quick work let us evacuate the low-lying areas in time. We had zero casualties. I\'d like you to help us plan improvements—larger culverts, floodplain restoration, and an early warning system."'
        },
        achievement: 'Crisis Manager: Successfully modeled flood impacts and supported emergency response',
      },
      {
        id: 'ch8-next-steps',
        phase: 'resolution',
        title: 'Your Journey Continues',
        location: 'Reflection',
        timeOfDay: 'dawn',
        narrative: 'As you look out over the calming river, you reflect on what you\'ve learned. 1D modeling captured the main channel behavior, but the complex floodplain interactions might benefit from 2D modeling next time.',
        characterDialogue: {
          speaker: 'narrator',
          text: 'You\'ve mastered the fundamentals of river reach modeling. The tools you\'ve explored—cross-sections, culverts, flow regime analysis, and GVF profiles—are the building blocks of professional hydraulic engineering. Where will your next project take you?'
        },
        achievement: 'River Reach Graduate: Completed the Riverside Crisis scenario',
      }
    ]
  },
  {
    id: 'coastal-drainage',
    title: 'Tide & Storm',
    subtitle: 'The Coastal Challenge',
    difficulty: 'intermediate',
    estimatedTime: '20-25 min',
    description: 'A coastal town faces a dual threat: high tides and storm surge coinciding with heavy rainfall. Model the compound channel system where fresh river water meets tidal influence.',
    learningOutcomes: [
      'Understand tidal boundary conditions',
      'Model compound channels with floodplains',
      'Analyze weir and sluice gate controls',
      'Apply 1D/2D coupling concepts'
    ],
    chapters: [
      {
        id: 'ct1-briefing',
        phase: 'intro',
        title: 'The Compound Threat',
        location: 'Coastal Engineering HQ',
        timeOfDay: 'dawn',
        narrative: 'Spring tides are approaching, and the forecast shows a low-pressure system that will bring both storm surge and heavy rain. The coastal drainage system relies on gravity outfalls that only work at low tide. If the storm peaks at high tide, the town could be trapped between rising rivers and rising seas.',
        characterDialogue: {
          speaker: 'engineer',
          text: '"We need to model the interaction between tidal levels and fluvial flooding. The river channel is compound—main channel with wide floodplains. Let\'s start by understanding how compound channel flow works differently from simple channels."'
        },
        targetSection: 'compound-channel-calculator',
        interactionHint: 'Explore the Compound Channel Calculator to understand main channel vs floodplain conveyance',
      },
      {
        id: 'ct2-tidal-boundary',
        phase: 'investigation',
        title: 'Setting the Tidal Boundary',
        location: 'Estuary Monitoring Station',
        timeOfDay: 'day',
        narrative: 'You arrive at the tide gauge station at the river mouth. The data shows a predicted high tide of 3.2m AOD, but storm surge could add another 0.8m. This downstream water level will control how much the river can discharge.',
        characterDialogue: {
          speaker: 'operator',
          text: '"The outfall gates are automated—they close when tidal level exceeds river level to prevent saltwater intrusion. But if they stay closed too long during heavy rain, the river backs up. We need to know the critical timing."'
        },
        choices: [
          {
            id: 'choice-tidal-curve',
            text: 'Model with a time-varying tidal boundary condition',
            consequence: 'Correct! Tidal boundaries must vary with time to capture the opening/closing windows for gravity drainage.',
            isCorrect: true,
          },
          {
            id: 'choice-fixed-level',
            text: 'Use the maximum tide level as a fixed boundary',
            consequence: 'This is conservative but misses the drainage windows at low tide. Time-varying boundaries are more accurate.',
            isCorrect: false,
          },
          {
            id: 'choice-ignore-tide',
            text: 'Ignore tidal influence and focus on rainfall',
            consequence: 'Dangerous! In coastal areas, tidal locking can cause worse flooding than the rainfall alone.',
            isCorrect: false,
          }
        ],
        revealConcept: 'Tidal boundaries: Q = f(h_river - h_tide) when h_river > h_tide, else Q = 0 (flap valve closed)',
      },
      {
        id: 'ct3-compound-flow',
        phase: 'modeling',
        title: 'The Floodplain Activates',
        location: 'River Monitoring Station',
        timeOfDay: 'dusk',
        narrative: 'As the tide rises and rain intensifies, river levels climb. The main channel is at capacity, and water is spilling onto the floodplains. The flow dynamics become complex—the floodplain carries water but at a different velocity than the main channel.',
        characterDialogue: {
          speaker: 'engineer',
          text: '"This is where compound channel hydraulics gets interesting. The floodplain has higher roughness, so it flows slower. But there\'s momentum exchange at the interface—the fast main channel drags the slow floodplain water, and vice versa. We need correction factors."'
        },
        targetSection: 'compound-channel-calculator',
        interactionHint: 'Observe how the Coriolis α and Boussinesq β coefficients change as floodplain depth increases',
        task: 'Calculate the composite Manning\'s n using Lotter\'s method for the flooded section',
        revealConcept: 'Momentum exchange: Interface losses reduce total conveyance by 5-15% compared to simple summation',
      },
      {
        id: 'ct4-weir-control',
        phase: 'modeling',
        title: 'The Control Structure',
        location: 'Overflow Weir',
        timeOfDay: 'storm',
        narrative: 'Upstream of the town, there\'s a side-weir that diverts excess flow to a storage pond. The pond can hold 50,000 m³, buying time during tidal locking. But is the weir crest set at the right level?',
        characterDialogue: {
          speaker: 'engineer',
          text: '"The weir starts spilling at 2.5m AOD. I need you to calculate the overflow rate for different headwater levels. If we divert too much, the pond fills before high tide passes. If we divert too little, the town floods."'
        },
        targetSection: 'weir-orifice-calculator',
        interactionHint: 'Use the Weir & Orifice Calculator to find the discharge relationship',
        choices: [
          {
            id: 'choice-weir-sharp',
            text: 'Model as a sharp-crested weir (Cd ≈ 0.6)',
            consequence: 'Good choice for a thin metal crest. The standard weir equation applies well.',
            isCorrect: true,
          },
          {
            id: 'choice-weir-broad',
            text: 'Model as a broad-crested weir (Cd ≈ 0.35)',
            consequence: 'Broad-crested would apply if the crest width > 2×head. Check the geometry!',
            isCorrect: false,
          }
        ],
        revealConcept: 'Side-weir: Q = (2/3) × Cd × L × √(2g) × h^(3/2), but lateral flow creates complex 2D patterns',
      },
      {
        id: 'ct5-coupling',
        phase: 'analysis',
        title: 'Where 1D Meets 2D',
        location: 'Floodplain Edge',
        timeOfDay: 'storm',
        narrative: 'The storm reaches its peak. Water is now flowing across the floodplain in ways your 1D model can\'t capture—it\'s spreading laterally, finding low spots, and flowing behind buildings. Some areas are flooding from the back, not the front.',
        characterDialogue: {
          speaker: 'engineer',
          text: '"This is the limitation of 1D. The floodplain here needs a 2D mesh. We\'ll couple the 1D channel to a 2D zone using bank lines. The 1D gives us efficient channel routing; the 2D captures the complex overland flow paths."'
        },
        targetSection: 'coupling-zones',
        interactionHint: 'Explore the 1D/2D Coupling visualization to see how bank lines connect the two domains',
        revealConcept: '1D/2D coupling: Lateral link or inline bank connects 1D water surface to 2D mesh. Mass and momentum conserved.',
      },
      {
        id: 'ct6-tide-turns',
        phase: 'analysis',
        title: 'The Tide Turns',
        location: 'Outfall Gates',
        timeOfDay: 'night',
        narrative: 'At 2 AM, the tide peaks and begins to fall. The outfall gates creak open as river level finally exceeds sea level. Stored floodwater begins to drain, but will it clear before the next high tide?',
        characterDialogue: {
          speaker: 'operator',
          text: '"The drainage window is about 4 hours. With the pond half full and the floodplains saturated, we need maximum discharge. The gates are fully open—it\'s all down to the river\'s conveyance now."'
        },
        targetSection: 'editor',
        interactionHint: 'Review the rating curve—higher conveyance means faster drainage during low tide windows',
        task: 'Estimate the volume that can drain in 4 hours at the predicted head difference',
      },
      {
        id: 'ct7-lessons',
        phase: 'resolution',
        title: 'Lessons from the Coast',
        location: 'Post-Event Review',
        timeOfDay: 'day',
        narrative: 'The storm has passed. Some properties flooded, but the early warning and controlled storage prevented catastrophic damage. The team gathers to review model performance.',
        characterDialogue: {
          speaker: 'engineer',
          text: '"Our compound channel calculations were within 5% of observed levels. The weir performed as predicted. But the 2D floodplain flow paths surprised us—next time we\'ll extend the 2D mesh further inland. Coastal drainage is always a balance of timing."'
        },
        achievement: 'Tidal Master: Successfully modeled compound flooding in a tidally-influenced system',
      },
      {
        id: 'ct8-reflection',
        phase: 'resolution',
        title: 'Between River and Sea',
        location: 'Estuary Viewpoint',
        timeOfDay: 'dawn',
        narrative: 'You stand at the point where the river meets the sea, watching the tide recede. Coastal hydraulics is a dance between two forces—neither fully controls the system, and timing is everything.',
        characterDialogue: {
          speaker: 'narrator',
          text: 'You\'ve learned to think in compound dimensions—main channel and floodplain, river and tide, 1D and 2D. These concepts apply wherever water systems interact. The coast teaches patience: some problems solve themselves if you just wait for the tide to turn.'
        },
        achievement: 'Coastal Engineer: Completed the Tide & Storm scenario',
      }
    ]
  },
  {
    id: 'urban-flash-flood',
    title: 'Urban Flash Flood',
    subtitle: 'When Streets Become Rivers',
    difficulty: 'advanced',
    estimatedTime: '25-30 min',
    description: 'An intense summer thunderstorm overwhelms the urban drainage network. Model the dual drainage system where surface flow interacts with buried pipes, and every minute counts.',
    learningOutcomes: [
      'Model urban conduit networks (SWMM concepts)',
      'Understand inlet capacity and surface flooding',
      'Apply orifice and weir equations to manholes',
      'Analyze surcharging and surface-subsurface exchange'
    ],
    chapters: [
      {
        id: 'uf1-warning',
        phase: 'intro',
        title: 'The Radar Warning',
        location: 'City Operations Center',
        timeOfDay: 'day',
        narrative: 'The weather radar shows a red blob forming over the city—an intense convective cell that could drop 50mm in 30 minutes. The urban drainage system was designed for 10-year storms. This looks like a 100-year event developing in real-time.',
        characterDialogue: {
          speaker: 'operator',
          text: '"We\'ve got about 20 minutes before it hits downtown. The pipe network will surcharge almost immediately. I need you to identify the critical manholes that will flood first—those are our surface flow origins."'
        },
        targetSection: 'swmm-conduits',
        interactionHint: 'Review the SWMM5 Conduits section to understand how pipe networks behave under surcharge',
      },
      {
        id: 'uf2-network',
        phase: 'investigation',
        title: 'Mapping the Network',
        location: 'Underground Utility View',
        timeOfDay: 'day',
        narrative: 'You pull up the city\'s drainage network model. Buried beneath the streets is a web of concrete pipes ranging from 300mm local collectors to a 2m trunk sewer. The system has limited storage—when pipes fill, water has nowhere to go but up.',
        characterDialogue: {
          speaker: 'engineer',
          text: '"The critical link is the trunk sewer under Main Street. It\'s 80% full just from baseflow. When the storm hits, it will pressurize within minutes. Every manhole becomes a potential geyser. Let\'s check the conduit capacities."'
        },
        choices: [
          {
            id: 'choice-capacity',
            text: 'Calculate pipe-full capacity using Manning\'s equation for circular sections',
            consequence: 'Correct! For pipes: A = πD²/4, R = D/4 at full flow. Capacity = (1/n) × A × R^(2/3) × S^(1/2)',
            isCorrect: true,
          },
          {
            id: 'choice-pressure',
            text: 'Ignore capacity—pipes under pressure can carry infinite flow',
            consequence: 'Dangerous misconception! Pressurized pipes have higher capacity but are still limited by friction and available head.',
            isCorrect: false,
          }
        ],
        revealConcept: 'Pipe full capacity: Q = (1/n) × (πD²/4) × (D/4)^(2/3) × S^(1/2) ≈ 0.312 × D^(8/3) × S^(1/2) / n',
      },
      {
        id: 'uf3-inlets',
        phase: 'modeling',
        title: 'Inlet Interception',
        location: 'Street Level',
        timeOfDay: 'storm',
        narrative: 'The storm arrives with violent intensity. Rain hammers the pavement. Water sheets across the road surface toward the grate inlets. But the inlets have limited capacity—water is ponding in the gutter and starting to flow past the grates.',
        characterDialogue: {
          speaker: 'resident',
          text: '"The water\'s coming up through the drain covers! Look—there\'s water shooting out of that manhole! Is this normal?!"'
        },
        targetSection: 'weir-orifice-calculator',
        interactionHint: 'Model inlet capture using orifice equations—grate inlets behave like orifices when submerged',
        task: 'Calculate the inlet capacity for a 0.6m × 0.9m grate with 50% blockage at 0.1m head',
        revealConcept: 'Grate inlet: Q = Cd × Ao × √(2gh), where Ao = open area. Blockage (leaves, debris) reduces Ao by 20-50%',
      },
      {
        id: 'uf4-surcharge',
        phase: 'modeling',
        title: 'The Surcharge',
        location: 'Trunk Sewer Monitoring',
        timeOfDay: 'storm',
        narrative: 'The SCADA system shows pressures spiking throughout the network. The trunk sewer is now pressurized to 2m above the pipe crown. Water is reversing flow through household connections—basements are flooding from below.',
        characterDialogue: {
          speaker: 'operator',
          text: '"We\'ve lost three pump stations to power outages. The system is backing up from downstream. Every manhole lid is now a relief valve—we need to predict where the surface flooding will concentrate."'
        },
        choices: [
          {
            id: 'choice-sag',
            text: 'Low points (sag curves) in the road profile will pond first',
            consequence: 'Exactly! Surface water flows to topographic lows. Combine with manholes under pressure and you get dangerous ponding.',
            isCorrect: true,
          },
          {
            id: 'choice-random',
            text: 'Flooding will be random and unpredictable',
            consequence: 'Surface flow follows topography predictably. The 2D mesh elevation data tells us exactly where water will collect.',
            isCorrect: false,
          }
        ],
        revealConcept: 'Dual drainage: Surface flow (2D) + pipe flow (1D) exchange at manholes. When pipe HGL > surface, flow reverses upward.',
      },
      {
        id: 'uf5-surface-flow',
        phase: 'analysis',
        title: 'Streets as Channels',
        location: 'Downtown Grid',
        timeOfDay: 'storm',
        narrative: 'With the pipe system overwhelmed, the streets become open channels. Water flows down the roadway following the road crown and curb geometry. Intersections become nodes. The city has become a hydraulic network.',
        characterDialogue: {
          speaker: 'engineer',
          text: '"The road cross-section matters now. Curb heights, road camber, building thresholds—they all control flow paths. A 150mm curb is basically a weir. We need to model surface conveyance."'
        },
        targetSection: 'editor',
        interactionHint: 'Think of road cross-sections as channels—the roadway is the low-flow channel, sidewalks are floodplains',
        task: 'Estimate the conveyance of a 10m wide road with 150mm curbs and 2% cross-slope',
        revealConcept: 'Road as channel: n ≈ 0.016 (asphalt). Conveyance surprisingly high—streets can carry major flows when designed.',
      },
      {
        id: 'uf6-critical-depth',
        phase: 'analysis',
        title: 'The Underpass',
        location: 'Railway Underpass',
        timeOfDay: 'storm',
        narrative: 'Emergency services report vehicles trapped in the railway underpass—it filled in minutes. The pumps couldn\'t keep up with the inflow. Water cascaded down the ramps in supercritical flow, transitioning to ponded storage at the low point.',
        characterDialogue: {
          speaker: 'operator',
          text: '"Two meters of water in 15 minutes! The ramp slope is 8%—too steep for normal pump design. We need a different approach for the next one. What controls the flow into the underpass?"'
        },
        targetSection: 'froude-calculator',
        interactionHint: 'Analyze the ramp flow regime—steep slopes create supercritical sheet flow',
        choices: [
          {
            id: 'choice-critical',
            text: 'Critical depth at the top of the ramp controls inflow',
            consequence: 'Yes! The top edge acts as a broad-crested weir. Inflow is set by critical depth regardless of downstream conditions.',
            isCorrect: true,
          },
          {
            id: 'choice-pump',
            text: 'Pump capacity controls the water level',
            consequence: 'Only if pumps exceed inflow. When inflow > pump capacity, level rises until an overflow is found.',
            isCorrect: false,
          }
        ],
        revealConcept: 'Underpass hydraulics: Q_in controlled by weir at entry. Q_out = Q_pump. Storage = ∫(Q_in - Q_out)dt',
      },
      {
        id: 'uf7-aftermath',
        phase: 'resolution',
        title: 'The Reckoning',
        location: 'Emergency Response Debrief',
        timeOfDay: 'night',
        narrative: 'The storm lasted 45 minutes but felt like hours. As the system drains, the damage becomes clear: flooded basements, stranded vehicles, and two near-drownings. The city demands answers.',
        characterDialogue: {
          speaker: 'mayor',
          text: '"Our drainage system failed. Or did it? I need to understand—was this a design failure or an event beyond design? What should we do differently?"'
        },
        choices: [
          {
            id: 'choice-both',
            text: 'Both—the event exceeded design, but we can improve resilience',
            consequence: 'Wise answer. 100-year events will happen. Resilience means designing for exceedance: surface flow paths, flood-proofing, warnings.',
            isCorrect: true,
          },
          {
            id: 'choice-bigger',
            text: 'We need bigger pipes everywhere',
            consequence: 'Impractical and expensive. Surface storage, green infrastructure, and managed flow paths are often more effective.',
            isCorrect: false,
          }
        ],
        achievement: 'Urban Flood Fighter: Navigated the dual drainage challenge',
      },
      {
        id: 'uf8-future',
        phase: 'resolution',
        title: 'Building Back Better',
        location: 'Planning Session',
        timeOfDay: 'day',
        narrative: 'Weeks later, you present recommendations to the city council. Your analysis shows that strategic green infrastructure—bioswales, permeable paving, and detention basins—could reduce peak runoff by 30% and buy critical time for the pipe system.',
        characterDialogue: {
          speaker: 'narrator',
          text: 'Urban flood modeling is about managing exceedance, not eliminating it. You\'ve learned to see the city as a hydraulic system—roofs, roads, pipes, and open channels all connected. Every surface is a catchment. Every low point is a storage opportunity. Build with water, not against it.'
        },
        achievement: 'Drainage Network Master: Completed the Urban Flash Flood scenario',
      }
    ]
  }
];

export const getScenarioById = (id: string): StoryScenario | undefined => {
  return storyScenarios.find(s => s.id === id);
};

export const getChapterById = (scenarioId: string, chapterId: string): StoryChapter | undefined => {
  const scenario = getScenarioById(scenarioId);
  return scenario?.chapters.find(c => c.id === chapterId);
};
