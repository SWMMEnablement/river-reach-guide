import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  isAnimating: boolean;
}

type FlowRegime = 'type-i' | 'type-ii' | 'type-iii' | 'pressurized';

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 350;

export const BridgeCulvertView = ({ isAnimating }: Props) => {
  const [structureType, setStructureType] = useState<'bridge' | 'arch-culvert' | 'box-culvert'>('arch-culvert');
  const [flowRegime, setFlowRegime] = useState<FlowRegime>('type-i');
  const [upstreamLevel, setUpstreamLevel] = useState(3.2);
  const [downstreamLevel, setDownstreamLevel] = useState(2.0);

  // Structure dimensions
  const structureWidth = 120;
  const structureHeight = 80;
  const baseY = CANVAS_HEIGHT - 60;
  const centerX = CANVAS_WIDTH / 2;

  // Water animation
  const [animOffset, setAnimOffset] = useState(0);
  useState(() => {
    if (isAnimating) {
      const interval = setInterval(() => setAnimOffset(prev => (prev + 3) % 100), 50);
      return () => clearInterval(interval);
    }
  });

  // Flow regime descriptions
  const regimeDescriptions: Record<FlowRegime, { title: string; description: string; conditions: string[] }> = {
    'type-i': {
      title: 'Type I - Free Surface (Low Flow)',
      description: 'Free surface flow throughout. Water surface does not contact soffit.',
      conditions: ['Low water depth', 'Subcritical flow', 'Inlet control not active'],
    },
    'type-ii': {
      title: 'Type II - Submerged Inlet',
      description: 'Inlet submerged, outlet flowing free. Orifice flow conditions.',
      conditions: ['Inlet control', 'Headwater > 1.2 × culvert height', 'Tailwater below crown'],
    },
    'type-iii': {
      title: 'Type III - Submerged Outlet',
      description: 'High tailwater causes backwater effect. Outlet control conditions.',
      conditions: ['Outlet control', 'Tailwater above crown', 'Full flow possible'],
    },
    'pressurized': {
      title: 'Pressurized Flow',
      description: 'Fully surcharged with pressure head driving flow. Uses Preissmann slot.',
      conditions: ['Full surcharge', 'Pressure head active', 'Max capacity reached'],
    },
  };

  const currentRegime = regimeDescriptions[flowRegime];

  // Build structure shape
  const buildStructurePath = () => {
    const left = centerX - structureWidth / 2;
    const right = centerX + structureWidth / 2;
    const top = baseY - structureHeight;

    if (structureType === 'arch-culvert') {
      const archRadius = structureWidth / 2;
      return `M ${left},${baseY} L ${left},${top + archRadius} 
              A ${archRadius} ${archRadius * 0.6} 0 0 1 ${right},${top + archRadius}
              L ${right},${baseY}`;
    } else if (structureType === 'box-culvert') {
      return `M ${left},${baseY} L ${left},${top} L ${right},${top} L ${right},${baseY}`;
    } else {
      // Bridge with deck
      const deckHeight = 15;
      const pierWidth = 20;
      return `M ${left - 40},${top} L ${left - 40},${top + deckHeight} 
              L ${left},${top + deckHeight} L ${left},${baseY}
              M ${centerX - pierWidth/2},${baseY} L ${centerX - pierWidth/2},${top + deckHeight} 
              L ${centerX + pierWidth/2},${top + deckHeight} L ${centerX + pierWidth/2},${baseY}
              M ${right},${baseY} L ${right},${top + deckHeight} 
              L ${right + 40},${top + deckHeight} L ${right + 40},${top}`;
    }
  };

  // Build water shape based on regime
  const buildWaterPath = () => {
    const left = centerX - structureWidth / 2;
    const right = centerX + structureWidth / 2;
    const upstreamY = baseY - upstreamLevel * 20;
    const downstreamY = baseY - downstreamLevel * 20;
    const structureTop = baseY - structureHeight;

    if (flowRegime === 'pressurized') {
      // Full flow through structure
      return `M 50,${upstreamY} L ${left},${upstreamY} L ${left},${structureTop + 5} 
              L ${right},${structureTop + 5} L ${right},${downstreamY} L ${CANVAS_WIDTH - 50},${downstreamY}
              L ${CANVAS_WIDTH - 50},${baseY} L 50,${baseY} Z`;
    } else if (flowRegime === 'type-iii') {
      // Submerged outlet
      return `M 50,${upstreamY} L ${left},${upstreamY} 
              L ${left},${Math.min(structureTop + 15, downstreamY - 10)} 
              L ${right},${Math.min(structureTop + 20, downstreamY - 5)} 
              L ${right},${downstreamY} L ${CANVAS_WIDTH - 50},${downstreamY}
              L ${CANVAS_WIDTH - 50},${baseY} L 50,${baseY} Z`;
    } else if (flowRegime === 'type-ii') {
      // Submerged inlet
      return `M 50,${upstreamY} L ${left},${upstreamY}
              L ${left + 10},${structureTop + 20} L ${right - 10},${structureTop + 30}
              L ${right},${downstreamY + 10} L ${CANVAS_WIDTH - 50},${downstreamY + 10}
              L ${CANVAS_WIDTH - 50},${baseY} L 50,${baseY} Z`;
    } else {
      // Type I - free surface
      const midWaterY = baseY - ((upstreamLevel + downstreamLevel) / 2) * 18;
      return `M 50,${upstreamY} L ${left - 10},${upstreamY} 
              L ${left + 20},${midWaterY} L ${right - 20},${midWaterY + 5}
              L ${right + 10},${downstreamY + 15} L ${CANVAS_WIDTH - 50},${downstreamY + 15}
              L ${CANVAS_WIDTH - 50},${baseY} L 50,${baseY} Z`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-secondary/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Structure:</span>
          <div className="flex gap-1">
            {(['arch-culvert', 'box-culvert', 'bridge'] as const).map(type => (
              <button
                key={type}
                onClick={() => setStructureType(type)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  structureType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border hover:bg-muted'
                }`}
              >
                {type === 'arch-culvert' ? 'Arch Culvert' : type === 'box-culvert' ? 'Box Culvert' : 'Bridge'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Flow Regime:</span>
          <select
            value={flowRegime}
            onChange={(e) => setFlowRegime(e.target.value as FlowRegime)}
            className="px-3 py-1.5 text-xs rounded-md bg-card border border-border"
          >
            <option value="type-i">Type I (Free Surface)</option>
            <option value="type-ii">Type II (Inlet Control)</option>
            <option value="type-iii">Type III (Outlet Control)</option>
            <option value="pressurized">Pressurized</option>
          </select>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">U/S Level:</span>
            <input
              type="range"
              min={1}
              max={5}
              step={0.1}
              value={upstreamLevel}
              onChange={(e) => setUpstreamLevel(parseFloat(e.target.value))}
              className="w-20 h-1.5 rounded bg-secondary accent-water"
            />
            <span className="text-xs font-mono w-8">{upstreamLevel.toFixed(1)}m</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">D/S Level:</span>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.1}
              value={downstreamLevel}
              onChange={(e) => setDownstreamLevel(parseFloat(e.target.value))}
              className="w-20 h-1.5 rounded bg-secondary accent-water"
            />
            <span className="text-xs font-mono w-8">{downstreamLevel.toFixed(1)}m</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Canvas */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <svg viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} className="w-full h-auto">
            <defs>
              <linearGradient id="bridgeWaterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(210, 85%, 50%)" stopOpacity="0.8" />
                <stop offset="50%" stopColor="hsl(195, 90%, 55%)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="hsl(210, 85%, 50%)" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="concreteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(220, 10%, 65%)" />
                <stop offset="100%" stopColor="hsl(220, 10%, 45%)" />
              </linearGradient>
              <pattern id="concretePattern" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="hsl(220, 8%, 55%)" />
                <circle cx="3" cy="3" r="1" fill="hsl(220, 5%, 50%)" opacity="0.5" />
                <circle cx="9" cy="9" r="1" fill="hsl(220, 5%, 60%)" opacity="0.5" />
              </pattern>
            </defs>

            {/* Background */}
            <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="hsl(200, 30%, 96%)" />

            {/* Title */}
            <text x={CANVAS_WIDTH / 2} y={24} textAnchor="middle" className="text-sm font-semibold" fill="hsl(210, 15%, 30%)">
              Bridge/Culvert Flow Regimes — {currentRegime.title}
            </text>

            {/* Bed/terrain */}
            <rect x={0} y={baseY} width={CANVAS_WIDTH} height={60} fill="hsl(35, 35%, 40%)" />
            
            {/* Banks */}
            <path
              d={`M 0,${baseY} L 0,${baseY - 50} L 60,${baseY - 20} L 80,${baseY}`}
              fill="hsl(35, 40%, 50%)"
            />
            <path
              d={`M ${CANVAS_WIDTH},${baseY} L ${CANVAS_WIDTH},${baseY - 50} L ${CANVAS_WIDTH - 60},${baseY - 20} L ${CANVAS_WIDTH - 80},${baseY}`}
              fill="hsl(35, 40%, 50%)"
            />

            {/* Water body */}
            <motion.path
              d={buildWaterPath()}
              fill="url(#bridgeWaterGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />

            {/* Flow arrows */}
            {isAnimating && (
              <g>
                {[100, 200, 500, 600].map((x, i) => (
                  <motion.g
                    key={i}
                    animate={{ x: [0, 30, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <line
                      x1={x}
                      y1={baseY - 30}
                      x2={x + 20}
                      y2={baseY - 30}
                      stroke="hsl(0, 0%, 100%)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                    <polygon
                      points={`${x + 20},${baseY - 33} ${x + 26},${baseY - 30} ${x + 20},${baseY - 27}`}
                      fill="hsl(0, 0%, 100%)"
                      opacity="0.5"
                    />
                  </motion.g>
                ))}
              </g>
            )}

            {/* Structure */}
            <path
              d={buildStructurePath()}
              fill="url(#concretePattern)"
              stroke="hsl(220, 10%, 35%)"
              strokeWidth="3"
            />

            {/* Structure soffit line */}
            <line
              x1={centerX - structureWidth / 2 + 5}
              y1={baseY - structureHeight + (structureType === 'arch-culvert' ? 25 : 5)}
              x2={centerX + structureWidth / 2 - 5}
              y2={baseY - structureHeight + (structureType === 'arch-culvert' ? 25 : 5)}
              stroke="hsl(0, 70%, 50%)"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <text
              x={centerX + structureWidth / 2 + 10}
              y={baseY - structureHeight + 25}
              className="text-[10px]"
              fill="hsl(0, 70%, 45%)"
            >
              Soffit
            </text>

            {/* Water level annotations */}
            <g className="text-[10px]" fill="hsl(210, 15%, 40%)">
              <text x={70} y={baseY - upstreamLevel * 20 - 8} className="font-mono text-water">
                HW = {upstreamLevel.toFixed(1)}m
              </text>
              <text x={CANVAS_WIDTH - 100} y={baseY - downstreamLevel * 20 - 8} className="font-mono text-water">
                TW = {downstreamLevel.toFixed(1)}m
              </text>
            </g>

            {/* Flow direction */}
            <text x={30} y={CANVAS_HEIGHT - 30} className="text-xs font-medium" fill="hsl(210, 15%, 50%)">
              ← Upstream
            </text>
            <text x={CANVAS_WIDTH - 90} y={CANVAS_HEIGHT - 30} className="text-xs font-medium" fill="hsl(210, 15%, 50%)">
              Downstream →
            </text>

            {/* Energy Grade Line (EGL) for pressurized flow */}
            {flowRegime === 'pressurized' && (
              <g>
                <line
                  x1={80}
                  y1={baseY - upstreamLevel * 20 - 10}
                  x2={CANVAS_WIDTH - 80}
                  y2={baseY - downstreamLevel * 20 - 10}
                  stroke="hsl(30, 90%, 50%)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
                <text x={centerX} y={baseY - structureHeight - 15} textAnchor="middle" className="text-[10px]" fill="hsl(30, 90%, 45%)">
                  Energy Grade Line
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <motion.div
            key={flowRegime}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-lg border border-border p-4"
          >
            <h4 className="text-sm font-semibold text-foreground mb-2">{currentRegime.title}</h4>
            <p className="text-xs text-muted-foreground mb-3">{currentRegime.description}</p>
            <div className="space-y-1.5">
              {currentRegime.conditions.map((condition, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-water" />
                  <span>{condition}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-foreground mb-2">USBPR Method</h4>
            <p className="text-xs text-muted-foreground">
              ICM uses the USBPR (US Bureau of Public Roads) method to classify bridge/culvert 
              hydraulics based on upstream headwater (HW) and downstream tailwater (TW) levels 
              relative to the structure opening.
            </p>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h4 className="text-xs font-semibold text-primary mb-2">ICM Tip</h4>
            <p className="text-xs text-muted-foreground">
              When flow transitions to pressurized, ICM applies the Preissmann slot concept to maintain 
              numerical stability while solving the Saint-Venant equations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
