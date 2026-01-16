import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Circle, Square, Triangle, Hexagon, PenTool, Waves, ArrowDown, Database } from 'lucide-react';

interface ChannelTypeCardProps {
  title: string;
  icon: React.ReactNode;
  formula?: string;
  description: string;
  geometryParams: { name: string; symbol: string; description: string }[];
  typicalN: { min: number; max: number; typical: number };
  color: 'water' | 'primary' | 'terrain' | 'warning';
  visualComponent: React.ReactNode;
}

const ChannelTypeCard = ({ title, icon, formula, description, geometryParams, typicalN, color, visualComponent }: ChannelTypeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorClasses = {
    water: 'bg-water/10 border-water/30 hover:border-water/50',
    primary: 'bg-primary/10 border-primary/30 hover:border-primary/50',
    terrain: 'bg-terrain/10 border-terrain/30 hover:border-terrain/50',
    warning: 'bg-orange-50 border-orange-300/50 hover:border-orange-400/60 dark:bg-orange-950/20',
  };

  return (
    <motion.div
      className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${colorClasses[color]}`}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.01 }}
      layout
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-white shadow-sm text-${color === 'warning' ? 'orange-500' : color}`}>
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            {formula && <p className="text-xs font-mono text-muted-foreground mt-0.5">{formula}</p>}
          </div>
        </div>
        <button className="p-1 rounded-full hover:bg-white/50 transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
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
            <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
              <div className="bg-secondary/50 rounded-lg p-3">
                {visualComponent}
              </div>
              
              <p className="text-sm text-muted-foreground">{description}</p>
              
              <div>
                <h5 className="text-xs font-semibold text-foreground mb-2">Geometry Parameters:</h5>
                <div className="grid grid-cols-1 gap-1.5">
                  {geometryParams.map((param, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded min-w-[40px] text-center">{param.symbol}</span>
                      <span className="font-medium text-foreground">{param.name}:</span>
                      <span className="text-muted-foreground">{param.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-3">
                <h5 className="text-xs font-semibold text-foreground mb-2">Typical Manning's n:</h5>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">Range: {typicalN.min} - {typicalN.max}</span>
                  <span className="font-medium text-primary">Typical: {typicalN.typical}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// SVG Visualizations for each channel type
const RectangularVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-16">
    <rect x="50" y="20" width="100" height="50" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="50" y1="70" x2="50" y2="75" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    <line x1="150" y1="70" x2="150" y2="75" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    <line x1="50" y1="75" x2="150" y2="75" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    <text x="100" y="78" textAnchor="middle" className="text-[8px]" fill="hsl(210, 15%, 50%)">b (width)</text>
    <line x1="155" y1="20" x2="160" y2="20" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    <line x1="155" y1="70" x2="160" y2="70" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    <line x1="160" y1="20" x2="160" y2="70" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    <text x="170" y="48" textAnchor="start" className="text-[8px]" fill="hsl(210, 15%, 50%)">y</text>
  </svg>
);

const TrapezoidalVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-16">
    <polygon points="30,70 60,20 140,20 170,70" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="60" y1="20" x2="140" y2="20" stroke="hsl(30, 90%, 50%)" strokeWidth="1.5" strokeDasharray="3 2" />
    <text x="100" y="15" textAnchor="middle" className="text-[8px]" fill="hsl(30, 90%, 45%)">b (bottom)</text>
    <line x1="30" y1="75" x2="170" y2="75" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    <text x="100" y="78" textAnchor="middle" className="text-[8px]" fill="hsl(210, 15%, 50%)">B (top)</text>
    <text x="38" y="50" textAnchor="middle" className="text-[7px]" fill="hsl(210, 15%, 50%)">z:1</text>
  </svg>
);

const TriangularVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-16">
    <polygon points="100,70 40,20 160,20" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="100" y1="70" x2="100" y2="20" stroke="hsl(30, 90%, 50%)" strokeWidth="1" strokeDasharray="3 2" />
    <text x="105" y="48" textAnchor="start" className="text-[8px]" fill="hsl(30, 90%, 45%)">y</text>
    <text x="60" y="50" textAnchor="middle" className="text-[7px]" fill="hsl(210, 15%, 50%)">z₁:1</text>
    <text x="140" y="50" textAnchor="middle" className="text-[7px]" fill="hsl(210, 15%, 50%)">z₂:1</text>
  </svg>
);

const ParabolicVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-16">
    <path d="M 40,20 Q 100,90 160,20" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="40" y1="20" x2="160" y2="20" stroke="hsl(30, 90%, 50%)" strokeWidth="1.5" strokeDasharray="3 2" />
    <text x="100" y="15" textAnchor="middle" className="text-[8px]" fill="hsl(30, 90%, 45%)">T (top width)</text>
    <line x1="100" y1="20" x2="100" y2="68" stroke="hsl(220, 10%, 40%)" strokeWidth="1" strokeDasharray="2 2" />
    <text x="110" y="50" textAnchor="start" className="text-[8px]" fill="hsl(210, 15%, 50%)">y_full</text>
  </svg>
);

const CircularVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-16">
    <circle cx="100" cy="40" r="30" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="100" y1="40" x2="130" y2="40" stroke="hsl(30, 90%, 50%)" strokeWidth="1.5" />
    <text x="115" y="35" textAnchor="middle" className="text-[8px]" fill="hsl(30, 90%, 45%)">D/2</text>
  </svg>
);

const IrregularVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-16">
    <polyline points="20,30 40,50 60,55 80,40 100,60 120,55 140,45 160,50 180,35" fill="none" stroke="hsl(35, 35%, 40%)" strokeWidth="2" />
    <path d="M 20,30 L 40,50 L 60,55 L 80,40 L 100,60 L 120,55 L 140,45 L 160,50 L 180,35 L 180,25 L 20,25 Z" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" />
    <line x1="20" y1="25" x2="180" y2="25" stroke="hsl(195, 90%, 55%)" strokeWidth="1.5" />
    {[20, 60, 100, 140, 180].map((x, i) => (
      <circle key={i} cx={x} cy={[30, 55, 60, 45, 35][i]} r="3" fill="hsl(30, 90%, 50%)" />
    ))}
    <text x="100" y="75" textAnchor="middle" className="text-[8px]" fill="hsl(210, 15%, 50%)">Station-Elevation Points</text>
  </svg>
);

const TransectExampleCode = () => (
  <div className="bg-slate-900 rounded-lg p-3 font-mono text-[10px] text-slate-300 overflow-x-auto">
    <div className="text-slate-500">;; SWMM5 Transect Format Example</div>
    <div className="text-cyan-400">NC 0.035 0.050 0.035</div>
    <div className="text-slate-500">;; Left n, Channel n, Right n</div>
    <div className="text-yellow-400">X1 RIVER_XS1 3 100.0 0 0 0 0 0</div>
    <div className="text-slate-500">;; Stations, Max depth, banks, factors</div>
    <div className="text-green-400">GR 102.5 0.0</div>
    <div className="text-green-400">GR 100.0 10.0</div>
    <div className="text-green-400">GR 98.5 15.0</div>
    <div className="text-green-400">GR 97.0 20.0</div>
    <div className="text-green-400">GR 96.5 25.0</div>
    <div className="text-green-400">GR 97.0 30.0</div>
    <div className="text-green-400">GR 100.0 40.0</div>
    <div className="text-green-400">GR 103.0 50.0</div>
  </div>
);

