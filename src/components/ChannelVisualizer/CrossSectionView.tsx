import { useEffect, useState } from 'react';
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
const CANVAS_HEIGHT = 320;

export const CrossSectionView = ({ geometry, params, results, showFloodplain, isAnimating }: Props) => {
  const [animationOffset, setAnimationOffset] = useState(0);
  
  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setAnimationOffset(prev => (prev + 2) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const { bottomWidth, bankSlope, channelDepth, floodplainWidth } = geometry;
  const { waterLevel } = params;

  // Calculate display scaling
  const totalWidth = showFloodplain 
    ? bottomWidth + 2 * bankSlope * channelDepth + 2 * floodplainWidth + 10
    : bottomWidth + 2 * bankSlope * channelDepth + 10;
  const totalHeight = channelDepth + (showFloodplain ? 3 : 2);
  
  const scale = Math.min(
    (CANVAS_WIDTH - 100) / totalWidth,
    (CANVAS_HEIGHT - 80) / totalHeight
  );

  const centerX = CANVAS_WIDTH / 2;
  const baseY = CANVAS_HEIGHT - 50;

  // Calculate key points
  const halfBottom = (bottomWidth / 2) * scale;
  const bankHeight = channelDepth * scale;
  const slopeOffset = (bankSlope * channelDepth) * scale;
  const fpWidth = floodplainWidth * scale;

  // Water surface
  const waterHeight = Math.min(waterLevel, channelDepth + 2) * scale;
  const waterY = baseY - waterHeight;

  // Build channel path
  const buildChannelPath = () => {
    const points: string[] = [];
    
    if (showFloodplain) {
      // Left floodplain outer edge
      points.push(`${centerX - halfBottom - slopeOffset - fpWidth},${baseY - bankHeight}`);
    }
    
    // Left bank top
    points.push(`${centerX - halfBottom - slopeOffset},${baseY - bankHeight}`);
    // Left bank bottom
    points.push(`${centerX - halfBottom},${baseY}`);
    // Right bank bottom
    points.push(`${centerX + halfBottom},${baseY}`);
    // Right bank top
    points.push(`${centerX + halfBottom + slopeOffset},${baseY - bankHeight}`);
    
    if (showFloodplain) {
      // Right floodplain outer edge
      points.push(`${centerX + halfBottom + slopeOffset + fpWidth},${baseY - bankHeight}`);
    }
    
    return points.join(' L ');
  };

  // Build water polygon
  const buildWaterPolygon = () => {
    if (waterLevel <= 0) return '';
    
    const points: [number, number][] = [];
    const clampedWaterHeight = Math.min(waterHeight, bankHeight + 20);
    const waterSurfaceY = baseY - clampedWaterHeight;
    
    // Calculate water width at current level
    const waterDepth = Math.min(waterLevel, channelDepth);
    const waterHalfWidth = halfBottom + (waterDepth / channelDepth) * slopeOffset;
    
    if (waterLevel <= channelDepth) {
      // Water within main channel
      points.push([centerX - waterHalfWidth, waterSurfaceY]);
      points.push([centerX - halfBottom, baseY]);
      points.push([centerX + halfBottom, baseY]);
      points.push([centerX + waterHalfWidth, waterSurfaceY]);
    } else if (showFloodplain) {
      // Water overtopping into floodplain
      const fpWaterWidth = Math.min((waterLevel - channelDepth) / 2 * scale, fpWidth);
      points.push([centerX - halfBottom - slopeOffset - fpWaterWidth, waterSurfaceY]);
      points.push([centerX - halfBottom - slopeOffset, baseY - bankHeight]);
      points.push([centerX - halfBottom, baseY]);
      points.push([centerX + halfBottom, baseY]);
      points.push([centerX + halfBottom + slopeOffset, baseY - bankHeight]);
      points.push([centerX + halfBottom + slopeOffset + fpWaterWidth, waterSurfaceY]);
    }
    
    return points.map(p => p.join(',')).join(' ');
  };

  // Generate velocity vectors
  const generateVelocityVectors = () => {
    if (results.velocity <= 0 || waterLevel <= 0) return [];
    
    const vectors: { x: number; y: number; length: number; fast: boolean }[] = [];
    const numCols = 6;
    const numRows = 3;
    
    const waterDepth = Math.min(waterLevel, channelDepth);
    const waterHalfWidth = halfBottom + (waterDepth / channelDepth) * slopeOffset;
    
    for (let col = 0; col < numCols; col++) {
      const xRatio = (col + 0.5) / numCols;
      const x = centerX - waterHalfWidth + xRatio * 2 * waterHalfWidth;
      
      for (let row = 0; row < numRows; row++) {
        const yRatio = (row + 0.5) / numRows;
        const y = baseY - yRatio * waterHeight * 0.9;
        
        if (y > baseY - waterHeight + 10) continue;
        
        // Velocity profile: faster near surface and center
        const depthFactor = Math.pow(yRatio, 0.5);
        const lateralFactor = 1 - 0.4 * Math.pow(2 * xRatio - 1, 2);
        const localVelocity = results.velocity * 1.2 * depthFactor * lateralFactor;
        
        vectors.push({
          x,
          y,
          length: Math.min(localVelocity * 15, 25),
          fast: localVelocity > results.velocity,
        });
      }
    }
    
    return vectors;
  };

  return (
    <svg viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} className="w-full h-auto">
      <defs>
        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(195, 90%, 55%)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="hsl(210, 85%, 45%)" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="terrainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(35, 45%, 55%)" />
          <stop offset="100%" stopColor="hsl(35, 35%, 35%)" />
        </linearGradient>
        <pattern id="vegetationPattern" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2" fill="hsl(120, 40%, 45%)" opacity="0.6" />
        </pattern>
        <marker id="velocityArrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="hsl(140, 70%, 35%)" />
        </marker>
        <marker id="velocityArrowFast" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="hsl(30, 90%, 50%)" />
        </marker>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="hsl(200, 30%, 96%)" />
      
      {/* Grid */}
      <g opacity="0.3">
        {[...Array(15)].map((_, i) => (
          <line key={`v${i}`} x1={50 + i * 45} y1="20" x2={50 + i * 45} y2={CANVAS_HEIGHT - 30} 
            stroke="hsl(210, 15%, 80%)" strokeWidth="0.5" />
        ))}
        {[...Array(8)].map((_, i) => (
          <line key={`h${i}`} x1="30" y1={30 + i * 40} x2={CANVAS_WIDTH - 30} y2={30 + i * 40}
            stroke="hsl(210, 15%, 80%)" strokeWidth="0.5" />
        ))}
      </g>

      {/* Terrain fill */}
      <path
        d={`M ${centerX - halfBottom - slopeOffset - (showFloodplain ? fpWidth + 30 : 30)},${baseY - bankHeight} 
            L ${centerX - halfBottom - slopeOffset},${baseY - bankHeight}
            L ${centerX - halfBottom},${baseY}
            L ${centerX + halfBottom},${baseY}
            L ${centerX + halfBottom + slopeOffset},${baseY - bankHeight}
            L ${centerX + halfBottom + slopeOffset + (showFloodplain ? fpWidth + 30 : 30)},${baseY - bankHeight}
            L ${centerX + halfBottom + slopeOffset + (showFloodplain ? fpWidth + 30 : 30)},${CANVAS_HEIGHT}
            L ${centerX - halfBottom - slopeOffset - (showFloodplain ? fpWidth + 30 : 30)},${CANVAS_HEIGHT}
            Z`}
        fill="url(#terrainGradient)"
      />

      {/* Floodplain vegetation */}
      {showFloodplain && (
        <>
          <rect 
            x={centerX - halfBottom - slopeOffset - fpWidth - 20} 
            y={baseY - bankHeight - 15}
            width={fpWidth + 20}
            height={15}
            fill="url(#vegetationPattern)"
          />
          <rect 
            x={centerX + halfBottom + slopeOffset} 
            y={baseY - bankHeight - 15}
            width={fpWidth + 20}
            height={15}
            fill="url(#vegetationPattern)"
          />
        </>
      )}

      {/* Water */}
      {waterLevel > 0 && (
        <motion.polygon
          points={buildWaterPolygon()}
          fill="url(#waterGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {/* Velocity vectors */}
      {isAnimating && generateVelocityVectors().map((v, i) => (
        <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.85 }}>
          <line
            x1={v.x - v.length / 2 + (animationOffset * 0.3)}
            y1={v.y}
            x2={v.x + v.length / 2 + (animationOffset * 0.3)}
            y2={v.y}
            stroke={v.fast ? "hsl(30, 90%, 50%)" : "hsl(140, 70%, 35%)"}
            strokeWidth={Math.max(1.5, v.length / 15)}
            strokeLinecap="round"
            markerEnd={v.fast ? "url(#velocityArrowFast)" : "url(#velocityArrow)"}
          />
          <circle
            cx={v.x - v.length / 3 + (animationOffset * 0.4) % 30}
            cy={v.y}
            r={1.5}
            fill={v.fast ? "hsl(30, 90%, 60%)" : "hsl(140, 70%, 50%)"}
            opacity={0.6}
          />
        </motion.g>
      ))}

      {/* Channel outline */}
      <path
        d={`M ${buildChannelPath()}`}
        fill="none"
        stroke="hsl(35, 35%, 30%)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Water surface line */}
      {waterLevel > 0 && (
        <line
          x1={30}
          y1={waterY}
          x2={CANVAS_WIDTH - 30}
          y2={waterY}
          stroke="hsl(195, 90%, 45%)"
          strokeWidth="2"
          strokeDasharray="8 4"
        />
      )}

      {/* Dimension annotations */}
      <g className="text-[10px]" fill="hsl(210, 15%, 40%)">
        {/* Bottom width */}
        <line x1={centerX - halfBottom} y1={baseY + 15} x2={centerX + halfBottom} y2={baseY + 15} 
          stroke="hsl(210, 15%, 50%)" strokeWidth="1" markerEnd="url(#arrowEnd)" />
        <text x={centerX} y={baseY + 28} textAnchor="middle" className="font-mono text-xs">
          b = {bottomWidth}m
        </text>
        
        {/* Water depth */}
        {waterLevel > 0 && (
          <>
            <line x1={centerX + halfBottom + slopeOffset + 20} y1={baseY} 
              x2={centerX + halfBottom + slopeOffset + 20} y2={waterY}
              stroke="hsl(195, 80%, 50%)" strokeWidth="1" />
            <text x={centerX + halfBottom + slopeOffset + 35} y={(baseY + waterY) / 2 + 4} 
              className="font-mono text-xs fill-water">
              y = {waterLevel.toFixed(2)}m
            </text>
          </>
        )}

        {/* Bank slope annotation */}
        <text x={centerX - halfBottom - slopeOffset / 2 - 5} y={baseY - bankHeight / 2} 
          textAnchor="end" className="font-mono text-xs">
          {bankSlope}:1
        </text>
      </g>

      {/* Bank markers */}
      <g>
        <circle cx={centerX - halfBottom - slopeOffset} cy={baseY - bankHeight} r="4" 
          fill="hsl(280, 65%, 55%)" stroke="white" strokeWidth="2" />
        <text x={centerX - halfBottom - slopeOffset} y={baseY - bankHeight - 10} 
          textAnchor="middle" className="text-xs font-medium fill-[hsl(280,65%,55%)]">LB</text>
        
        <circle cx={centerX + halfBottom + slopeOffset} cy={baseY - bankHeight} r="4" 
          fill="hsl(280, 65%, 55%)" stroke="white" strokeWidth="2" />
        <text x={centerX + halfBottom + slopeOffset} y={baseY - bankHeight - 10} 
          textAnchor="middle" className="text-xs font-medium fill-[hsl(280,65%,55%)]">RB</text>
      </g>
    </svg>
  );
};
