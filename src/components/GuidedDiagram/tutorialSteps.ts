// Tutorial steps for the guided River Reach Diagram
export interface TutorialStep {
  id: number;
  elementId: string;
  title: string;
  instruction: string;
  explanation: string;
  validationQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    feedback: {
      correct: string;
      incorrect: string;
    };
  };
  tip?: string;
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    elementId: 'upstream-node',
    title: 'Step 1: Start at the Upstream Node',
    instruction: 'Click on the Upstream Node (US) in the diagram to begin.',
    explanation: 'Every river model starts with an upstream boundary. This is where water enters your model domain. You\'ll define inflow conditions here - typically a flow hydrograph (Q vs time) for flood simulations.',
    validationQuestion: {
      question: 'What boundary condition would you typically apply at an upstream node?',
      options: [
        'Water level (stage) hydrograph',
        'Flow (discharge) hydrograph',
        'Normal depth',
        'Critical depth',
      ],
      correctIndex: 1,
      feedback: {
        correct: 'Correct! Upstream boundaries typically use flow hydrographs because we usually know the incoming discharge from gauges or hydrological models.',
        incorrect: 'Not quite. Upstream nodes typically use flow (Q) hydrographs. Stage boundaries are more common downstream where we know water levels.',
      },
    },
    tip: 'In ICM, you can also connect the upstream node to a catchment that generates runoff.',
  },
  {
    id: 2,
    elementId: 'river-reach',
    title: 'Step 2: Understand the River Reach',
    instruction: 'Click on the River Reach (the blue channel) to learn about it.',
    explanation: 'The river reach is the hydraulic link connecting your nodes. It contains the channel geometry via cross-sections and uses the Saint-Venant equations to route flow. This is where all the hydraulic calculations happen.',
    validationQuestion: {
      question: 'Which equations does ICM use for 1D river flow routing?',
      options: [
        'Navier-Stokes equations',
        'Darcy-Weisbach equations',
        'Saint-Venant equations',
        'Bernoulli equation only',
      ],
      correctIndex: 2,
      feedback: {
        correct: 'Correct! The Saint-Venant equations (continuity + momentum) govern unsteady open-channel flow in 1D models.',
        incorrect: 'Not quite. ICM uses the Saint-Venant equations (also called shallow water equations) for 1D river routing.',
      },
    },
  },
  {
    id: 3,
    elementId: 'cross-section',
    title: 'Step 3: Define Cross-Sections',
    instruction: 'Click on any of the cross-section markers (XS1, XS2, or XS3).',
    explanation: 'Cross-sections define the channel geometry at specific locations. They include survey data (chainage vs elevation), bank markers to separate channel from floodplain, and roughness zones with Manning\'s n values.',
    validationQuestion: {
      question: 'Where should bank markers be placed on a cross-section?',
      options: [
        'At the water\'s edge at typical flow',
        'At the deepest point of the channel',
        'At the top of the channel banks',
        'At the center of the channel',
      ],
      correctIndex: 2,
      feedback: {
        correct: 'Correct! Bank markers should be at the TOP of the banks to properly define where overbank flow begins.',
        incorrect: 'Not quite. Bank markers must be at the TOP of the banks, not the water\'s edge. This defines where floodplain conveyance starts.',
      },
    },
    tip: 'Cross-sections are interpolated between survey points. More sections = better accuracy, but slower computation.',
  },
  {
    id: 4,
    elementId: 'floodplain',
    title: 'Step 4: Include Floodplain Areas',
    instruction: 'Click on the floodplain area (brown terrain on either bank).',
    explanation: 'Floodplains provide additional storage and conveyance during high flows. They have different roughness values (typically higher n) than the main channel. For detailed analysis, consider coupling to a 2D mesh.',
    validationQuestion: {
      question: 'Why do floodplains typically have higher Manning\'s n values than the main channel?',
      options: [
        'Floodplains are always steeper',
        'Vegetation and obstacles increase resistance',
        'Water moves faster over floodplains',
        'Floodplains are always deeper',
      ],
      correctIndex: 1,
      feedback: {
        correct: 'Correct! Floodplains have trees, shrubs, buildings, and other obstacles that create more resistance to flow.',
        incorrect: 'Not quite. Floodplains have higher roughness due to vegetation, structures, and other obstructions that resist flow.',
      },
    },
  },
  {
    id: 5,
    elementId: 'water-surface',
    title: 'Step 5: Analyze the Water Surface',
    instruction: 'Click on the dashed water surface line.',
    explanation: 'The water surface profile is a key model output. It shows how water levels vary along the reach during simulation. The profile shape depends on flow regime (subcritical vs supercritical), downstream controls, and channel geometry.',
    validationQuestion: {
      question: 'In subcritical flow (Fr < 1), which boundary controls the water surface profile?',
      options: [
        'Upstream boundary only',
        'Downstream boundary only',
        'Both boundaries equally',
        'Neither - it\'s controlled by local geometry',
      ],
      correctIndex: 1,
      feedback: {
        correct: 'Correct! Subcritical flow is controlled from downstream. Backwater effects propagate upstream.',
        incorrect: 'For subcritical flow (Fr < 1), the downstream boundary controls the profile. This is why M1 backwater curves form behind dams and bridges.',
      },
    },
  },
  {
    id: 6,
    elementId: 'downstream-node',
    title: 'Step 6: Set the Downstream Boundary',
    instruction: 'Click on the Downstream Node (DS) to complete the model.',
    explanation: 'The downstream boundary defines what happens as water exits your model. Common options include: normal depth (for long rivers), a rating curve (stage-discharge relationship), or a fixed water level (for tidal or lake boundaries).',
    validationQuestion: {
      question: 'Which downstream boundary would you use for a river entering the sea?',
      options: [
        'Normal depth',
        'Critical depth',
        'Time-varying tidal levels',
        'Free outfall',
      ],
      correctIndex: 2,
      feedback: {
        correct: 'Correct! Tidal boundaries use time-varying water levels to represent the rise and fall of tides affecting the river.',
        incorrect: 'For coastal rivers, you need time-varying tidal levels as the boundary condition to capture how tides affect river water levels.',
      },
    },
    tip: 'Congratulations! You\'ve built a complete 1D river model structure. Next steps: run a simulation and analyze results!',
  },
];

export const getTutorialStep = (stepNumber: number): TutorialStep | undefined => {
  return tutorialSteps.find(s => s.id === stepNumber);
};

export const getStepByElement = (elementId: string): TutorialStep | undefined => {
  return tutorialSteps.find(s => s.elementId === elementId);
};