export const SWMM5ChannelsSection = () => {
  const [showTransectGuide, setShowTransectGuide] = useState(false);

  const channelTypes: ChannelTypeCardProps[] = [
    {
      title: 'Rectangular Open Channel',
      icon: <Square className="w-5 h-5" />,
      formula: 'A = b × y',
      description: 'Simple rectangular cross-section defined by bottom width. Common for engineered channels and lined drains.',
      geometryParams: [
        { name: 'Geom1', symbol: 'b', description: 'Bottom width (m or ft)' },
        { name: 'Geom2', symbol: '-', description: 'Not used' },
      ],
      typicalN: { min: 0.011, max: 0.030, typical: 0.015 },
      color: 'primary',
      visualComponent: <RectangularVisual />,
    },
    {
      title: 'Trapezoidal Channel',
      icon: <Hexagon className="w-5 h-5" />,
      formula: 'A = (b + z×y) × y',
      description: 'Trapezoidal section with sloped side walls. The most common natural channel approximation in SWMM.',
      geometryParams: [
        { name: 'Geom1', symbol: 'y_full', description: 'Maximum depth (m)' },
        { name: 'Geom2', symbol: 'b', description: 'Bottom width (m)' },
        { name: 'Geom3', symbol: 'z', description: 'Side slope (H:V)' },
      ],
      typicalN: { min: 0.020, max: 0.050, typical: 0.035 },
      color: 'terrain',
      visualComponent: <TrapezoidalVisual />,
    },
    {
      title: 'Triangular Channel',
      icon: <Triangle className="w-5 h-5" />,
      formula: 'A = z × y²',
      description: 'V-shaped channel with no flat bottom. Used for roadside ditches and small drainage swales.',
      geometryParams: [
        { name: 'Geom1', symbol: 'y_full', description: 'Maximum depth (m)' },
        { name: 'Geom2', symbol: 'z', description: 'Side slope (H:V)' },
      ],
      typicalN: { min: 0.020, max: 0.060, typical: 0.030 },
      color: 'water',
      visualComponent: <TriangularVisual />,
    },
    {
      title: 'Parabolic Channel',
      icon: <Waves className="w-5 h-5" />,
      formula: 'A = (2/3) × T × y',
      description: 'Curved cross-section approximating natural streams. Defined by top width at maximum depth.',
      geometryParams: [
        { name: 'Geom1', symbol: 'y_full', description: 'Maximum depth (m)' },
        { name: 'Geom2', symbol: 'T', description: 'Top width at full depth (m)' },
      ],
      typicalN: { min: 0.025, max: 0.070, typical: 0.040 },
      color: 'primary',
      visualComponent: <ParabolicVisual />,
    },
    {
      title: 'Circular (Open)',
      icon: <Circle className="w-5 h-5" />,
      formula: 'A = (D²/8)(θ - sin θ)',
      description: 'Circular section for open channel flow (not pressurized). Used for large culverts flowing partially full.',
      geometryParams: [
        { name: 'Geom1', symbol: 'D', description: 'Full diameter (m)' },
      ],
      typicalN: { min: 0.010, max: 0.025, typical: 0.013 },
      color: 'water',
      visualComponent: <CircularVisual />,
    },
    {
      title: 'Irregular (Transect)',
      icon: <PenTool className="w-5 h-5" />,
      formula: 'A = Σ trapezoids',
      description: 'Natural channel defined by station-elevation pairs. Uses HEC-2 style transect data for detailed geometry.',
      geometryParams: [
        { name: 'Stations', symbol: 'X', description: 'Horizontal distance points' },
        { name: 'Elevations', symbol: 'Y', description: 'Bed elevation at each station' },
        { name: 'Banks', symbol: 'L/R', description: 'Left/right bank station markers' },
      ],
      typicalN: { min: 0.025, max: 0.150, typical: 0.045 },
      color: 'terrain',
      visualComponent: <IrregularVisual />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">SWMM5 Open Channel Types</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Standard open channel cross-section shapes available in EPA SWMM5 and ICM SWMM for surface drainage and river modeling.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channelTypes.map((type, i) => (
          <ChannelTypeCard key={i} {...type} />
        ))}
      </div>

      {/* Transect Guide Section */}
      <motion.div 
        className="bg-card border border-border rounded-xl overflow-hidden"
        layout
      >
        <button
          onClick={() => setShowTransectGuide(!showTransectGuide)}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Database className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-foreground">SWMM5 Transect Data Format</h4>
              <p className="text-xs text-muted-foreground">HEC-2 style irregular cross-section input</p>
            </div>
          </div>
          {showTransectGuide ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>
        
        <AnimatePresence>
          {showTransectGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold text-foreground">Transect Record Types</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex gap-2">
                        <span className="font-mono bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 px-2 py-0.5 rounded">NC</span>
                        <span className="text-muted-foreground">Manning's n values (left, channel, right)</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-mono bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-0.5 rounded">X1</span>
                        <span className="text-muted-foreground">Transect header (name, stations, modifiers)</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-mono bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded">GR</span>
                        <span className="text-muted-foreground">Station-elevation coordinate pairs</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <h5 className="text-sm font-semibold text-foreground mb-2">X1 Line Parameters</h5>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• <strong>Name:</strong> Transect identifier</li>
                        <li>• <strong>Nsta:</strong> Number of stations</li>
                        <li>• <strong>Xleft:</strong> Left bank station</li>
                        <li>• <strong>Xright:</strong> Right bank station</li>
                        <li>• <strong>Lfactor:</strong> Channel meander modifier</li>
                        <li>• <strong>Wfactor:</strong> Station spacing factor</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-semibold text-foreground mb-2">Example Transect</h5>
                    <TransectExampleCode />
                  </div>
                </div>
                
                <div className="bg-secondary/30 rounded-lg p-3">
                  <h5 className="text-sm font-semibold text-foreground mb-2">ICM SWMM vs EPA SWMM</h5>
                  <p className="text-xs text-muted-foreground">
                    ICM SWMM supports the standard SWMM5 transect format but also allows direct import from HEC-RAS geometry 
                    and provides graphical editing tools. Transects can be auto-generated from GIS cross-section lines and DEMs.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
