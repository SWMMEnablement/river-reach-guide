import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Droplets, Grid3X3 } from 'lucide-react';

interface Props {
  isAnimating: boolean;
}

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 380;

export const CouplingZonesView = ({ isAnimating }: Props) => {
  const [waterLevel, setWaterLevel] = useState(2.8);
  const [flowIntensity, setFlowIntensity] = useState(0.6);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; inFloodplain: boolean }[]>([]);
  const [showGrid, setShowGrid] = useState(true);

  // Geometry constants
  const channelCenterX = CANVAS_WIDTH / 2;
  const baseY = CANVAS_HEIGHT - 80;
  const channelWidth = 80;
  const bankHeight = 60;
  const floodplainWidth = 200;
  const bankLevel = 2.5; // Level at which spill occurs

  const waterY = baseY - waterLevel * 25;
  const bankY = baseY - bankLevel * 25;
  const isSpilling = waterLevel > bankLevel;

  // Animate particles
  useEffect(() => {
    if (!isAnimating) return;

    // Initialize particles
    const initialParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: 100 + Math.random() * (CANVAS_WIDTH - 200),
      y: waterY + Math.random() * (baseY - waterY - 10),
      vx: (0.5 + Math.random() * 1) * flowIntensity,
      vy: (Math.random() - 0.5) * 0.3,
      inFloodplain: false,
    }));
    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => {
        let newX = p.x + p.vx * 2;
        let newY = p.y + p.vy;
        let inFloodplain = p.inFloodplain;

        // Check if particle enters floodplain zone
        const inChannel = newX > channelCenterX - channelWidth / 2 && newX < channelCenterX + channelWidth / 2;
        
        if (isSpilling && !inChannel && newY < bankY + 20) {
          inFloodplain = true;
          // Slower flow in floodplain
          newX = p.x + p.vx * 0.5;
        }

        // Wrap around
        if (newX > CANVAS_WIDTH - 50) newX = 60;
        if (newY < waterY + 5) newY = waterY + 5;
        if (newY > baseY - 5) newY = baseY - 5;

        return { ...p, x: newX, y: newY, inFloodplain };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating, waterLevel, flowIntensity, isSpilling]);

  // Generate 2D mesh grid
  const generate2DMesh = () => {
    if (!showGrid) return null;
    const cells: JSX.Element[] = [];
    const cellSize = 18;
    
    // Left floodplain grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        const x = 60 + col * cellSize;
        const y = bankY - 10 + row * cellSize;
        const active = isSpilling && y > waterY;
        
        cells.push(
          <rect
            key={`l-${row}-${col}`}
            x={x}
            y={y}
            width={cellSize - 1}
            height={cellSize - 1}
            fill={active ? 'hsl(195, 90%, 55%)' : 'hsl(200, 20%, 90%)'}
            opacity={active ? 0.4 : 0.15}
            stroke="hsl(210, 30%, 60%)"
            strokeWidth="0.5"
          />
        );
      }
    }

    // Right floodplain grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        const x = channelCenterX + channelWidth / 2 + 20 + col * cellSize;
        const y = bankY - 10 + row * cellSize;
        const active = isSpilling && y > waterY;
        
        cells.push(
          <rect
            key={`r-${row}-${col}`}
            x={x}
            y={y}
            width={cellSize - 1}
            height={cellSize - 1}
            fill={active ? 'hsl(195, 90%, 55%)' : 'hsl(200, 20%, 90%)'}
            opacity={active ? 0.4 : 0.15}
            stroke="hsl(210, 30%, 60%)"
            strokeWidth="0.5"
          />
        );
      }
    }

    return cells;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-secondary/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-water" />
          <span className="text-xs font-medium">Water Level:</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={waterLevel}
            onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
            className="w-24 h-1.5 rounded bg-secondary accent-water"
          />
          <span className="text-xs font-mono w-10">{waterLevel.toFixed(1)}m</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Flow Rate:</span>
          <input
            type="range"
            min={0.2}
            max={1.5}
            step={0.1}
            value={flowIntensity}
            onChange={(e) => setFlowIntensity(parseFloat(e.target.value))}
            className="w-20 h-1.5 rounded bg-secondary accent-primary"
          />
        </div>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
            showGrid ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          2D Mesh
        </button>

        <div className="flex-1" />

        <div className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          isSpilling 
            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {isSpilling ? '⚠️ Floodplain Active' : '✓ In-Bank Flow'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Canvas */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <svg viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} className="w-full h-auto">
            <defs>
              <linearGradient id="couplingWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(195, 90%, 55%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(210, 85%, 45%)" stopOpacity="0.85" />
              </linearGradient>
              <pattern id="floodplainVeg" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="2" fill="hsl(120, 35%, 50%)" opacity="0.4" />
              </pattern>
              <marker id="couplingArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="hsl(30, 90%, 50%)" />
              </marker>
            </defs>

            {/* Background */}
            <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="hsl(200, 30%, 97%)" />

            {/* Title */}
            <text x={CANVAS_WIDTH / 2} y={24} textAnchor="middle" className="text-sm font-semibold" fill="hsl(210, 15%, 30%)">
              1D/2D Coupling Zones — Floodplain Spill Visualization
            </text>

            {/* 2D mesh grid */}
            <g>{generate2DMesh()}</g>

            {/* Floodplain areas */}
            <rect
              x={50}
              y={bankY}
              width={channelCenterX - channelWidth / 2 - 60}
              height={baseY - bankY}
              fill="url(#floodplainVeg)"
            />
            <rect
              x={channelCenterX + channelWidth / 2 + 10}
              y={bankY}
              width={channelCenterX - channelWidth / 2 - 60}
              height={baseY - bankY}
              fill="url(#floodplainVeg)"
            />

            {/* Main channel bed */}
            <rect
              x={channelCenterX - channelWidth / 2}
              y={baseY}
              width={channelWidth}
              height={30}
              fill="hsl(35, 35%, 40%)"
            />

            {/* Banks */}
            <path
              d={`M ${channelCenterX - channelWidth / 2 - 10},${bankY} 
                  L ${channelCenterX - channelWidth / 2},${baseY}
                  L ${channelCenterX + channelWidth / 2},${baseY}
                  L ${channelCenterX + channelWidth / 2 + 10},${bankY}`}
              fill="none"
              stroke="hsl(35, 45%, 35%)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Water in main channel */}
            <path
              d={`M ${channelCenterX - channelWidth / 2 - (isSpilling ? 10 : 5)},${Math.max(waterY, bankY)}
                  L ${channelCenterX - channelWidth / 2},${baseY}
                  L ${channelCenterX + channelWidth / 2},${baseY}
                  L ${channelCenterX + channelWidth / 2 + (isSpilling ? 10 : 5)},${Math.max(waterY, bankY)}
                  ${isSpilling ? `L ${channelCenterX + channelWidth / 2 + 5},${waterY} L ${channelCenterX - channelWidth / 2 - 5},${waterY}` : ''}
                  Z`}
              fill="url(#couplingWaterGrad)"
            />

            {/* Floodplain water (when spilling) */}
            {isSpilling && (
              <>
                <motion.rect
                  x={55}
                  y={waterY}
                  width={channelCenterX - channelWidth / 2 - 65}
                  height={bankY - waterY + 20}
                  fill="hsl(195, 90%, 55%)"
                  opacity={0.35}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                />
                <motion.rect
                  x={channelCenterX + channelWidth / 2 + 15}
                  y={waterY}
                  width={channelCenterX - channelWidth / 2 - 65}
                  height={bankY - waterY + 20}
                  fill="hsl(195, 90%, 55%)"
                  opacity={0.35}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                />
              </>
            )}

            {/* Flow particles */}
            {particles.map(p => (
              <motion.circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={p.inFloodplain ? 2.5 : 3}
                fill={p.inFloodplain ? 'hsl(195, 80%, 60%)' : 'hsl(0, 0%, 100%)'}
                opacity={p.inFloodplain ? 0.6 : 0.7}
              />
            ))}

            {/* Coupling zone arrows */}
            {isSpilling && (
              <g>
                <motion.line
                  x1={channelCenterX - channelWidth / 2 - 5}
                  y1={bankY}
                  x2={channelCenterX - channelWidth / 2 - 40}
                  y2={bankY - 15}
                  stroke="hsl(30, 90%, 50%)"
                  strokeWidth="2.5"
                  markerEnd="url(#couplingArrow)"
                  animate={{ strokeDashoffset: [0, 20] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  strokeDasharray="5 5"
                />
                <motion.line
                  x1={channelCenterX + channelWidth / 2 + 5}
                  y1={bankY}
                  x2={channelCenterX + channelWidth / 2 + 40}
                  y2={bankY - 15}
                  stroke="hsl(30, 90%, 50%)"
                  strokeWidth="2.5"
                  markerEnd="url(#couplingArrow)"
                  animate={{ strokeDashoffset: [0, 20] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  strokeDasharray="5 5"
                />
              </g>
            )}

            {/* Bank markers */}
            <g>
              <circle cx={channelCenterX - channelWidth / 2 - 5} cy={bankY} r="5" fill="hsl(280, 65%, 55%)" stroke="white" strokeWidth="2" />
              <text x={channelCenterX - channelWidth / 2 - 5} y={bankY - 12} textAnchor="middle" className="text-[10px] font-bold" fill="hsl(280, 65%, 45%)">LB</text>
              
              <circle cx={channelCenterX + channelWidth / 2 + 5} cy={bankY} r="5" fill="hsl(280, 65%, 55%)" stroke="white" strokeWidth="2" />
              <text x={channelCenterX + channelWidth / 2 + 5} y={bankY - 12} textAnchor="middle" className="text-[10px] font-bold" fill="hsl(280, 65%, 45%)">RB</text>
            </g>

            {/* Level annotations */}
            <g className="text-[10px]" fill="hsl(210, 15%, 40%)">
              <line x1={CANVAS_WIDTH - 50} y1={waterY} x2={CANVAS_WIDTH - 25} y2={waterY} stroke="hsl(195, 80%, 50%)" strokeWidth="1.5" />
              <text x={CANVAS_WIDTH - 20} y={waterY + 4} className="font-mono text-water text-[10px]">WL</text>
              
              <line x1={CANVAS_WIDTH - 50} y1={bankY} x2={CANVAS_WIDTH - 25} y2={bankY} stroke="hsl(280, 65%, 55%)" strokeWidth="1.5" strokeDasharray="3 2" />
              <text x={CANVAS_WIDTH - 20} y={bankY + 4} className="font-mono text-[10px]" fill="hsl(280, 65%, 50%)">Bank</text>
            </g>

            {/* Zone labels */}
            <text x={120} y={CANVAS_HEIGHT - 30} textAnchor="middle" className="text-xs font-medium" fill="hsl(120, 40%, 35%)">
              2D Floodplain Zone
            </text>
            <text x={CANVAS_WIDTH / 2} y={CANVAS_HEIGHT - 30} textAnchor="middle" className="text-xs font-medium" fill="hsl(210, 60%, 40%)">
              1D River Reach
            </text>
            <text x={CANVAS_WIDTH - 120} y={CANVAS_HEIGHT - 30} textAnchor="middle" className="text-xs font-medium" fill="hsl(120, 40%, 35%)">
              2D Floodplain Zone
            </text>

            {/* Coupling interface indicator */}
            {isSpilling && (
              <>
                <line
                  x1={channelCenterX - channelWidth / 2 - 8}
                  y1={bankY - 5}
                  x2={channelCenterX - channelWidth / 2 - 8}
                  y2={bankY + 25}
                  stroke="hsl(30, 90%, 50%)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1={channelCenterX + channelWidth / 2 + 8}
                  y1={bankY - 5}
                  x2={channelCenterX + channelWidth / 2 + 8}
                  y2={bankY + 25}
                  stroke="hsl(30, 90%, 50%)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">1D/2D Coupling</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              ICM automatically couples 1D river channels with 2D floodplain zones. When water level 
              exceeds bank markers, flow spills onto the 2D mesh.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-water" />
                <span>1D Saint-Venant in channel</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded bg-water/40" />
                <span>2D Shallow water on floodplain</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-0.5 bg-orange-500" />
                <span>Coupling interface (bank line)</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-foreground mb-2">Coupling Method</h4>
            <p className="text-xs text-muted-foreground">
              ICM uses a lateral spill link approach. Flow exchange is computed based on 
              water level difference between the 1D reach and adjacent 2D cells using 
              weir-type equations.
            </p>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <h4 className="text-xs font-semibold text-primary mb-2">Bank Marker Importance</h4>
            <p className="text-xs text-muted-foreground">
              Bank markers (LB/RB) define exactly where 1D↔2D exchange occurs. Incorrect 
              placement is a common cause of "floodplain not activating" issues.
            </p>
          </div>

          <div className="text-center pt-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isSpilling ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'
            }`}>
              Spill depth: {isSpilling ? (waterLevel - bankLevel).toFixed(2) : '0.00'}m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
