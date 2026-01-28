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
    speaker: 'mentor' | 'mayor' | 'engineer' | 'narrator';
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
      },
      // Additional chapters for this scenario...
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
