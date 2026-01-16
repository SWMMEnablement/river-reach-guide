import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChannelGeometry, HydraulicParams, HydraulicResults } from './types';

interface Props {
  geometry: ChannelGeometry;
  params: HydraulicParams;
  results: HydraulicResults;
  isAnimating: boolean;
}

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 300;
const REACH_LENGTH = 500; // meters

export const LongProfileView = ({ geometry, params, results, isAnimating }: Props) => {
  const [particles, setParticles] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    if (!isAnimating || results.velocity <= 0) {
      setParticles([]);
      return;
    }

    // Initialize particles
    const initialParticles = Array.from({ length: 20 }, (_, i) => ({
      x: (i * 35) % CANVAS_WIDTH,
      y: 120 + Math.random() * 40,
      id: i,
    }));
    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + results.velocity * 3) % (CANVAS_WIDTH - 60) + 50,
        y: 120 + Math.sin(p.x * 0.05 + p.id) * 15,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating, results.velocity]);

  const { bedSlope, waterLevel } = params;
  const { channelDepth } = geometry;

  // Calculate bed profile
  const bedElevationStart = 100;
  const bedElevationEnd = bedElevationStart - bedSlope * REACH_LENGTH;
  
  const scaleX = (CANVAS_WIDTH - 100) / REACH_LENGTH;
  const scaleY = 30; // Vertical exaggeration

  const bedStartY = 200;
  const bedEndY = bedStartY + (bedElevationStart - bedElevationEnd) * scaleY;
  
  const waterSurfaceStartY = bedStartY - waterLevel * scaleY;
  const waterSurfaceEndY = bedEndY - waterLevel * scaleY;

  // Cross-section markers
  const crossSectionPositions = [0.1, 0.3, 0.5, 0.7, 0.9];

  return (
    <svg viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} className="w-full h-auto">
      <defs>
        <linearGradient id="waterGradientLong" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(195, 90%, 60%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(210, 85%, 50%)" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="bedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(35, 40%, 50%)" />
          <stop offset="100%" stopColor="hsl(35, 30%, 30%)" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="hsl(200, 30%, 96%)" />

      {/* Title */}
      <text x={CANVAS_WIDTH / 2} y="25" textAnchor="middle" className="text-sm font-semibold fill-foreground">
        Long Profile View — Downstream Direction →
      </text>

      {/* Bed profile fill */}
      <path
        d={`M 50,${bedStartY} L ${CANVAS_WIDTH - 50},${bedEndY} L ${CANVAS_WIDTH - 50},${CANVAS_HEIGHT} L 50,${CANVAS_HEIGHT} Z`}
        fill="url(#bedGradient)"
      />

      {/* Water body */}
      {waterLevel > 0 && (
        <motion.path
          d={`M 50,${waterSurfaceStartY} L ${CANVAS_WIDTH - 50},${waterSurfaceEndY} 
              L ${CANVAS_WIDTH - 50},${bedEndY} L 50,${bedStartY} Z`}
          fill="url(#waterGradientLong)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {/* Flow particles */}
      {particles.map(p => (
        <motion.circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="hsl(195, 90%, 70%)"
          opacity={0.8}
        />
      ))}

      {/* Bed line */}
      <line
        x1={50}
        y1={bedStartY}
        x2={CANVAS_WIDTH - 50}
        y2={bedEndY}
        stroke="hsl(35, 35%, 25%)"
        strokeWidth="3"
      />

      {/* Water surface line */}
      {waterLevel > 0 && (
        <line
          x1={50}
          y1={waterSurfaceStartY}
          x2={CANVAS_WIDTH - 50}
          y2={waterSurfaceEndY}
          stroke="hsl(195, 90%, 45%)"
          strokeWidth="2"
          strokeDasharray="8 4"
        />
      )}

      {/* Cross-section markers */}
      {crossSectionPositions.map((pos, i) => {
        const x = 50 + pos * (CANVAS_WIDTH - 100);
        const bedY = bedStartY + pos * (bedEndY - bedStartY);
        const wsY = waterSurfaceStartY + pos * (waterSurfaceEndY - waterSurfaceStartY);
        
        return (
          <g key={i}>
            <line
              x1={x}
              y1={bedY}
              x2={x}
              y2={wsY - 10}
              stroke="hsl(280, 65%, 55%)"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <circle cx={x} cy={bedY} r="4" fill="hsl(280, 65%, 55%)" stroke="white" strokeWidth="1.5" />
            <text x={x} y={wsY - 20} textAnchor="middle" className="text-[10px] font-medium fill-[hsl(280,65%,55%)]">
              XS{i + 1}
            </text>
          </g>
        );
      })}

      {/* Slope annotation */}
      <g>
        <text x={CANVAS_WIDTH - 80} y={50} textAnchor="end" className="text-xs fill-muted-foreground">
          Bed Slope: S₀ = {(bedSlope * 1000).toFixed(2)}‰
        </text>
        <text x={CANVAS_WIDTH - 80} y={68} textAnchor="end" className="text-xs fill-water">
          Water Depth: y = {waterLevel.toFixed(2)}m
        </text>
        {results.velocity > 0 && (
          <text x={CANVAS_WIDTH - 80} y={86} textAnchor="end" className="text-xs fill-primary">
            Velocity: V = {results.velocity.toFixed(2)} m/s
          </text>
        )}
      </g>

      {/* Distance scale */}
      <g>
        <line x1={50} y1={CANVAS_HEIGHT - 25} x2={CANVAS_WIDTH - 50} y2={CANVAS_HEIGHT - 25} 
          stroke="hsl(210, 15%, 50%)" strokeWidth="1" />
        {[0, 0.25, 0.5, 0.75, 1].map((pos, i) => (
          <g key={i}>
            <line 
              x1={50 + pos * (CANVAS_WIDTH - 100)} 
              y1={CANVAS_HEIGHT - 25} 
              x2={50 + pos * (CANVAS_WIDTH - 100)} 
              y2={CANVAS_HEIGHT - 20}
              stroke="hsl(210, 15%, 50%)" 
              strokeWidth="1" 
            />
            <text 
              x={50 + pos * (CANVAS_WIDTH - 100)} 
              y={CANVAS_HEIGHT - 8} 
              textAnchor="middle" 
              className="text-[10px] font-mono fill-muted-foreground"
            >
              {(pos * REACH_LENGTH).toFixed(0)}m
            </text>
          </g>
        ))}
      </g>

      {/* Flow direction arrow */}
      <g transform={`translate(${CANVAS_WIDTH - 100}, 130)`}>
        <polygon points="0,0 20,10 0,20" fill="hsl(195, 80%, 50%)" opacity="0.7" />
        <text x="-5" y="30" className="text-[10px] fill-muted-foreground">Flow</text>
      </g>
    </svg>
  );
};
