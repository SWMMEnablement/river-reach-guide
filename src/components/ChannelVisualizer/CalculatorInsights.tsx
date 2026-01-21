import { AlertTriangle, CheckCircle, Info, Lightbulb, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type InsightLevel = 'info' | 'success' | 'warning' | 'tip';

export interface CalculatorInsight {
  level: InsightLevel;
  title: string;
  message: string;
  nextStep?: string;
}

interface CalculatorInsightsProps {
  insights: CalculatorInsight[];
  className?: string;
}

const levelConfig = {
  info: {
    icon: Info,
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    iconColor: 'text-primary',
    titleColor: 'text-primary',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    iconColor: 'text-green-600',
    titleColor: 'text-green-600',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-600',
  },
  tip: {
    icon: Lightbulb,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-600',
  },
};

export const CalculatorInsights = ({ insights, className = '' }: CalculatorInsightsProps) => {
  if (insights.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <Lightbulb className="w-3.5 h-3.5" />
        <span>Interpretation & Next Steps</span>
      </div>
      <AnimatePresence mode="sync">
        {insights.map((insight, index) => {
          const config = levelConfig[insight.level];
          const Icon = config.icon;

          return (
            <motion.div
              key={`${insight.title}-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border ${config.bg} ${config.border}`}
            >
              <div className="flex items-start gap-2.5">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${config.titleColor}`}>
                    {insight.title}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {insight.message}
                  </p>
                  {insight.nextStep && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-foreground font-medium">
                      <ArrowRight className="w-3 h-3" />
                      <span>{insight.nextStep}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Helper functions to generate insights for each calculator type

export const generateGVFInsights = (
  normalDepth: number,
  criticalDepth: number,
  isMild: boolean,
  selectedProfile: string,
  boundaryDepth: number
): CalculatorInsight[] => {
  const insights: CalculatorInsight[] = [];

  // Slope classification insight
  if (isMild) {
    insights.push({
      level: 'info',
      title: `MILD Slope Detected (yₙ = ${normalDepth.toFixed(2)}m > yc = ${criticalDepth.toFixed(2)}m)`,
      message: 'Normal depth exceeds critical depth. Flow tends toward subcritical (Fr < 1). M-type profiles apply.',
      nextStep: 'Use downstream boundary condition since subcritical flow is controlled from downstream.',
    });
  } else {
    insights.push({
      level: 'warning',
      title: `STEEP Slope Detected (yₙ = ${normalDepth.toFixed(2)}m < yc = ${criticalDepth.toFixed(2)}m)`,
      message: 'Critical depth exceeds normal depth. Flow tends toward supercritical (Fr > 1). S-type profiles apply.',
      nextStep: 'Use upstream boundary condition since supercritical flow is controlled from upstream.',
    });
  }

  // Profile-specific advice
  const profileAdvice: Record<string, CalculatorInsight> = {
    M1: {
      level: 'tip',
      title: 'M1 Backwater Profile',
      message: 'This profile forms upstream of dams, weirs, or raised downstream levels. Water surface is above normal depth throughout.',
      nextStep: 'Check that your downstream depth is higher than normal depth to validate M1 conditions.',
    },
    M2: {
      level: 'tip',
      title: 'M2 Drawdown Profile',
      message: 'This profile forms as flow approaches a free overfall or steeper reach. Water surface drops below normal depth.',
      nextStep: 'Verify there is a control structure or slope break at the downstream end.',
    },
    M3: {
      level: 'warning',
      title: 'M3 Supercritical Profile on Mild Slope',
      message: 'Rare profile that occurs after a sluice gate or hydraulic jump. Flow is below critical depth on a mild slope.',
      nextStep: 'A hydraulic jump will form downstream to transition back to subcritical flow.',
    },
    S1: {
      level: 'tip',
      title: 'S1 Backwater Profile',
      message: 'This profile forms upstream of a high tailwater or dam on a steep slope. Flow is subcritical above critical depth.',
      nextStep: 'A hydraulic jump may form at the transition from supercritical flow.',
    },
    S2: {
      level: 'tip',
      title: 'S2 Drawdown Profile',
      message: 'This profile forms between controls on steep slopes. Water surface is between critical and normal depths.',
      nextStep: 'Verify boundary conditions at both ends of the reach.',
    },
    S3: {
      level: 'info',
      title: 'S3 Accelerating Supercritical Profile',
      message: 'Flow accelerates from critical depth toward normal depth on a steep slope. Common after spillways.',
      nextStep: 'Flow will stabilize at normal depth if the reach is long enough.',
    },
  };

  if (profileAdvice[selectedProfile]) {
    insights.push(profileAdvice[selectedProfile]);
  }

  // Boundary condition check
  if (isMild && boundaryDepth < normalDepth) {
    insights.push({
      level: 'warning',
      title: 'Boundary Condition Check',
      message: `Your boundary depth (${boundaryDepth.toFixed(2)}m) is below normal depth. This suggests an M2 or M3 profile, not ${selectedProfile}.`,
      nextStep: 'Adjust the boundary depth or select a different profile type.',
    });
  }

  return insights;
};

export const generateFroudeInsights = (
  froudeUpstream: number,
  froudeDownstream: number,
  normalDepth: number,
  criticalDepth: number,
  jumpOccurs: boolean,
  sequentDepth: number,
  energyLoss: number
): CalculatorInsight[] => {
  const insights: CalculatorInsight[] = [];

  // Slope classification
  const isMild = normalDepth > criticalDepth;
  insights.push({
    level: 'info',
    title: `${isMild ? 'MILD' : 'STEEP'} Slope Classification`,
    message: `yₙ (${normalDepth.toFixed(2)}m) ${isMild ? '>' : '<'} yc (${criticalDepth.toFixed(2)}m). Normal flow is ${isMild ? 'subcritical' : 'supercritical'}.`,
  });

  // Regime transitions
  if (froudeUpstream > 1 && froudeDownstream < 1) {
    insights.push({
      level: 'warning',
      title: 'Flow Regime Transition Detected',
      message: `Flow changes from supercritical (Fr=${froudeUpstream.toFixed(2)}) to subcritical (Fr=${froudeDownstream.toFixed(2)}). This requires a hydraulic jump.`,
      nextStep: 'ICM will automatically model the jump location if boundary conditions are correct.',
    });
  } else if (froudeUpstream < 1 && froudeDownstream > 1) {
    insights.push({
      level: 'warning',
      title: 'Critical Transition Required',
      message: 'Flow changes from subcritical to supercritical. This can only occur at a critical section (weir, slope break, or constriction).',
      nextStep: 'Verify a control structure exists at the transition point.',
    });
  } else if (froudeUpstream > 1 && froudeDownstream > 1) {
    insights.push({
      level: 'info',
      title: 'Fully Supercritical Flow',
      message: 'Flow is supercritical throughout. Model is controlled by upstream boundary condition.',
    });
  } else {
    insights.push({
      level: 'success',
      title: 'Fully Subcritical Flow',
      message: 'Flow is subcritical throughout. Model is controlled by downstream boundary condition.',
    });
  }

  // Hydraulic jump details
  if (jumpOccurs) {
    insights.push({
      level: 'tip',
      title: 'Hydraulic Jump Analysis',
      message: `Sequent depth: ${sequentDepth.toFixed(2)}m. Energy dissipated: ${energyLoss.toFixed(3)}m per unit weight.`,
      nextStep: 'Consider stilling basin or apron design if this is at a structure.',
    });
  }

  return insights;
};

export const generateCulvertInsights = (
  controlType: 'inlet' | 'outlet' | 'unknown',
  inletControlHW: number,
  outletControlHW: number,
  capacityRatio: number,
  froudeNumber: number,
  isAdequate: boolean,
  availableHW: number
): CalculatorInsight[] => {
  const insights: CalculatorInsight[] = [];

  // Control type explanation
  if (controlType === 'inlet') {
    insights.push({
      level: 'info',
      title: 'INLET Control Governs',
      message: `Inlet control HW (${inletControlHW.toFixed(2)}m) > Outlet control HW (${outletControlHW.toFixed(2)}m). The culvert entrance capacity limits flow.`,
      nextStep: 'Consider improving entrance conditions (beveled edges, headwalls) to increase capacity.',
    });
  } else if (controlType === 'outlet') {
    insights.push({
      level: 'info',
      title: 'OUTLET Control Governs',
      message: `Outlet control HW (${outletControlHW.toFixed(2)}m) > Inlet control HW (${inletControlHW.toFixed(2)}m). Barrel friction and tailwater limit flow.`,
      nextStep: 'Consider smoother material (lower n), larger size, or reduced length.',
    });
  }

  // Capacity assessment
  if (isAdequate) {
    insights.push({
      level: 'success',
      title: 'Capacity Check Passed',
      message: `Available headwater (${availableHW.toFixed(2)}m) exceeds required (${Math.max(inletControlHW, outletControlHW).toFixed(2)}m). Ratio = ${capacityRatio.toFixed(2)}.`,
      nextStep: 'Design is adequate. Consider checking for scour protection at outlet.',
    });
  } else {
    insights.push({
      level: 'warning',
      title: 'Capacity Check Failed',
      message: `Available headwater (${availableHW.toFixed(2)}m) is insufficient. Need ${Math.max(inletControlHW, outletControlHW).toFixed(2)}m.`,
      nextStep: 'Increase culvert size, add barrels, or raise the embankment.',
    });
  }

  // Flow regime
  if (froudeNumber > 1) {
    insights.push({
      level: 'tip',
      title: 'Supercritical Barrel Flow',
      message: `Froude number (${froudeNumber.toFixed(2)}) > 1 indicates supercritical flow in the barrel.`,
      nextStep: 'Ensure outlet protection for high-velocity discharge.',
    });
  }

  return insights;
};

export const generateWeirInsights = (
  weirType: string,
  discharge: number,
  head: number,
  froudeApproach: number,
  Cd: number
): CalculatorInsight[] => {
  const insights: CalculatorInsight[] = [];

  // Approach velocity check
  if (froudeApproach > 0.5) {
    insights.push({
      level: 'warning',
      title: 'High Approach Velocity',
      message: `Approach Froude (${froudeApproach.toFixed(2)}) suggests velocity head may affect accuracy. Standard formulas assume low approach velocity.`,
      nextStep: 'Apply velocity head correction: H_effective = H + V²/2g',
    });
  } else {
    insights.push({
      level: 'success',
      title: 'Valid Approach Conditions',
      message: `Approach Froude (${froudeApproach.toFixed(2)}) is low enough for standard weir equations.`,
    });
  }

  // Coefficient advice
  insights.push({
    level: 'tip',
    title: 'Coefficient Selection',
    message: `Using Cd = ${Cd.toFixed(3)}. Verify this matches your installation conditions using the lookup table.`,
    nextStep: 'Field calibration can improve accuracy by ±5%.',
  });

  // Submergence check placeholder
  insights.push({
    level: 'info',
    title: 'Submergence Check',
    message: 'This calculator assumes free-flow conditions. Submerged weirs require correction factors.',
    nextStep: 'Verify tailwater is below the weir crest for free-flow.',
  });

  return insights;
};

export const generateOrificeInsights = (
  orificeType: string,
  discharge: number,
  velocity: number,
  Cd: number,
  head: number
): CalculatorInsight[] => {
  const insights: CalculatorInsight[] = [];

  // Velocity check
  if (velocity > 6) {
    insights.push({
      level: 'warning',
      title: 'High Exit Velocity',
      message: `Jet velocity (${velocity.toFixed(2)} m/s) is high. Consider erosion protection downstream.`,
      nextStep: 'Add riprap, stilling basin, or energy dissipater at outlet.',
    });
  }

  // Submergence consideration
  insights.push({
    level: 'tip',
    title: 'Free vs Submerged Discharge',
    message: 'This calculation assumes free discharge. Submerged orifices use the head difference between upstream and downstream.',
    nextStep: 'For submerged flow: H = upstream head - downstream head.',
  });

  // Vena contracta
  const Cc = Cd / 0.99;
  insights.push({
    level: 'info',
    title: 'Vena Contracta',
    message: `Contraction coefficient ≈ ${Cc.toFixed(2)}. The jet contracts to ${(Cc * 100).toFixed(0)}% of orifice area just downstream.`,
  });

  return insights;
};
