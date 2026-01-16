import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Droplets, 
  Ruler, 
  Mountain,
  Info,
  Waves,
  Play,
  Pause
} from "lucide-react";

interface SurveyPoint {
  id: string;
  x: number; // chainage in meters
  y: number; // elevation in meters
}

const defaultPoints: SurveyPoint[] = [
  { id: "p1", x: 0, y: 105 },
  { id: "p2", x: 5, y: 102 },
  { id: "p3", x: 10, y: 100 },
  { id: "p4", x: 15, y: 98 },
  { id: "p5", x: 20, y: 97 },
  { id: "p6", x: 25, y: 96.5 },
  { id: "p7", x: 30, y: 96 },
  { id: "p8", x: 35, y: 96.5 },
  { id: "p9", x: 40, y: 97 },
  { id: "p10", x: 45, y: 98 },
  { id: "p11", x: 50, y: 100 },
  { id: "p12", x: 55, y: 102 },
  { id: "p13", x: 60, y: 105 },
];

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 350;
const PADDING = 50;

export const CrossSectionEditor = () => {
  const [points, setPoints] = useState<SurveyPoint[]>(defaultPoints);
  const [waterLevel, setWaterLevel] = useState(99);
  const [leftBank, setLeftBank] = useState(10);
  const [rightBank, setRightBank] = useState(50);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [manningN, setManningN] = useState(0.035); // Manning's roughness coefficient
  const [channelSlope, setChannelSlope] = useState(0.001); // Bed slope (m/m)
  const [showVelocityVectors, setShowVelocityVectors] = useState(true);
  const [animationOffset, setAnimationOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  // Animate velocity vectors
  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setAnimationOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Calculate bounds
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y)) - 2;
  const maxY = Math.max(...points.map(p => p.y)) + 2;

  // Transform functions
  const toCanvasX = (x: number) => {
    return PADDING + ((x - minX) / (maxX - minX)) * (CANVAS_WIDTH - 2 * PADDING);
  };

  const toCanvasY = (y: number) => {
    return CANVAS_HEIGHT - PADDING - ((y - minY) / (maxY - minY)) * (CANVAS_HEIGHT - 2 * PADDING);
  };

  const fromCanvasX = (cx: number) => {
    return minX + ((cx - PADDING) / (CANVAS_WIDTH - 2 * PADDING)) * (maxX - minX);
  };

  const fromCanvasY = (cy: number) => {
    return minY + ((CANVAS_HEIGHT - PADDING - cy) / (CANVAS_HEIGHT - 2 * PADDING)) * (maxY - minY);
  };

  // Calculate hydraulic properties
  const calculateProperties = useCallback(() => {
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    let area = 0;
    let wettedPerimeter = 0;
    let topWidth = 0;

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];

      // Check if segment is below water level
      const y1 = Math.min(p1.y, waterLevel);
      const y2 = Math.min(p2.y, waterLevel);

      if (y1 < waterLevel || y2 < waterLevel) {
        // Trapezoidal area
        const h1 = waterLevel - y1;
        const h2 = waterLevel - y2;
        if (h1 > 0 || h2 > 0) {
          const segmentArea = ((h1 + h2) / 2) * (p2.x - p1.x);
          area += Math.max(0, segmentArea);

          // Wetted perimeter
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          if (p1.y < waterLevel && p2.y < waterLevel) {
            wettedPerimeter += Math.sqrt(dx * dx + dy * dy);
          }
        }
      }
    }

    // Calculate top width at water level
    const leftIntersect = sortedPoints.find((p, i) => {
      if (i === 0) return false;
      const prev = sortedPoints[i - 1];
      return (prev.y >= waterLevel && p.y < waterLevel) || (prev.y < waterLevel && p.y >= waterLevel);
    });
    const rightIntersect = [...sortedPoints].reverse().find((p, i, arr) => {
      if (i === 0) return false;
      const prev = arr[i - 1];
      return (prev.y >= waterLevel && p.y < waterLevel) || (prev.y < waterLevel && p.y >= waterLevel);
    });

    if (leftIntersect && rightIntersect) {
      topWidth = rightIntersect.x - leftIntersect.x;
    }

    const hydraulicRadius = wettedPerimeter > 0 ? area / wettedPerimeter : 0;
    const hydraulicDepth = topWidth > 0 ? area / topWidth : 0;

    // Manning's equation: V = (1/n) * R^(2/3) * S^(1/2)
    const velocity = manningN > 0 && hydraulicRadius > 0 && channelSlope > 0
      ? (1 / manningN) * Math.pow(hydraulicRadius, 2/3) * Math.pow(channelSlope, 0.5)
      : 0;
    
    // Discharge Q = V * A
    const discharge = velocity * area;

    // Froude number Fr = V / sqrt(g * D) where D is hydraulic depth
    const g = 9.81;
    const froudeNumber = hydraulicDepth > 0 ? velocity / Math.sqrt(g * hydraulicDepth) : 0;

    return { area, wettedPerimeter, topWidth, hydraulicRadius, hydraulicDepth, velocity, discharge, froudeNumber };
  }, [points, waterLevel, manningN, channelSlope]);

  // Calculate velocity distribution across section (parabolic profile)
  const calculateVelocityProfile = useCallback(() => {
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    const velocityPoints: { x: number; y: number; velocity: number; depth: number }[] = [];
    const props = calculateProperties();
    const maxVelocity = props.velocity * 1.2; // Surface velocity slightly higher than mean

    for (let i = 0; i < sortedPoints.length; i++) {
      const p = sortedPoints[i];
      if (p.y < waterLevel) {
        const depth = waterLevel - p.y;
        // Velocity profile: max at surface, zero at bed (logarithmic approximation simplified to parabolic)
        const localVelocity = maxVelocity * (1 - Math.pow((waterLevel - p.y) / (waterLevel - Math.min(...points.map(pt => pt.y))), 0.5) * 0.15);
        velocityPoints.push({ x: p.x, y: p.y, velocity: localVelocity, depth });
      }
    }

    return velocityPoints;
  }, [points, waterLevel, calculateProperties]);

  const properties = calculateProperties();

  // Handle mouse events for dragging
  const handleMouseDown = (pointId: string) => {
    setDragging(pointId);
    setSelectedPoint(pointId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const newX = Math.max(minX, Math.min(maxX, fromCanvasX(cx)));
    const newY = Math.max(minY, Math.min(maxY, fromCanvasY(cy)));

    setPoints(prev =>
      prev.map(p =>
        p.id === dragging ? { ...p, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 } : p
      )
    );
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  // Add new point
  const addPoint = () => {
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    const midIndex = Math.floor(sortedPoints.length / 2);
    const p1 = sortedPoints[midIndex - 1];
    const p2 = sortedPoints[midIndex];
    
    const newPoint: SurveyPoint = {
      id: `p${Date.now()}`,
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
    
    setPoints([...points, newPoint]);
  };

  // Remove selected point
  const removePoint = () => {
    if (selectedPoint && points.length > 3) {
      setPoints(points.filter(p => p.id !== selectedPoint));
      setSelectedPoint(null);
    }
  };

  // Reset to default
  const resetPoints = () => {
    setPoints(defaultPoints);
    setWaterLevel(99);
    setSelectedPoint(null);
    setManningN(0.035);
    setChannelSlope(0.001);
  };

  // Generate velocity vectors for visualization
  const generateVelocityVectors = useCallback(() => {
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    const vectors: { x: number; y: number; velocity: number; length: number }[] = [];
    const props = calculateProperties();
    
    if (props.velocity <= 0) return vectors;

    // Find water boundaries
    let leftWaterX = minX;
    let rightWaterX = maxX;
    
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];
      if (p1.y >= waterLevel && p2.y < waterLevel) {
        const t = (waterLevel - p1.y) / (p2.y - p1.y);
        leftWaterX = p1.x + t * (p2.x - p1.x);
      }
      if (p1.y < waterLevel && p2.y >= waterLevel) {
        const t = (waterLevel - p1.y) / (p2.y - p1.y);
        rightWaterX = p1.x + t * (p2.x - p1.x);
      }
    }

    // Create grid of velocity vectors
    const numCols = 8;
    const numRows = 4;
    const waterWidth = rightWaterX - leftWaterX;
    
    for (let col = 0; col < numCols; col++) {
      const x = leftWaterX + (col + 0.5) * (waterWidth / numCols);
      
      // Find bed elevation at this x
      let bedY = waterLevel;
      for (let i = 0; i < sortedPoints.length - 1; i++) {
        const p1 = sortedPoints[i];
        const p2 = sortedPoints[i + 1];
        if (p1.x <= x && p2.x >= x) {
          const t = (x - p1.x) / (p2.x - p1.x);
          bedY = p1.y + t * (p2.y - p1.y);
          break;
        }
      }
      
      if (bedY >= waterLevel) continue;
      
      const localDepth = waterLevel - bedY;
      
      for (let row = 0; row < numRows; row++) {
        const relativeDepth = (row + 0.5) / numRows;
        const y = bedY + relativeDepth * localDepth;
        
        if (y >= waterLevel) continue;
        
        // Logarithmic velocity profile: faster near surface
        const depthRatio = (y - bedY) / localDepth;
        const velocityFactor = Math.log(1 + depthRatio * 30) / Math.log(31);
        
        // Reduce velocity near banks (lateral distribution)
        const lateralPos = (x - leftWaterX) / waterWidth;
        const lateralFactor = 1 - 0.4 * Math.pow(2 * lateralPos - 1, 2);
        
        const localVelocity = props.velocity * 1.2 * velocityFactor * lateralFactor;
        const length = Math.min(localVelocity * 15, 25);
        
        vectors.push({ x, y, velocity: localVelocity, length });
      }
    }
    
    return vectors;
  }, [points, waterLevel, calculateProperties, minX, maxX]);

  // Generate path for cross-section
  const sortedPoints = [...points].sort((a, b) => a.x - b.x);
  const crossSectionPath = sortedPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toCanvasX(p.x)} ${toCanvasY(p.y)}`)
    .join(" ");

  // Generate water polygon
  const waterPoints: string[] = [];
  sortedPoints.forEach(p => {
    if (p.y < waterLevel) {
      waterPoints.push(`${toCanvasX(p.x)},${toCanvasY(p.y)}`);
    }
  });

  const waterLevelY = toCanvasY(waterLevel);

  // Find intersection points with water level
  const getWaterPolygon = () => {
    const polygonPoints: string[] = [];
    let inWater = false;
    
    for (let i = 0; i < sortedPoints.length; i++) {
      const p = sortedPoints[i];
      const prev = i > 0 ? sortedPoints[i - 1] : null;
      
      if (prev && ((prev.y >= waterLevel && p.y < waterLevel) || (prev.y < waterLevel && p.y >= waterLevel))) {
        // Intersection point
        const t = (waterLevel - prev.y) / (p.y - prev.y);
        const intersectX = prev.x + t * (p.x - prev.x);
        polygonPoints.push(`${toCanvasX(intersectX)},${waterLevelY}`);
      }
      
      if (p.y < waterLevel) {
        polygonPoints.push(`${toCanvasX(p.x)},${toCanvasY(p.y)}`);
        inWater = true;
      }
    }
    
    return polygonPoints.join(" ");
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor Canvas */}
        <div className="lg:col-span-3 bg-card rounded-xl p-6 border border-border shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Cross-Section Editor</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVelocityVectors(!showVelocityVectors)}
                className={`p-2 rounded-lg transition-colors ${
                  showVelocityVectors 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                }`}
                title="Toggle velocity vectors"
              >
                <Waves className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                disabled={!showVelocityVectors}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                  isAnimating && showVelocityVectors
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                }`}
                title={isAnimating ? "Pause animation" : "Play animation"}
              >
                {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <div className="w-px h-6 bg-border mx-1" />
              <button
                onClick={addPoint}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                title="Add point"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={removePoint}
                disabled={!selectedPoint || points.length <= 3}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove selected point"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={resetPoints}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                title="Reset to default"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Drag points to modify the channel geometry. The water surface and hydraulic properties update in real-time.
          </p>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="w-full h-auto bg-gradient-to-b from-sky-50 to-sky-100 rounded-lg cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <linearGradient id="waterFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(195, 90%, 55%)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="hsl(210, 85%, 45%)" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="terrainFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(35, 45%, 50%)" />
                <stop offset="100%" stopColor="hsl(35, 35%, 35%)" />
              </linearGradient>
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(210, 20%, 85%)" strokeWidth="0.5" />
              </pattern>
              {/* Arrow marker for velocity vectors */}
              <marker
                id="arrowhead"
                markerWidth="6"
                markerHeight="4"
                refX="5"
                refY="2"
                orient="auto"
              >
                <polygon points="0 0, 6 2, 0 4" fill="hsl(140, 70%, 35%)" />
              </marker>
              <marker
                id="arrowhead-fast"
                markerWidth="6"
                markerHeight="4"
                refX="5"
                refY="2"
                orient="auto"
              >
                <polygon points="0 0, 6 2, 0 4" fill="hsl(30, 90%, 50%)" />
              </marker>
            </defs>

            {/* Grid */}
            <rect x={PADDING} y={PADDING} width={CANVAS_WIDTH - 2 * PADDING} height={CANVAS_HEIGHT - 2 * PADDING} fill="url(#gridPattern)" />

            {/* Axis labels */}
            <text x={CANVAS_WIDTH / 2} y={CANVAS_HEIGHT - 10} textAnchor="middle" className="fill-muted-foreground text-xs">
              Chainage (m)
            </text>
            <text x={15} y={CANVAS_HEIGHT / 2} textAnchor="middle" transform={`rotate(-90, 15, ${CANVAS_HEIGHT / 2})`} className="fill-muted-foreground text-xs">
              Elevation (m)
            </text>

            {/* Y-axis ticks */}
            {[...Array(6)].map((_, i) => {
              const yVal = minY + (i / 5) * (maxY - minY);
              const cy = toCanvasY(yVal);
              return (
                <g key={`y-${i}`}>
                  <line x1={PADDING - 5} y1={cy} x2={PADDING} y2={cy} stroke="hsl(210, 15%, 60%)" strokeWidth="1" />
                  <text x={PADDING - 10} y={cy + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
                    {yVal.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* X-axis ticks */}
            {[...Array(7)].map((_, i) => {
              const xVal = minX + (i / 6) * (maxX - minX);
              const cx = toCanvasX(xVal);
              return (
                <g key={`x-${i}`}>
                  <line x1={cx} y1={CANVAS_HEIGHT - PADDING} x2={cx} y2={CANVAS_HEIGHT - PADDING + 5} stroke="hsl(210, 15%, 60%)" strokeWidth="1" />
                  <text x={cx} y={CANVAS_HEIGHT - PADDING + 18} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                    {xVal.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Terrain fill */}
            <path
              d={`${crossSectionPath} L ${toCanvasX(maxX)} ${CANVAS_HEIGHT - PADDING} L ${toCanvasX(minX)} ${CANVAS_HEIGHT - PADDING} Z`}
              fill="url(#terrainFill)"
              opacity="0.9"
            />

            {/* Water polygon */}
            {waterLevelY < CANVAS_HEIGHT - PADDING && (
              <polygon
                points={getWaterPolygon()}
                fill="url(#waterFill)"
              />
            )}

            {/* Water level line */}
            <line
              x1={PADDING}
              y1={waterLevelY}
              x2={CANVAS_WIDTH - PADDING}
              y2={waterLevelY}
              stroke="hsl(195, 90%, 45%)"
              strokeWidth="2"
              strokeDasharray="8 4"
            />
            <text x={CANVAS_WIDTH - PADDING + 5} y={waterLevelY + 4} className="fill-water text-xs font-medium">
              WL: {waterLevel.toFixed(1)}m
            </text>

            {/* Bank markers */}
            <line
              x1={toCanvasX(leftBank)}
              y1={PADDING}
              x2={toCanvasX(leftBank)}
              y2={CANVAS_HEIGHT - PADDING}
              stroke="hsl(280, 65%, 55%)"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.7"
            />
            <text x={toCanvasX(leftBank)} y={PADDING - 8} textAnchor="middle" className="fill-node text-xs font-medium">
              LB
            </text>

            <line
              x1={toCanvasX(rightBank)}
              y1={PADDING}
              x2={toCanvasX(rightBank)}
              y2={CANVAS_HEIGHT - PADDING}
              stroke="hsl(280, 65%, 55%)"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.7"
            />
            <text x={toCanvasX(rightBank)} y={PADDING - 8} textAnchor="middle" className="fill-node text-xs font-medium">
              RB
            </text>

            {/* Cross-section line */}
            <path
              d={crossSectionPath}
              fill="none"
              stroke="hsl(35, 35%, 30%)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Velocity vectors */}
            {showVelocityVectors && generateVelocityVectors().map((vector, index) => {
              const cx = toCanvasX(vector.x);
              const cy = toCanvasY(vector.y);
              const isFast = vector.velocity > properties.velocity;
              const animatedOffset = (animationOffset * vector.velocity * 0.3) % 30;
              
              return (
                <motion.g
                  key={`velocity-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ delay: index * 0.02 }}
                >
                  {/* Animated flow line */}
                  <line
                    x1={cx - vector.length / 2 + animatedOffset}
                    y1={cy}
                    x2={cx + vector.length / 2 + animatedOffset}
                    y2={cy}
                    stroke={isFast ? "hsl(30, 90%, 50%)" : "hsl(140, 70%, 35%)"}
                    strokeWidth={Math.max(1.5, vector.velocity * 1.5)}
                    strokeLinecap="round"
                    markerEnd={isFast ? "url(#arrowhead-fast)" : "url(#arrowhead)"}
                    opacity={0.85}
                  />
                  {/* Secondary particle effect */}
                  <circle
                    cx={cx - vector.length / 3 + (animatedOffset * 1.2) % 40}
                    cy={cy}
                    r={1.5}
                    fill={isFast ? "hsl(30, 90%, 60%)" : "hsl(140, 70%, 50%)"}
                    opacity={0.6}
                  />
                </motion.g>
              );
            })}

            {/* Survey points */}
            {sortedPoints.map((point) => (
              <motion.g
                key={point.id}
                onMouseDown={() => handleMouseDown(point.id)}
                style={{ cursor: "grab" }}
                whileHover={{ scale: 1.2 }}
              >
                <circle
                  cx={toCanvasX(point.x)}
                  cy={toCanvasY(point.y)}
                  r={selectedPoint === point.id ? 10 : 8}
                  fill={selectedPoint === point.id ? "hsl(195, 80%, 35%)" : "hsl(35, 45%, 50%)"}
                  stroke="white"
                  strokeWidth="2"
                  className="drop-shadow-md"
                />
                {selectedPoint === point.id && (
                  <text
                    x={toCanvasX(point.x)}
                    y={toCanvasY(point.y) - 15}
                    textAnchor="middle"
                    className="fill-foreground text-xs font-medium"
                  >
                    ({point.x.toFixed(1)}, {point.y.toFixed(1)})
                  </text>
                )}
              </motion.g>
            ))}
          </svg>

          {/* Controls */}
          <div className="mt-6 space-y-4">
            {/* Water Level Slider */}
            <div className="flex items-center gap-4">
              <Droplets className="w-5 h-5 text-water" />
              <span className="text-sm font-medium text-foreground w-28">Water Level:</span>
              <input
                type="range"
                min={minY + 1}
                max={maxY - 1}
                step="0.1"
                value={waterLevel}
                onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none bg-secondary cursor-pointer accent-water"
              />
              <span className="text-sm font-mono text-muted-foreground w-16">{waterLevel.toFixed(1)} m</span>
            </div>

            {/* Manning's n Slider */}
            <div className="flex items-center gap-4">
              <Waves className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground w-28">Manning's n:</span>
              <input
                type="range"
                min={0.01}
                max={0.15}
                step="0.001"
                value={manningN}
                onChange={(e) => setManningN(parseFloat(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none bg-secondary cursor-pointer accent-primary"
              />
              <span className="text-sm font-mono text-muted-foreground w-16">{manningN.toFixed(3)}</span>
            </div>

            {/* Bed Slope Slider */}
            <div className="flex items-center gap-4">
              <Mountain className="w-5 h-5 text-terrain" />
              <span className="text-sm font-medium text-foreground w-28">Bed Slope:</span>
              <input
                type="range"
                min={0.0001}
                max={0.01}
                step="0.0001"
                value={channelSlope}
                onChange={(e) => setChannelSlope(parseFloat(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none bg-secondary cursor-pointer accent-terrain"
              />
              <span className="text-sm font-mono text-muted-foreground w-20">{(channelSlope * 1000).toFixed(1)} ‰</span>
            </div>
          </div>

          {/* Manning's Equation Display */}
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-2">Manning's Equation:</p>
            <p className="text-sm font-mono text-foreground">
              V = (1/n) × R<sup>2/3</sup> × S<sup>1/2</sup> = (1/{manningN.toFixed(3)}) × {properties.hydraulicRadius.toFixed(3)}<sup>2/3</sup> × {channelSlope.toFixed(4)}<sup>1/2</sup>
            </p>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-5 border border-border shadow-lg">
            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-primary" />
              Hydraulic Properties
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Flow Area</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {properties.area.toFixed(2)} m²
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Wetted Perimeter</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {properties.wettedPerimeter.toFixed(2)} m
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Top Width</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {properties.topWidth.toFixed(2)} m
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Hydraulic Radius</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {properties.hydraulicRadius.toFixed(3)} m
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Hydraulic Depth</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {properties.hydraulicDepth.toFixed(3)} m
                </span>
              </div>
            </div>
          </div>

          {/* Flow Properties Panel */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20 shadow-lg">
            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Waves className="w-4 h-4 text-primary" />
              Flow Properties
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-primary/20">
                <span className="text-sm text-muted-foreground">Mean Velocity</span>
                <span className="text-sm font-mono font-bold text-primary">
                  {properties.velocity.toFixed(3)} m/s
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-primary/20">
                <span className="text-sm text-muted-foreground">Discharge (Q)</span>
                <span className="text-sm font-mono font-bold text-primary">
                  {properties.discharge.toFixed(3)} m³/s
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Froude Number</span>
                <span className={`text-sm font-mono font-bold ${properties.froudeNumber > 1 ? 'text-orange-500' : 'text-green-600'}`}>
                  {properties.froudeNumber.toFixed(3)} {properties.froudeNumber > 1 ? '(supercritical)' : '(subcritical)'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border shadow-lg">
            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mountain className="w-4 h-4 text-terrain" />
              Section Data
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Survey Points</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {points.length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Section Width</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {(maxX - minX).toFixed(1)} m
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Invert Level</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {Math.min(...points.map(p => p.y)).toFixed(2)} m
                </span>
              </div>
            </div>
          </div>

          {/* Velocity Legend */}
          <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
            <h4 className="text-xs font-semibold text-foreground mb-3">Velocity Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-[hsl(140,70%,35%)] rounded-full" />
                <span className="text-xs text-muted-foreground">Lower velocity (near bed/banks)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-[hsl(30,90%,50%)] rounded-full" />
                <span className="text-xs text-muted-foreground">Higher velocity (near surface)</span>
              </div>
            </div>
          </div>

          <div className="bg-water-light rounded-xl p-4 border border-water/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-water-dark flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-water-dark mb-1">Manning's Equation</p>
                <p className="text-xs text-water-dark/80">
                  Velocity vectors show the flow distribution based on Manning's equation. Adjust roughness (n) and slope to see how velocity changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
