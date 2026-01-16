import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, Droplets, Activity, Mountain, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

interface TroubleshootingItemProps {
  title: string;
  icon: React.ReactNode;
  symptom: string;
  causes: string[];
  solutions: string[];
  visualComponent?: React.ReactNode;
}

const TroubleshootingItem = ({ title, icon, symptom, causes, solutions, visualComponent }: TroubleshootingItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="bg-card border border-border rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{symptom}</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {/* Visual Example */}
              {visualComponent && (
                <div className="bg-muted/30 rounded-lg p-4">
                  {visualComponent}
                </div>
              )}

              {/* Causes */}
              <div>
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  Common Causes
                </h4>
                <ul className="space-y-1">
                  {causes.map((cause, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solutions */}
              <div>
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Solutions
                </h4>
                <ul className="space-y-1">
                  {solutions.map((solution, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Visual: River Drying Out
const DryingOutVisual = () => {
  const [showCorrect, setShowCorrect] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setShowCorrect(false)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${!showCorrect ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          ❌ Problem
        </button>
        <button
          onClick={() => setShowCorrect(true)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${showCorrect ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}
        >
          ✓ Solution
        </button>
      </div>

      <svg viewBox="0 0 400 150" className="w-full h-32">
        <defs>
          <linearGradient id="waterGradDry" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Channel bed */}
        <path
          d={showCorrect 
            ? "M 20 120 L 100 115 L 200 110 L 300 105 L 380 100"
            : "M 20 80 L 100 90 L 200 105 L 300 125 L 380 140"
          }
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="3"
          fill="none"
        />
        
        {/* Water surface */}
        <motion.path
          d={showCorrect
            ? "M 20 100 L 100 97 L 200 94 L 300 91 L 380 88"
            : "M 20 70 L 100 75 L 200 85 L 300 100 L 380 100"
          }
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Water fill area */}
        <motion.path
          d={showCorrect
            ? "M 20 100 L 100 97 L 200 94 L 300 91 L 380 88 L 380 100 L 300 105 L 200 110 L 100 115 L 20 120 Z"
            : "M 20 70 L 100 75 L 200 85 L 300 100 L 380 100 L 380 140 L 300 125 L 200 105 L 100 90 L 20 80 Z"
          }
          fill="url(#waterGradDry)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Labels */}
        <text x="30" y="40" className="text-xs fill-muted-foreground">Upstream</text>
        <text x="340" y="40" className="text-xs fill-muted-foreground">Downstream</text>
        
        {/* Slope arrows */}
        <g>
          <text x="200" y="25" textAnchor="middle" className="text-xs fill-foreground font-medium">
            {showCorrect ? "Bed slope ≈ Water slope" : "Bed slope > Water slope"}
          </text>
        </g>

        {/* Warning indicator for problem */}
        {!showCorrect && (
          <g>
            <circle cx="330" cy="115" r="12" fill="hsl(var(--destructive))" opacity="0.2" />
            <text x="330" y="120" textAnchor="middle" className="text-sm fill-destructive">⚠</text>
            <text x="330" y="145" textAnchor="middle" className="text-[10px] fill-destructive">Dries out!</text>
          </g>
        )}
      </svg>

      <p className="text-xs text-muted-foreground text-center">
        {showCorrect 
          ? "Correct: Gradual bed slope maintains water depth throughout"
          : "Problem: Steep adverse slope causes water to drain downstream"}
      </p>
    </div>
  );
};

// Visual: Oscillations
const OscillationsVisual = () => {
  const [courantNumber, setCourantNumber] = useState(1.5);
  const isUnstable = courantNumber > 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <label className="text-xs text-muted-foreground">Courant Number:</label>
        <input
          type="range"
          min="0.3"
          max="2.5"
          step="0.1"
          value={courantNumber}
          onChange={(e) => setCourantNumber(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className={`text-sm font-mono font-bold ${isUnstable ? 'text-destructive' : 'text-green-500'}`}>
          {courantNumber.toFixed(1)}
        </span>
      </div>

      <svg viewBox="0 0 400 100" className="w-full h-24">
        {/* Time series plot */}
        <line x1="40" y1="80" x2="380" y2="80" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="40" y1="20" x2="40" y2="80" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        {/* Y-axis label */}
        <text x="15" y="50" className="text-[10px] fill-muted-foreground" transform="rotate(-90 15 50)">Depth</text>
        <text x="210" y="95" className="text-[10px] fill-muted-foreground">Time →</text>

        {/* Water level line */}
        <motion.path
          d={isUnstable
            ? `M 40 50 ${Array.from({ length: 17 }, (_, i) => {
                const x = 40 + i * 20;
                const amplitude = Math.min(30, 5 * Math.pow(1.3, i));
                const y = 50 + (i % 2 === 0 ? -amplitude : amplitude);
                return `L ${x} ${Math.max(20, Math.min(80, y))}`;
              }).join(' ')}`
            : `M 40 60 ${Array.from({ length: 17 }, (_, i) => {
                const x = 40 + i * 20;
                const y = 50 + Math.sin(i * 0.5) * 5 * Math.exp(-i * 0.1);
                return `L ${x} ${y}`;
              }).join(' ')}`
          }
          stroke={isUnstable ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
          key={courantNumber}
        />

        {/* Status indicator */}
        <rect
          x="300"
          y="5"
          width="90"
          height="20"
          rx="4"
          fill={isUnstable ? "hsl(var(--destructive))" : "hsl(142.1 76.2% 36.3%)"}
          opacity="0.2"
        />
        <text
          x="345"
          y="18"
          textAnchor="middle"
          className="text-[10px] font-medium"
          fill={isUnstable ? "hsl(var(--destructive))" : "hsl(142.1 76.2% 36.3%)"}
        >
          {isUnstable ? "⚠ UNSTABLE" : "✓ STABLE"}
        </text>
      </svg>

      <div className="text-xs text-center">
        <span className={isUnstable ? 'text-destructive' : 'text-green-500'}>
          Cr = V·Δt/Δx {isUnstable ? '> 1 (unstable!)' : '≤ 1 (stable)'}
        </span>
      </div>
    </div>
  );
};

// Visual: Floodplain Not Activating
const FloodplainVisual = () => {
  const [bankMarkerCorrect, setBankMarkerCorrect] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setBankMarkerCorrect(false)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${!bankMarkerCorrect ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          ❌ Wrong Markers
        </button>
        <button
          onClick={() => setBankMarkerCorrect(true)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${bankMarkerCorrect ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}
        >
          ✓ Correct Markers
        </button>
      </div>

      <svg viewBox="0 0 400 140" className="w-full h-32">
        <defs>
          <linearGradient id="floodWater" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          </linearGradient>
          <pattern id="floodplainPattern" patternUnits="userSpaceOnUse" width="10" height="10">
            <circle cx="5" cy="5" r="1" fill="hsl(var(--muted-foreground))" opacity="0.3" />
          </pattern>
        </defs>

        {/* Left floodplain */}
        <rect x="20" y="40" width="80" height="60" fill="url(#floodplainPattern)" />
        <text x="60" y="75" textAnchor="middle" className="text-[9px] fill-muted-foreground">Floodplain</text>

        {/* Right floodplain */}
        <rect x="300" y="40" width="80" height="60" fill="url(#floodplainPattern)" />
        <text x="340" y="75" textAnchor="middle" className="text-[9px] fill-muted-foreground">Floodplain</text>

        {/* Channel banks */}
        <path d="M 100 40 L 100 100 L 120 120 L 280 120 L 300 100 L 300 40" 
              stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" />

        {/* Water in channel */}
        <path d="M 110 110 L 120 120 L 280 120 L 290 110 Z" fill="url(#floodWater)" />

        {/* High water level line */}
        <motion.line
          x1="20"
          y1="50"
          x2="380"
          y2="50"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeDasharray="5,5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <text x="385" y="54" className="text-[9px] fill-primary">HWL</text>

        {/* Bank markers */}
        {bankMarkerCorrect ? (
          <>
            {/* Correct: at top of banks */}
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <circle cx="100" cy="40" r="6" fill="hsl(142.1 76.2% 36.3%)" />
              <text x="100" y="30" textAnchor="middle" className="text-[8px] fill-green-500">LB</text>
            </motion.g>
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <circle cx="300" cy="40" r="6" fill="hsl(142.1 76.2% 36.3%)" />
              <text x="300" y="30" textAnchor="middle" className="text-[8px] fill-green-500">RB</text>
            </motion.g>
            {/* Show water on floodplain */}
            <motion.rect
              x="20" y="50" width="80" height="50"
              fill="url(#floodWater)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            />
            <motion.rect
              x="300" y="50" width="80" height="50"
              fill="url(#floodWater)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            />
          </>
        ) : (
          <>
            {/* Wrong: at water edge */}
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <circle cx="115" cy="110" r="6" fill="hsl(var(--destructive))" />
              <text x="115" y="100" textAnchor="middle" className="text-[8px] fill-destructive">LB</text>
            </motion.g>
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <circle cx="285" cy="110" r="6" fill="hsl(var(--destructive))" />
              <text x="285" y="100" textAnchor="middle" className="text-[8px] fill-destructive">RB</text>
            </motion.g>
            {/* Warning */}
            <text x="200" y="20" textAnchor="middle" className="text-[10px] fill-destructive font-medium">
              ⚠ Floodplain won't activate!
            </text>
          </>
        )}
      </svg>

      <p className="text-xs text-muted-foreground text-center">
        {bankMarkerCorrect
          ? "Correct: Bank markers at top of banks allow floodplain flow"
          : "Problem: Bank markers at water edge prevent floodplain activation"}
      </p>
    </div>
  );
};

// Visual: Negative Depths
const NegativeDepthVisual = () => {
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 120" className="w-full h-28">
        <defs>
          <linearGradient id="bedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(30 41% 45%)" />
            <stop offset="100%" stopColor="hsl(30 41% 35%)" />
          </linearGradient>
        </defs>

        {/* Cross-section shape */}
        <path d="M 50 30 L 50 80 L 100 100 L 300 100 L 350 80 L 350 30" 
              stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="url(#bedGrad)" fillOpacity="0.3" />

        {/* Initial water level - too low */}
        <line x1="40" y1="110" x2="360" y2="110" stroke="hsl(var(--destructive))" strokeWidth="2" strokeDasharray="5,5" />
        <text x="370" y="114" className="text-[9px] fill-destructive">Initial WL</text>

        {/* Bed level */}
        <line x1="100" y1="100" x2="300" y2="100" stroke="hsl(30 41% 45%)" strokeWidth="3" />
        
        {/* Error zone */}
        <rect x="100" y="100" width="200" height="10" fill="hsl(var(--destructive))" opacity="0.3" />
        <text x="200" y="108" textAnchor="middle" className="text-[8px] fill-destructive font-bold">NEGATIVE DEPTH!</text>

        {/* Arrows showing the problem */}
        <path d="M 200 85 L 200 95" stroke="hsl(var(--destructive))" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="200" y="80" textAnchor="middle" className="text-[9px] fill-muted-foreground">Bed = 100m</text>
        <text x="200" y="125" textAnchor="middle" className="text-[9px] fill-destructive">WL = 99m</text>

        {/* Suggestion */}
        <rect x="50" y="10" width="300" height="18" rx="4" fill="hsl(var(--muted))" />
        <text x="200" y="22" textAnchor="middle" className="text-[9px] fill-foreground">
          Fix: Set initial water level above invert (bed level)
        </text>
      </svg>
    </div>
  );
};

export const TroubleshootingSection = () => {
  const troubleshootingItems: TroubleshootingItemProps[] = [
    {
      title: "Why is my river drying out?",
      icon: <Droplets className="w-5 h-5" />,
      symptom: "Water depth drops to zero or negative values downstream",
      causes: [
        "Bed slope is too steep relative to the flow rate",
        "Incorrect downstream boundary condition (e.g., normal depth too low)",
        "Sudden changes in cross-section geometry causing supercritical flow",
        "Manning's n too low causing excessive velocity and shallow depths"
      ],
      solutions: [
        "Check bed levels for sudden drops or data entry errors",
        "Use a stage-discharge boundary or fixed water level downstream",
        "Ensure smooth transitions between cross-sections",
        "Verify Manning's n values are appropriate for the channel type"
      ],
      visualComponent: <DryingOutVisual />
    },
    {
      title: "Why do I get oscillations?",
      icon: <Activity className="w-5 h-5" />,
      symptom: "Water levels fluctuate wildly, model becomes unstable",
      causes: [
        "Courant number exceeds 1.0 (Cr = V·Δt/Δx)",
        "Time step is too large for the spatial resolution",
        "Abrupt changes in geometry or roughness",
        "Inconsistent boundary conditions"
      ],
      solutions: [
        "Reduce the time step to satisfy Courant condition (Cr ≤ 1)",
        "Enable adaptive time stepping if available",
        "Smooth out abrupt geometry transitions",
        "Use the Preissmann slot for near-dry conditions"
      ],
      visualComponent: <OscillationsVisual />
    },
    {
      title: "Why doesn't my floodplain activate?",
      icon: <Mountain className="w-5 h-5" />,
      symptom: "Water stays in main channel even at high flows",
      causes: [
        "Bank markers placed at water's edge instead of top of bank",
        "Floodplain areas marked as 'inactive' in the model",
        "Conveyance calculation not including overbank areas",
        "Left/Right bank markers swapped or missing"
      ],
      solutions: [
        "Place bank markers (LB/RB) at the top of the channel banks",
        "Review and remove any 'inactive' designations on floodplain areas",
        "Check that extended cross-sections include floodplain geometry",
        "Verify bank markers are correctly labeled (left bank on left when looking downstream)"
      ],
      visualComponent: <FloodplainVisual />
    },
    {
      title: "Why do I get negative depths?",
      icon: <AlertTriangle className="w-5 h-5" />,
      symptom: "Model reports negative water depths or crashes at startup",
      causes: [
        "Initial water level set below the channel invert (bed level)",
        "Cross-section data has inverted coordinates",
        "Boundary condition specifies impossible water levels",
        "Datum mismatch between cross-sections"
      ],
      solutions: [
        "Set initial water levels above the lowest bed point at each section",
        "Use 'hot start' from a steady-state simulation",
        "Verify all cross-section elevations use the same datum",
        "Check that inflow boundary doesn't cause drawdown below bed"
      ],
      visualComponent: <NegativeDepthVisual />
    },
    {
      title: "Why is my model running slowly?",
      icon: <HelpCircle className="w-5 h-5" />,
      symptom: "Simulation takes excessively long or seems stuck",
      causes: [
        "Time step too small (over-refined temporal resolution)",
        "Extremely small Preissmann slot width causing numerical stiffness",
        "Too many cross-sections with minimal spacing",
        "1D/2D coupling with overly fine 2D mesh"
      ],
      solutions: [
        "Increase time step while maintaining Courant stability",
        "Use adaptive time stepping to optimize performance",
        "Review cross-section spacing (typically 50-200m for rivers)",
        "Coarsen 2D mesh in less critical areas"
      ]
    }
  ];

  return (
    <div className="pt-8 space-y-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full mb-4">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">Troubleshooting Guide</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Common Modeling Mistakes</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Interactive visual guide to diagnosing and fixing common issues in river hydraulic models
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {troubleshootingItems.map((item, index) => (
          <TroubleshootingItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};
