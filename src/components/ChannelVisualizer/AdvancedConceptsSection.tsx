import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Clock, Gauge, Scale, AlertTriangle, Waves } from 'lucide-react';

interface ConceptCardProps {
  title: string;
  icon: React.ReactNode;
  formula?: string;
  description: string;
  details: string[];
  color: 'water' | 'primary' | 'terrain' | 'warning';
  visualComponent?: React.ReactNode;
}

const ConceptCard = ({ title, icon, formula, description, details, color, visualComponent }: ConceptCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorClasses = {
    water: 'bg-water/10 border-water/30 hover:border-water/50',
    primary: 'bg-primary/10 border-primary/30 hover:border-primary/50',
    terrain: 'bg-terrain/10 border-terrain/30 hover:border-terrain/50',
    warning: 'bg-orange-50 border-orange-300/50 hover:border-orange-400/60 dark:bg-orange-950/20',
  };

  const iconColorClasses = {
    water: 'text-water',
    primary: 'text-primary',
    terrain: 'text-terrain',
    warning: 'text-orange-500',
  };

  return (
    <motion.div
      className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${colorClasses[color]}`}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.01 }}
      layout
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-white shadow-sm ${iconColorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            {formula && (
              <p className="text-sm font-mono text-muted-foreground mt-1">{formula}</p>
            )}
          </div>
        </div>
        <button className="p-1 rounded-full hover:bg-white/50 transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border/50">
              {visualComponent && (
                <div className="mb-4">
                  {visualComponent}
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-3">{description}</p>
              <ul className="space-y-2">
                {details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                      color === 'water' ? 'bg-water' : 
                      color === 'primary' ? 'bg-primary' : 
                      color === 'terrain' ? 'bg-terrain' : 'bg-orange-500'
                    }`} />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Preissmann Slot Visualization
const PreissmannSlotVisual = () => (
  <svg viewBox="0 0 200 100" className="w-full h-24 bg-secondary/30 rounded-lg">
    {/* Pipe cross-section */}
    <ellipse cx="60" cy="50" rx="35" ry="30" fill="none" stroke="hsl(220, 10%, 50%)" strokeWidth="4" />
    <ellipse cx="60" cy="50" rx="35" ry="30" fill="hsl(195, 90%, 55%)" fillOpacity="0.5" />
    
    {/* Arrow to Preissmann representation */}
    <line x1="105" y1="50" x2="130" y2="50" stroke="hsl(210, 15%, 60%)" strokeWidth="2" markerEnd="url(#slotArrow)" />
    
    {/* Preissmann slot representation */}
    <path
      d="M 145,80 L 145,25 Q 160,20 175,25 L 175,80 Z"
      fill="hsl(195, 90%, 55%)"
      fillOpacity="0.5"
      stroke="hsl(220, 10%, 50%)"
      strokeWidth="2"
    />
    {/* Narrow slot at top */}
    <rect x="156" y="10" width="8" height="20" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="1" />
    
    <text x="60" y="95" textAnchor="middle" className="text-[9px]" fill="hsl(210, 15%, 50%)">Actual</text>
    <text x="160" y="95" textAnchor="middle" className="text-[9px]" fill="hsl(210, 15%, 50%)">Preissmann</text>
    
    <defs>
      <marker id="slotArrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
        <polygon points="0 0, 6 2, 0 4" fill="hsl(210, 15%, 60%)" />
      </marker>
    </defs>
  </svg>
);

// Courant Number Visualization
const CourantNumberVisual = () => {
  const [c, setC] = useState(0.8);
  const isStable = c <= 1;
  
  return (
    <div className="bg-secondary/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Courant Number (Cr)</span>
        <span className={`text-sm font-mono ${isStable ? 'text-green-600' : 'text-red-500'}`}>
          {c.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={0.1}
        max={2}
        step={0.1}
        value={c}
        onChange={(e) => setC(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded bg-muted accent-primary"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="flex justify-between mt-2">
        <span className={`text-[10px] px-2 py-0.5 rounded ${isStable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {isStable ? '✓ Stable' : '⚠️ Unstable'}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {isStable ? 'Wave travels < 1 cell/step' : 'Wave travels > 1 cell/step'}
        </span>
      </div>
    </div>
  );
};

// Energy Equation Visual
const EnergyEquationVisual = () => (
  <svg viewBox="0 0 280 90" className="w-full h-20 bg-secondary/30 rounded-lg">
    {/* Channel bed */}
    <line x1="20" y1="70" x2="260" y2="60" stroke="hsl(35, 35%, 40%)" strokeWidth="3" />
    
    {/* Water surface */}
    <line x1="20" y1="50" x2="260" y2="42" stroke="hsl(195, 90%, 50%)" strokeWidth="2" />
    
    {/* Energy grade line */}
    <line x1="20" y1="35" x2="260" y2="30" stroke="hsl(30, 90%, 50%)" strokeWidth="2" strokeDasharray="6 3" />
    
    {/* Labels */}
    <text x="40" y="32" className="text-[8px]" fill="hsl(30, 90%, 45%)">EGL (Energy Grade Line)</text>
    <text x="40" y="48" className="text-[8px]" fill="hsl(195, 90%, 45%)">HGL (Water Surface)</text>
    <text x="200" y="75" className="text-[8px]" fill="hsl(35, 35%, 35%)">Bed</text>
    
    {/* Velocity head indicator */}
    <line x1="140" y1="42" x2="140" y2="32" stroke="hsl(280, 65%, 55%)" strokeWidth="1.5" />
    <text x="148" y="38" className="text-[7px]" fill="hsl(280, 65%, 50%)">V²/2g</text>
    
    {/* Datum */}
    <line x1="20" y1="85" x2="260" y2="85" stroke="hsl(210, 15%, 70%)" strokeWidth="1" strokeDasharray="3 3" />
    <text x="265" y="87" className="text-[7px]" fill="hsl(210, 15%, 60%)">Datum</text>
  </svg>
);

export const AdvancedConceptsSection = () => {
  const concepts: ConceptCardProps[] = [
    {
      title: 'Preissmann Slot',
      icon: <Gauge className="w-5 h-5" />,
      formula: 'Slot width: b_s = A / (c²/g)',
      description: 'A numerical technique that allows Saint-Venant equations to handle pressurized flow in closed conduits by adding a narrow imaginary slot to the pipe crown.',
      details: [
        'Maintains free-surface equations under pressure',
        'Slot width calculated to preserve correct wave celerity',
        'Enables smooth transition between free-surface and pressurized flow',
        'Critical for culvert and sewer modeling in ICM',
      ],
      color: 'primary',
      visualComponent: <PreissmannSlotVisual />,
    },
    {
      title: 'Courant Number (Stability)',
      icon: <Clock className="w-5 h-5" />,
      formula: 'Cr = (V + c) × Δt / Δx ≤ 1',
      description: 'The Courant-Friedrichs-Lewy (CFL) condition ensures numerical stability. The Courant number must be ≤1 for explicit schemes.',
      details: [
        'V = flow velocity, c = wave celerity',
        'Δt = time step, Δx = spatial step',
        'Cr > 1 causes oscillations and instability',
        'ICM auto-adjusts time step to maintain stability',
      ],
      color: 'warning',
      visualComponent: <CourantNumberVisual />,
    },
    {
      title: 'Energy Equation',
      icon: <Scale className="w-5 h-5" />,
      formula: 'z + y + V²/2g = constant + hL',
      description: 'Conservation of energy for gradually varied flow. Total head = elevation + pressure head + velocity head, minus losses.',
      details: [
        'z = bed elevation above datum',
        'y = water depth (pressure head)',
        'V²/2g = velocity head (kinetic energy)',
        'hL = head losses (friction + local)',
      ],
      color: 'water',
      visualComponent: <EnergyEquationVisual />,
    },
    {
      title: 'Gradually Varied Flow',
      icon: <Waves className="w-5 h-5" />,
      formula: 'dy/dx = (S₀ - Sf) / (1 - Fr²)',
      description: 'Describes how water depth changes along a channel. Used for backwater calculations and M1/M2/S1/S2 profile classification.',
      details: [
        'S₀ = bed slope, Sf = friction slope',
        'Fr = Froude number',
        'Predicts drawdown curves and backwater profiles',
        'Critical for flood level predictions upstream of structures',
      ],
      color: 'terrain',
    },
    {
      title: 'Numerical Oscillations',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'Spurious oscillations in model results often indicate numerical instability rather than physical phenomena.',
      details: [
        'Check Courant number (reduce time step)',
        'Review cross-section spacing (Δx too large)',
        'Examine sudden geometry changes',
        'Consider using implicit solver for stiff problems',
      ],
      color: 'warning',
    },
    {
      title: 'Froude Transition',
      icon: <Zap className="w-5 h-5" />,
      formula: 'Fr = V / √(gy)',
      description: 'Transition between subcritical (Fr<1) and supercritical (Fr>1) flow requires special handling (hydraulic jumps).',
      details: [
        'Fr < 1: Subcritical (tranquil) flow',
        'Fr = 1: Critical flow condition',
        'Fr > 1: Supercritical (rapid) flow',
        'ICM automatically handles regime transitions',
      ],
      color: 'primary',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Hydraulic Concepts</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Essential concepts for understanding numerical river modeling, stability criteria, 
          and how ICM handles complex hydraulic phenomena.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {concepts.map((concept, i) => (
          <ConceptCard key={i} {...concept} />
        ))}
      </div>
    </div>
  );
};
