import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Plus, Trash2, RotateCcw, MousePointer, Move } from 'lucide-react';

interface CrossSectionPoint {
  id: string;
  x: number; // chainage/offset from left (meters)
  z: number; // elevation (meters)
  isBank?: 'left' | 'right';
}

interface Props {
  onExport?: (data: string) => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDING = { top: 40, right: 60, bottom: 60, left: 80 };

// Default natural channel cross-section
const defaultPoints: CrossSectionPoint[] = [
  { id: '1', x: 0, z: 102.5 },
  { id: '2', x: 5, z: 101.8 },
  { id: '3', x: 8, z: 100.5, isBank: 'left' },
  { id: '4', x: 12, z: 99.2 },
  { id: '5', x: 18, z: 98.5 },
  { id: '6', x: 22, z: 98.8 },
  { id: '7', x: 28, z: 99.5 },
  { id: '8', x: 32, z: 100.5, isBank: 'right' },
  { id: '9', x: 36, z: 101.5 },
  { id: '10', x: 42, z: 102.2 },
];

export const IrregularCrossSectionEditor = ({ onExport }: Props) => {
  const [points, setPoints] = useState<CrossSectionPoint[]>(defaultPoints);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [waterLevel, setWaterLevel] = useState(100.0);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'select' | 'add' | 'move'>('select');
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate bounds with padding
  const xMin = Math.min(...points.map(p => p.x));
  const xMax = Math.max(...points.map(p => p.x));
  const zMin = Math.min(...points.map(p => p.z), waterLevel);
  const zMax = Math.max(...points.map(p => p.z));
  
  const xRange = xMax - xMin || 1;
  const zRange = (zMax - zMin) || 1;

  const plotWidth = CANVAS_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CANVAS_HEIGHT - PADDING.top - PADDING.bottom;

  // Coordinate transforms
  const toCanvasX = (x: number) => PADDING.left + ((x - xMin) / xRange) * plotWidth;
  const toCanvasY = (z: number) => PADDING.top + ((zMax - z) / zRange) * plotHeight;
  const toDataX = (canvasX: number) => xMin + ((canvasX - PADDING.left) / plotWidth) * xRange;
  const toDataY = (canvasY: number) => zMax - ((canvasY - PADDING.top) / plotHeight) * zRange;

  // Build terrain path
  const terrainPath = points
    .sort((a, b) => a.x - b.x)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toCanvasX(p.x)},${toCanvasY(p.z)}`)
    .join(' ');

  // Build water polygon
  const buildWaterPolygon = () => {
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    const waterPoints: { x: number; z: number }[] = [];
    
    // Find intersections with water level
    for (let i = 0; i < sortedPoints.length; i++) {
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];
      
      if (p1.z <= waterLevel) {
        waterPoints.push({ x: p1.x, z: Math.min(p1.z, waterLevel) });
      } else if (i > 0 && sortedPoints[i - 1].z <= waterLevel) {
        // Interpolate entry point
        const prev = sortedPoints[i - 1];
        const t = (waterLevel - prev.z) / (p1.z - prev.z);
        waterPoints.push({ x: prev.x + t * (p1.x - prev.x), z: waterLevel });
      }
      
      if (p2 && p1.z <= waterLevel && p2.z > waterLevel) {
        // Interpolate exit point
        const t = (waterLevel - p1.z) / (p2.z - p1.z);
        waterPoints.push({ x: p1.x + t * (p2.x - p1.x), z: waterLevel });
      }
    }
    
    if (waterPoints.length < 2) return '';
    
    // Build polygon
    const pathPoints = waterPoints.map(p => `${toCanvasX(p.x)},${toCanvasY(p.z)}`);
    const waterSurface = waterPoints.map(p => `${toCanvasX(p.x)},${toCanvasY(waterLevel)}`).reverse();
    
    return [...pathPoints, ...waterSurface].join(' ');
  };

  // Calculate hydraulic properties
  const calculateHydraulics = () => {
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    let area = 0;
    let wettedPerimeter = 0;
    let topWidth = 0;
    
    const wetPoints: { x: number; z: number }[] = [];
    
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];
      
      if (p1.z >= waterLevel && p2.z >= waterLevel) continue;
      
      let x1 = p1.x, z1 = p1.z;
      let x2 = p2.x, z2 = p2.z;
      
      // Clip to water level
      if (z1 > waterLevel) {
        const t = (waterLevel - p2.z) / (p1.z - p2.z);
        x1 = p2.x + t * (p1.x - p2.x);
        z1 = waterLevel;
      }
      if (z2 > waterLevel) {
        const t = (waterLevel - p1.z) / (p2.z - p1.z);
        x2 = p1.x + t * (p2.x - p1.x);
        z2 = waterLevel;
      }
      
      wetPoints.push({ x: x1, z: z1 }, { x: x2, z: z2 });
      
      // Trapezoidal area
      const h1 = waterLevel - z1;
      const h2 = waterLevel - z2;
      area += (h1 + h2) / 2 * (x2 - x1);
      
      // Wetted perimeter segment
      wettedPerimeter += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
    }
    
    // Calculate top width
    const wettedX = wetPoints.filter(p => p.z < waterLevel).map(p => p.x);
    if (wettedX.length > 0) {
      topWidth = Math.max(...wettedX) - Math.min(...wettedX);
    }
    
    const hydraulicRadius = wettedPerimeter > 0 ? area / wettedPerimeter : 0;
    
    return { area, wettedPerimeter, hydraulicRadius, topWidth };
  };

  const hydraulics = calculateHydraulics();

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || mode !== 'add') return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const canvasY = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    
    if (canvasX < PADDING.left || canvasX > CANVAS_WIDTH - PADDING.right) return;
    if (canvasY < PADDING.top || canvasY > CANVAS_HEIGHT - PADDING.bottom) return;
    
    const newPoint: CrossSectionPoint = {
      id: `new-${Date.now()}`,
      x: parseFloat(toDataX(canvasX).toFixed(2)),
      z: parseFloat(toDataY(canvasY).toFixed(2)),
    };
    
    setPoints(prev => [...prev, newPoint].sort((a, b) => a.x - b.x));
    setSelectedPointId(newPoint.id);
    setMode('select');
  }, [mode, xMin, xRange, zMax, zRange]);

  // Handle point drag
  const handlePointMouseDown = (pointId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'select' || mode === 'move') {
      setSelectedPointId(pointId);
      if (mode === 'move') {
        setIsDragging(true);
      }
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !selectedPointId || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const canvasY = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    
    setPoints(prev => prev.map(p => 
      p.id === selectedPointId
        ? { ...p, x: parseFloat(toDataX(canvasX).toFixed(2)), z: parseFloat(toDataY(canvasY).toFixed(2)) }
        : p
    ));
  }, [isDragging, selectedPointId, xMin, xRange, zMax, zRange]);

  const handleMouseUp = () => setIsDragging(false);

  // Delete selected point
  const deleteSelectedPoint = () => {
    if (!selectedPointId || points.length <= 3) return;
    setPoints(prev => prev.filter(p => p.id !== selectedPointId));
    setSelectedPointId(null);
  };

  // Toggle bank marker
  const toggleBank = (bank: 'left' | 'right') => {
    if (!selectedPointId) return;
    setPoints(prev => prev.map(p => {
      if (p.id === selectedPointId) {
        if (p.isBank === bank) {
          return { ...p, isBank: undefined };
        }
        return { ...p, isBank: bank };
      }
      // Remove bank marker from other points if setting new one
      if (p.isBank === bank) {
        return { ...p, isBank: undefined };
      }
      return p;
    }));
  };

  // Export to ICM CSV format
  const exportToCSV = () => {
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    const leftBank = points.find(p => p.isBank === 'left');
    const rightBank = points.find(p => p.isBank === 'right');
    
    let csv = 'Cross Section Data - ICM InfoWorks Import Format\n';
    csv += 'Chainage (m),Elevation (m),Bank Marker\n';
    
    sortedPoints.forEach(p => {
      let marker = '';
      if (p.isBank === 'left') marker = 'LEFT';
      if (p.isBank === 'right') marker = 'RIGHT';
      csv += `${p.x.toFixed(3)},${p.z.toFixed(3)},${marker}\n`;
    });
    
    csv += '\nHydraulic Properties at Water Level ' + waterLevel.toFixed(2) + 'm\n';
    csv += `Area (m²),${hydraulics.area.toFixed(3)}\n`;
    csv += `Wetted Perimeter (m),${hydraulics.wettedPerimeter.toFixed(3)}\n`;
    csv += `Hydraulic Radius (m),${hydraulics.hydraulicRadius.toFixed(3)}\n`;
    csv += `Top Width (m),${hydraulics.topWidth.toFixed(3)}\n`;
    
    if (leftBank) csv += `Left Bank Chainage,${leftBank.x.toFixed(3)}\n`;
    if (rightBank) csv += `Right Bank Chainage,${rightBank.x.toFixed(3)}\n`;
    
    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cross_section_icm.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    onExport?.(csv);
  };

  // Import from CSV (basic parsing)
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const newPoints: CrossSectionPoint[] = [];
      
      lines.forEach((line, index) => {
        const parts = line.split(',').map(s => s.trim());
        const x = parseFloat(parts[0]);
        const z = parseFloat(parts[1]);
        
        if (!isNaN(x) && !isNaN(z)) {
          let isBank: 'left' | 'right' | undefined;
          if (parts[2]?.toUpperCase().includes('LEFT')) isBank = 'left';
          if (parts[2]?.toUpperCase().includes('RIGHT')) isBank = 'right';
          
          newPoints.push({ id: `imported-${index}`, x, z, isBank });
        }
      });
      
      if (newPoints.length >= 3) {
        setPoints(newPoints.sort((a, b) => a.x - b.x));
        setSelectedPointId(null);
      }
    };
    reader.readAsText(file);
  };

  // Reset to default
  const resetPoints = () => {
    setPoints(defaultPoints);
    setSelectedPointId(null);
    setWaterLevel(100.0);
  };

  const selectedPoint = points.find(p => p.id === selectedPointId);

  // Generate axis ticks
  const xTicks = Array.from({ length: 6 }, (_, i) => xMin + (xRange / 5) * i);
  const zTicks = Array.from({ length: 5 }, (_, i) => zMin + (zRange / 4) * i);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-secondary/50 rounded-lg">
        <div className="flex gap-1 border-r border-border pr-3 mr-2">
          <button
            onClick={() => setMode('select')}
            className={`p-2 rounded-md transition-colors ${mode === 'select' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            title="Select point"
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode('add')}
            className={`p-2 rounded-md transition-colors ${mode === 'add' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            title="Add point"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode('move')}
            className={`p-2 rounded-md transition-colors ${mode === 'move' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            title="Move point"
          >
            <Move className="w-4 h-4" />
          </button>
        </div>
        
        <button
          onClick={deleteSelectedPoint}
          disabled={!selectedPointId || points.length <= 3}
          className="p-2 rounded-md hover:bg-destructive/10 text-destructive disabled:opacity-40 disabled:cursor-not-allowed"
          title="Delete selected point"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={resetPoints}
          className="p-2 rounded-md hover:bg-muted"
          title="Reset to default"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        <div className="flex-1" />
        
        <label className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted cursor-pointer hover:bg-muted/80">
          <Upload className="w-4 h-4" />
          <span className="text-sm">Import CSV</span>
          <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
        </label>
        
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export ICM CSV</span>
        </button>
      </div>

      {/* Main editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className={`w-full h-auto ${mode === 'add' ? 'cursor-crosshair' : mode === 'move' ? 'cursor-move' : 'cursor-default'}`}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <linearGradient id="irregularWaterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(195, 90%, 55%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(210, 85%, 45%)" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="irregularTerrainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(35, 45%, 55%)" />
                <stop offset="100%" stopColor="hsl(35, 35%, 35%)" />
              </linearGradient>
            </defs>

            {/* Background */}
            <rect x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="hsl(200, 30%, 98%)" />

            {/* Grid */}
            <g opacity="0.2">
              {xTicks.map((x, i) => (
                <line key={`x${i}`} x1={toCanvasX(x)} y1={PADDING.top} x2={toCanvasX(x)} y2={CANVAS_HEIGHT - PADDING.bottom}
                  stroke="hsl(210, 15%, 70%)" strokeWidth="0.5" />
              ))}
              {zTicks.map((z, i) => (
                <line key={`z${i}`} x1={PADDING.left} y1={toCanvasY(z)} x2={CANVAS_WIDTH - PADDING.right} y2={toCanvasY(z)}
                  stroke="hsl(210, 15%, 70%)" strokeWidth="0.5" />
              ))}
            </g>

            {/* Axis labels */}
            <g className="text-[10px]" fill="hsl(210, 15%, 40%)">
              {xTicks.map((x, i) => (
                <text key={`xl${i}`} x={toCanvasX(x)} y={CANVAS_HEIGHT - PADDING.bottom + 18} textAnchor="middle" className="font-mono">
                  {x.toFixed(1)}
                </text>
              ))}
              {zTicks.map((z, i) => (
                <text key={`zl${i}`} x={PADDING.left - 10} y={toCanvasY(z) + 4} textAnchor="end" className="font-mono">
                  {z.toFixed(1)}
                </text>
              ))}
              <text x={CANVAS_WIDTH / 2} y={CANVAS_HEIGHT - 10} textAnchor="middle" className="text-xs">
                Chainage (m)
              </text>
              <text x={15} y={CANVAS_HEIGHT / 2} textAnchor="middle" className="text-xs" transform={`rotate(-90, 15, ${CANVAS_HEIGHT / 2})`}>
                Elevation (m)
              </text>
            </g>

            {/* Terrain fill */}
            <path
              d={`${terrainPath} L ${toCanvasX(xMax)},${CANVAS_HEIGHT - PADDING.bottom} L ${toCanvasX(xMin)},${CANVAS_HEIGHT - PADDING.bottom} Z`}
              fill="url(#irregularTerrainGradient)"
              opacity="0.7"
            />

            {/* Water polygon */}
            {waterLevel > zMin && (
              <polygon
                points={buildWaterPolygon()}
                fill="url(#irregularWaterGradient)"
              />
            )}

            {/* Terrain line */}
            <path
              d={terrainPath}
              fill="none"
              stroke="hsl(35, 35%, 30%)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Water level line */}
            <line
              x1={PADDING.left}
              y1={toCanvasY(waterLevel)}
              x2={CANVAS_WIDTH - PADDING.right}
              y2={toCanvasY(waterLevel)}
              stroke="hsl(195, 90%, 45%)"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* Points */}
            {points.map((point) => (
              <g key={point.id}>
                <motion.circle
                  cx={toCanvasX(point.x)}
                  cy={toCanvasY(point.z)}
                  r={selectedPointId === point.id ? 8 : 6}
                  fill={point.isBank ? 'hsl(280, 65%, 55%)' : 'hsl(210, 80%, 55%)'}
                  stroke="white"
                  strokeWidth="2"
                  style={{ cursor: mode !== 'add' ? 'pointer' : undefined }}
                  onMouseDown={(e) => handlePointMouseDown(point.id, e)}
                  animate={{ scale: selectedPointId === point.id ? 1.2 : 1 }}
                />
                {point.isBank && (
                  <text
                    x={toCanvasX(point.x)}
                    y={toCanvasY(point.z) - 12}
                    textAnchor="middle"
                    className="text-[10px] font-bold"
                    fill="hsl(280, 65%, 45%)"
                  >
                    {point.isBank === 'left' ? 'LB' : 'RB'}
                  </text>
                )}
              </g>
            ))}

            {/* Title */}
            <text x={CANVAS_WIDTH / 2} y={24} textAnchor="middle" className="text-sm font-semibold" fill="hsl(210, 15%, 30%)">
              Irregular Cross-Section Editor
            </text>
          </svg>
        </div>

        {/* Properties panel */}
        <div className="space-y-4">
          {/* Water level control */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h4 className="text-sm font-semibold mb-3 text-foreground">Water Level</h4>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">Elevation</span>
              <span className="text-sm font-mono text-water">{waterLevel.toFixed(2)}m</span>
            </div>
            <input
              type="range"
              min={zMin - 0.5}
              max={zMax + 0.5}
              step={0.05}
              value={waterLevel}
              onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none bg-secondary cursor-pointer accent-water"
            />
          </div>

          {/* Selected point editor */}
          {selectedPoint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg border border-border p-4"
            >
              <h4 className="text-sm font-semibold mb-3 text-foreground">Selected Point</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Chainage (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedPoint.x}
                    onChange={(e) => setPoints(prev => prev.map(p =>
                      p.id === selectedPointId ? { ...p, x: parseFloat(e.target.value) || 0 } : p
                    ))}
                    className="w-full mt-1 px-2 py-1.5 rounded border border-border bg-background text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Elevation (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedPoint.z}
                    onChange={(e) => setPoints(prev => prev.map(p =>
                      p.id === selectedPointId ? { ...p, z: parseFloat(e.target.value) || 0 } : p
                    ))}
                    className="w-full mt-1 px-2 py-1.5 rounded border border-border bg-background text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Bank Marker</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleBank('left')}
                      className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        selectedPoint.isBank === 'left'
                          ? 'bg-[hsl(280,65%,55%)] text-white'
                          : 'bg-secondary hover:bg-muted'
                      }`}
                    >
                      Left Bank
                    </button>
                    <button
                      onClick={() => toggleBank('right')}
                      className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        selectedPoint.isBank === 'right'
                          ? 'bg-[hsl(280,65%,55%)] text-white'
                          : 'bg-secondary hover:bg-muted'
                      }`}
                    >
                      Right Bank
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hydraulic results */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h4 className="text-sm font-semibold mb-3 text-foreground">Hydraulic Properties</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Area</span>
                <span className="font-mono">{hydraulics.area.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wetted P</span>
                <span className="font-mono">{hydraulics.wettedPerimeter.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hyd. Radius</span>
                <span className="font-mono">{hydraulics.hydraulicRadius.toFixed(3)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Top Width</span>
                <span className="font-mono">{hydraulics.topWidth.toFixed(2)} m</span>
              </div>
            </div>
          </div>

          {/* Point count */}
          <div className="text-center text-xs text-muted-foreground">
            {points.length} points defined
          </div>
        </div>
      </div>
    </div>
  );
};
