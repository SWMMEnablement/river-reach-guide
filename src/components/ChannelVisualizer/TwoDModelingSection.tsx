import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Grid3X3, Layers, Waves, Mountain, Droplets, ArrowLeftRight, Box, Hexagon, Triangle, Square } from 'lucide-react';

interface TwoDTypeCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
  applications: string[];
  parameters: { name: string; description: string }[];
  color: 'water' | 'primary' | 'terrain' | 'warning';
  platform: 'infoworks' | 'swmm' | 'both';
  visualComponent?: React.ReactNode;
}

const TwoDTypeCard = ({ title, subtitle, icon, description, applications, parameters, color, platform, visualComponent }: TwoDTypeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorClasses = {
    water: 'bg-water/10 border-water/30 hover:border-water/50',
    primary: 'bg-primary/10 border-primary/30 hover:border-primary/50',
    terrain: 'bg-terrain/10 border-terrain/30 hover:border-terrain/50',
    warning: 'bg-orange-50 border-orange-300/50 hover:border-orange-400/60 dark:bg-orange-950/20',
  };

  const platformBadge = {
    infoworks: { label: 'ICM InfoWorks', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    swmm: { label: 'ICM SWMM', bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    both: { label: 'Both Platforms', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  };

  return (
    <motion.div
      className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${colorClasses[color]}`}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.01 }}
      layout
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg bg-white shadow-sm text-${color === 'warning' ? 'orange-500' : color}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{title}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${platformBadge[platform].bg}`}>
                {platformBadge[platform].label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>
        <button className="p-1 rounded-full hover:bg-white/50 transition-colors flex-shrink-0">
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
              {visualComponent && <div className="mb-4">{visualComponent}</div>}
              
              <p className="text-sm text-muted-foreground">{description}</p>
              
              <div>
                <h5 className="text-xs font-semibold text-foreground mb-2">Applications:</h5>
                <ul className="space-y-1">
                  {applications.map((app, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {app}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-xs font-semibold text-foreground mb-2">Key Parameters:</h5>
                <div className="grid grid-cols-1 gap-1.5">
                  {parameters.map((param, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{param.name}</span>
                      <span className="text-muted-foreground">{param.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 2D Zone Visual
const TwoDZoneVisual = () => (
  <svg viewBox="0 0 280 100" className="w-full h-24 bg-secondary/30 rounded-lg">
    {/* Triangular mesh */}
    <polygon points="20,80 50,80 35,50" fill="none" stroke="hsl(195, 90%, 55%)" strokeWidth="1" opacity="0.5" />
    <polygon points="50,80 80,80 65,50" fill="none" stroke="hsl(195, 90%, 55%)" strokeWidth="1" opacity="0.5" />
    <polygon points="35,50 65,50 50,25" fill="hsl(195, 90%, 55%)" fillOpacity="0.2" stroke="hsl(195, 90%, 55%)" strokeWidth="1" />
    <polygon points="35,50 50,80 65,50" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(195, 90%, 55%)" strokeWidth="1" />
    
    {/* Arrow */}
    <line x1="95" y1="50" x2="115" y2="50" stroke="hsl(210, 15%, 60%)" strokeWidth="2" markerEnd="url(#meshArrow)" />
    
    {/* Rectangular mesh */}
    <rect x="130" y="20" width="25" height="25" fill="hsl(140, 60%, 45%)" fillOpacity="0.2" stroke="hsl(140, 60%, 45%)" strokeWidth="1" />
    <rect x="155" y="20" width="25" height="25" fill="hsl(140, 60%, 45%)" fillOpacity="0.3" stroke="hsl(140, 60%, 45%)" strokeWidth="1" />
    <rect x="130" y="45" width="25" height="25" fill="hsl(140, 60%, 45%)" fillOpacity="0.3" stroke="hsl(140, 60%, 45%)" strokeWidth="1" />
    <rect x="155" y="45" width="25" height="25" fill="hsl(140, 60%, 45%)" fillOpacity="0.2" stroke="hsl(140, 60%, 45%)" strokeWidth="1" />
    
    {/* Arrow */}
    <line x1="195" y1="50" x2="215" y2="50" stroke="hsl(210, 15%, 60%)" strokeWidth="2" markerEnd="url(#meshArrow)" />
    
    {/* Hexagonal mesh */}
    <polygon points="240,25 255,20 265,30 260,45 245,50 235,40" fill="hsl(280, 60%, 55%)" fillOpacity="0.2" stroke="hsl(280, 60%, 55%)" strokeWidth="1" />
    <polygon points="245,50 260,45 270,55 265,70 250,75 240,65" fill="hsl(280, 60%, 55%)" fillOpacity="0.3" stroke="hsl(280, 60%, 55%)" strokeWidth="1" />
    
    <text x="50" y="95" textAnchor="middle" className="text-[8px]" fill="hsl(195, 90%, 45%)">Triangular</text>
    <text x="155" y="95" textAnchor="middle" className="text-[8px]" fill="hsl(140, 60%, 40%)">Rectangular</text>
    <text x="250" y="95" textAnchor="middle" className="text-[8px]" fill="hsl(280, 60%, 50%)">Flexible</text>
    
    <defs>
      <marker id="meshArrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
        <polygon points="0 0, 6 2, 0 4" fill="hsl(210, 15%, 60%)" />
      </marker>
    </defs>
  </svg>
);

// Inline Bank Visual
const InlineBankVisual = () => (
  <svg viewBox="0 0 280 80" className="w-full h-20 bg-secondary/30 rounded-lg">
    {/* 1D Channel */}
    <line x1="20" y1="40" x2="260" y2="40" stroke="hsl(195, 90%, 55%)" strokeWidth="3" />
    
    {/* Inline banks (perpendicular lines) */}
    {[60, 100, 140, 180, 220].map((x, i) => (
      <g key={i}>
        <line x1={x} y1="25" x2={x} y2="55" stroke="hsl(35, 70%, 50%)" strokeWidth="2" />
        <circle cx={x} cy="40" r="3" fill="hsl(35, 70%, 50%)" />
      </g>
    ))}
    
    {/* 2D Zones */}
    <rect x="50" y="58" width="70" height="15" fill="hsl(195, 90%, 55%)" fillOpacity="0.2" stroke="hsl(195, 90%, 55%)" strokeWidth="1" strokeDasharray="3 2" />
    <rect x="160" y="58" width="70" height="15" fill="hsl(195, 90%, 55%)" fillOpacity="0.2" stroke="hsl(195, 90%, 55%)" strokeWidth="1" strokeDasharray="3 2" />
    
    <rect x="50" y="12" width="70" height="12" fill="hsl(195, 90%, 55%)" fillOpacity="0.2" stroke="hsl(195, 90%, 55%)" strokeWidth="1" strokeDasharray="3 2" />
    <rect x="160" y="12" width="70" height="12" fill="hsl(195, 90%, 55%)" fillOpacity="0.2" stroke="hsl(195, 90%, 55%)" strokeWidth="1" strokeDasharray="3 2" />
    
    <text x="140" y="10" textAnchor="middle" className="text-[8px]" fill="hsl(195, 90%, 45%)">2D Floodplain</text>
    <text x="140" y="78" textAnchor="middle" className="text-[8px]" fill="hsl(35, 70%, 45%)">Inline Banks</text>
  </svg>
);

// Lateral Spill Visual
const LateralSpillVisual = () => (
  <svg viewBox="0 0 280 80" className="w-full h-20 bg-secondary/30 rounded-lg">
    {/* 1D Channel */}
    <rect x="100" y="30" width="80" height="20" fill="hsl(195, 90%, 55%)" fillOpacity="0.4" stroke="hsl(195, 90%, 55%)" strokeWidth="2" />
    
    {/* Spill arrows left */}
    <path d="M 95,40 L 40,25" stroke="hsl(30, 90%, 50%)" strokeWidth="2" markerEnd="url(#spillArrow)" />
    <path d="M 95,40 L 40,55" stroke="hsl(30, 90%, 50%)" strokeWidth="2" markerEnd="url(#spillArrow)" />
    
    {/* Spill arrows right */}
    <path d="M 185,40 L 240,25" stroke="hsl(30, 90%, 50%)" strokeWidth="2" markerEnd="url(#spillArrow)" />
    <path d="M 185,40 L 240,55" stroke="hsl(30, 90%, 50%)" strokeWidth="2" markerEnd="url(#spillArrow)" />
    
    {/* 2D zones */}
    <rect x="20" y="15" width="50" height="50" fill="hsl(195, 90%, 55%)" fillOpacity="0.15" stroke="hsl(195, 90%, 55%)" strokeWidth="1" strokeDasharray="4 2" />
    <rect x="210" y="15" width="50" height="50" fill="hsl(195, 90%, 55%)" fillOpacity="0.15" stroke="hsl(195, 90%, 55%)" strokeWidth="1" strokeDasharray="4 2" />
    
    <text x="140" y="75" textAnchor="middle" className="text-[8px]" fill="hsl(195, 90%, 45%)">1D Channel</text>
    <text x="45" y="75" textAnchor="middle" className="text-[7px]" fill="hsl(30, 90%, 45%)">Lateral Spill</text>
    <text x="235" y="75" textAnchor="middle" className="text-[7px]" fill="hsl(30, 90%, 45%)">Lateral Spill</text>
    
    <defs>
      <marker id="spillArrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
        <polygon points="0 0, 6 2, 0 4" fill="hsl(30, 90%, 50%)" />
      </marker>
    </defs>
  </svg>
);

export const TwoDModelingSection = () => {
  const twoDTypes: TwoDTypeCardProps[] = [
    {
      title: '2D Zone',
      subtitle: 'Triangular/Flexible Mesh Area',
      icon: <Grid3X3 className="w-5 h-5" />,
      description: 'Defines a 2D computational domain using triangular mesh elements. The mesh is auto-generated based on terrain data and mesh density parameters.',
      applications: [
        'Floodplain inundation mapping',
        'Urban surface flooding',
        'Coastal and tidal modeling',
        'Complex flow paths with multiple channels',
      ],
      parameters: [
        { name: 'mesh_size', description: 'Target element size (m)' },
        { name: 'roughness', description: '2D Manning\'s n or roughness zones' },
        { name: 'ground_model', description: 'DEM/TIN source for elevations' },
        { name: 'initial_wl', description: 'Initial water level (m)' },
      ],
      color: 'water',
      platform: 'infoworks',
      visualComponent: <TwoDZoneVisual />,
    },
    {
      title: 'Inline Bank',
      subtitle: '1D/2D Coupling Line',
      icon: <ArrowLeftRight className="w-5 h-5" />,
      description: 'Creates a coupling interface between 1D river channels and 2D floodplain zones. Water exchanges laterally when levels exceed bank crest.',
      applications: [
        'River overtopping onto floodplains',
        'Embankment and levee representation',
        'Controlled spill structures',
        'Natural bank overflow',
      ],
      parameters: [
        { name: 'crest_level', description: 'Bank top elevation (m)' },
        { name: 'weir_coeff', description: 'Discharge coefficient (typ. 1.7)' },
        { name: 'bank_slope', description: 'Side slope representation' },
        { name: 'modular_limit', description: 'Submergence threshold' },
      ],
      color: 'terrain',
      platform: 'infoworks',
      visualComponent: <InlineBankVisual />,
    },
    {
      title: 'Lateral Spill',
      subtitle: 'Side Weir Connection',
      icon: <Droplets className="w-5 h-5" />,
      description: 'Connects 1D elements to 2D zones via lateral weir flow. Allows water to spill from channels when exceeding specified crest elevations.',
      applications: [
        'Channel bank overflow',
        'Flood relief spillways',
        'Distribution channel outflows',
        'Emergency overflow structures',
      ],
      parameters: [
        { name: 'spill_level', description: 'Weir crest elevation (m)' },
        { name: 'spill_coeff', description: 'Weir coefficient' },
        { name: 'length', description: 'Spill crest length (m)' },
        { name: 'approach_depth', description: 'Approach channel depth' },
      ],
      color: 'primary',
      platform: 'infoworks',
      visualComponent: <LateralSpillVisual />,
    },
    {
      title: '2D Mesh Zone (SWMM)',
      subtitle: 'Rectangular/Triangular Grid',
      icon: <Box className="w-5 h-5" />,
      description: 'ICM SWMM supports 2D surface modeling with rectangular or triangular mesh options. Integrates with drainage network for coupled analysis.',
      applications: [
        'Urban stormwater ponding',
        'Surface-to-pipe interaction',
        'Parking lot flooding',
        'Green infrastructure performance',
      ],
      parameters: [
        { name: 'cell_size', description: 'Mesh cell dimension (m)' },
        { name: 'mannings_n', description: 'Surface roughness' },
        { name: 'depression', description: 'Depression storage (mm)' },
        { name: 'infiltration', description: 'Infiltration parameters' },
      ],
      color: 'water',
      platform: 'swmm',
    },
    {
      title: 'Breach',
      subtitle: 'Dynamic Breach Formation',
      icon: <Mountain className="w-5 h-5" />,
      description: 'Models embankment or dam breach development over time. Breach grows based on erosion equations or user-defined progression.',
      applications: [
        'Dam failure scenarios',
        'Levee breach modeling',
        'Flood defense failure analysis',
        'Emergency planning studies',
      ],
      parameters: [
        { name: 'breach_width', description: 'Initial/final width (m)' },
        { name: 'breach_time', description: 'Formation duration (hrs)' },
        { name: 'breach_level', description: 'Final invert elevation (m)' },
        { name: 'failure_mode', description: 'Overtopping/piping/user' },
      ],
      color: 'warning',
      platform: 'both',
    },
    {
      title: 'Porous Wall',
      subtitle: 'Permeable Boundary',
      icon: <Layers className="w-5 h-5" />,
      description: 'Represents partially permeable structures within 2D domains. Controls flow through walls, fences, or vegetation barriers.',
      applications: [
        'Fence/hedge flow obstruction',
        'Permeable flood barriers',
        'Debris screens and trash racks',
        'Building clusters representation',
      ],
      parameters: [
        { name: 'porosity', description: 'Open area ratio (0-1)' },
        { name: 'head_loss', description: 'Loss coefficient' },
        { name: 'crest_level', description: 'Wall crest elevation (m)' },
        { name: 'orientation', description: 'Flow direction constraint' },
      ],
      color: 'terrain',
      platform: 'infoworks',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">2D Modeling Elements</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          ICM InfoWorks and ICM SWMM 2D modeling capabilities for floodplain analysis, urban flooding, and coupled 1D/2D simulations.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {twoDTypes.map((type, i) => (
          <TwoDTypeCard key={i} {...type} />
        ))}
      </div>
    </div>
  );
};
