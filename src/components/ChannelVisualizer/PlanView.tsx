import { motion } from 'framer-motion';
import { ChannelGeometry, HydraulicParams, HydraulicResults } from './types';

interface Props {
  geometry: ChannelGeometry;
  params: HydraulicParams;
  results: HydraulicResults;
  showFloodplain: boolean;
  isAnimating: boolean;
}

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 350;

export const PlanView = ({ geometry, params, results, showFloodplain, isAnimating }: Props) => {
  const { bottomWidth, channelDepth } = geometry;
  const channelWidth = (bottomWidth + 10) * 2;
  const floodplainWidth = showFloodplain ? 40 : 0;

  // Generate meandering river path
  const generateRiverPath = (offset: number = 0) => {
    const points: [number, number][] = [];
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = 40 + t * (CANVAS_HEIGHT - 80);
      const meander = Math.sin(t * Math.PI * 2.5) * 80;
      const x = CANVAS_WIDTH / 2 + meander + offset;
      points.push([x, y]);
    }
    
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]},${p[1]}`).join(' ');
  };

  // Cross-section marker positions
  const crossSectionPositions = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85];

  const getCrossSectionPoint = (t: number) => {
    const y = 40 + t * (CANVAS_HEIGHT - 80);
    const meander = Math.sin(t * Math.PI * 2.5) * 80;
    const x = CANVAS_WIDTH / 2 + meander;
    
    // Calculate perpendicular direction
    const dt = 0.01;
    const yNext = 40 + (t + dt) * (CANVAS_HEIGHT - 80);
    const meanderNext = Math.sin((t + dt) * Math.PI * 2.5) * 80;
    const xNext = CANVAS_WIDTH / 2 + meanderNext;
    
    const dx = xNext - x;
    const dy = yNext - y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    // Perpendicular vector
    const perpX = -dy / len;
    const perpY = dx / len;
    
    return { x, y, perpX, perpY };
  };

  return (
    <svg viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} className="w-full h-auto">
      <defs>
        <linearGradient id="waterGradientPlan" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(200, 85%, 55%)" />
          <stop offset="50%" stopColor="hsl(195, 90%, 50%)" />
          <stop offset="100%" stopColor="hsl(200, 85%, 55%)" />
        </linearGradient>
        <linearGradient id="floodplainGradientPlan" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(120, 30%, 70%)" />
          <stop offset="100%" stopColor="hsl(120, 35%, 65%)" />
        </linearGradient>
        <pattern id="grassPattern" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1" fill="hsl(120, 40%, 50%)" opacity="0.4" />
          <circle cx="8" cy="7" r="1" fill="hsl(120, 45%, 45%)" opacity="0.3" />
        </pattern>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="hsl(120, 20%, 85%)" />
      <rect x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#grassPattern)" />

      {/* Title */}
      <text x={CANVAS_WIDTH / 2} y="25" textAnchor="middle" className="text-sm font-semibold fill-foreground">
        Plan View — Meandering River Reach
      </text>

      {/* Floodplain extent */}
      {showFloodplain && (
        <>
          <path
            d={generateRiverPath(-channelWidth / 2 - floodplainWidth)}
            fill="none"
            stroke="hsl(120, 30%, 50%)"
            strokeWidth={floodplainWidth * 2}
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d={generateRiverPath(channelWidth / 2 + floodplainWidth)}
            fill="none"
            stroke="hsl(120, 30%, 50%)"
            strokeWidth={floodplainWidth * 2}
            strokeLinecap="round"
            opacity="0.3"
          />
        </>
      )}

      {/* River banks */}
      <path
        d={generateRiverPath(-channelWidth / 2 - 2)}
        fill="none"
        stroke="hsl(35, 40%, 45%)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d={generateRiverPath(channelWidth / 2 + 2)}
        fill="none"
        stroke="hsl(35, 40%, 45%)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Main channel water */}
      <path
        d={generateRiverPath(0)}
        fill="none"
        stroke="url(#waterGradientPlan)"
        strokeWidth={channelWidth}
        strokeLinecap="round"
      />

      {/* Flow direction indicators */}
      {isAnimating && [0.2, 0.4, 0.6, 0.8].map((t, i) => {
        const { x, y, perpX, perpY } = getCrossSectionPoint(t);
        const angle = Math.atan2(perpY, perpX) * 180 / Math.PI + 90;
        
        return (
          <motion.g 
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              y: [0, 10, 20],
            }}
            transition={{ 
              duration: 2,
              delay: i * 0.5,
              repeat: Infinity,
            }}
          >
            <polygon
              points="-6,-8 6,-8 0,8"
              fill="hsl(195, 90%, 80%)"
              transform={`translate(${x}, ${y}) rotate(${angle})`}
            />
          </motion.g>
        );
      })}

      {/* Cross-section markers */}
      {crossSectionPositions.map((t, i) => {
        const { x, y, perpX, perpY } = getCrossSectionPoint(t);
        const markerLength = channelWidth + (showFloodplain ? floodplainWidth : 20);
        
        return (
          <g key={i}>
            <line
              x1={x - perpX * markerLength}
              y1={y - perpY * markerLength}
              x2={x + perpX * markerLength}
              y2={y + perpY * markerLength}
              stroke="hsl(280, 65%, 55%)"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <circle 
              cx={x} 
              cy={y} 
              r="6" 
              fill="hsl(280, 65%, 55%)" 
              stroke="white" 
              strokeWidth="2" 
            />
            <text 
              x={x + perpX * (markerLength + 15)} 
              y={y + perpY * (markerLength + 15) + 4} 
              textAnchor="middle" 
              className="text-[10px] font-bold fill-[hsl(280,65%,45%)]"
            >
              XS{i + 1}
            </text>
          </g>
        );
      })}

      {/* Upstream/Downstream labels */}
      <g>
        <text x={CANVAS_WIDTH / 2} y={CANVAS_HEIGHT - 15} textAnchor="middle" 
          className="text-xs font-medium fill-muted-foreground">
          ↓ Downstream
        </text>
        <text x={CANVAS_WIDTH / 2} y={55} textAnchor="middle" 
          className="text-xs font-medium fill-muted-foreground">
          ↑ Upstream
        </text>
      </g>

      {/* Scale */}
      <g transform="translate(50, 300)">
        <line x1="0" y1="0" x2="60" y2="0" stroke="hsl(210, 15%, 40%)" strokeWidth="2" />
        <line x1="0" y1="-5" x2="0" y2="5" stroke="hsl(210, 15%, 40%)" strokeWidth="2" />
        <line x1="60" y1="-5" x2="60" y2="5" stroke="hsl(210, 15%, 40%)" strokeWidth="2" />
        <text x="30" y="18" textAnchor="middle" className="text-[10px] font-mono fill-muted-foreground">
          ~100m
        </text>
      </g>

      {/* Legend */}
      <g transform={`translate(${CANVAS_WIDTH - 120}, 60)`}>
        <rect x="0" y="0" width="110" height={showFloodplain ? 75 : 55} rx="4" 
          fill="white" fillOpacity="0.9" stroke="hsl(210, 15%, 80%)" />
        <circle cx="15" cy="15" r="4" fill="hsl(280, 65%, 55%)" />
        <text x="25" y="19" className="text-[10px] fill-foreground">Cross-section</text>
        <rect x="10" y="30" width="10" height="4" fill="hsl(195, 90%, 50%)" rx="2" />
        <text x="25" y="35" className="text-[10px] fill-foreground">Main channel</text>
        {showFloodplain && (
          <>
            <rect x="10" y="48" width="10" height="4" fill="hsl(120, 30%, 50%)" opacity="0.5" rx="2" />
            <text x="25" y="53" className="text-[10px] fill-foreground">Floodplain</text>
          </>
        )}
      </g>
    </svg>
  );
};
