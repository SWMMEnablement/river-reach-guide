import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Droplets, Layers, TreePine, Filter, ArrowDown, Waves, Box, CircleDot } from 'lucide-react';

interface SuDSCardProps {
  title: string;
  category: 'storage' | 'conveyance' | 'infiltration' | 'treatment';
  icon: React.ReactNode;
  description: string;
  icmFeatures: string[];
  keyParameters: { name: string; description: string }[];
  visualComponent?: React.ReactNode;
}

const SuDSCard = ({ title, category, icon, description, icmFeatures, keyParameters, visualComponent }: SuDSCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryColors = {
    storage: 'bg-blue-50 border-blue-300/50 hover:border-blue-400/60 dark:bg-blue-950/20',
    conveyance: 'bg-cyan-50 border-cyan-300/50 hover:border-cyan-400/60 dark:bg-cyan-950/20',
    infiltration: 'bg-green-50 border-green-300/50 hover:border-green-400/60 dark:bg-green-950/20',
    treatment: 'bg-purple-50 border-purple-300/50 hover:border-purple-400/60 dark:bg-purple-950/20',
  };

  const categoryBadge = {
    storage: { label: 'Storage', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    conveyance: { label: 'Conveyance', bg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    infiltration: { label: 'Infiltration', bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    treatment: { label: 'Treatment', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  };

  return (
    <motion.div
      className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${categoryColors[category]}`}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.01 }}
      layout
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-white shadow-sm text-primary">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{title}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryBadge[category].bg}`}>
                {categoryBadge[category].label}
              </span>
            </div>
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
                <h5 className="text-xs font-semibold text-foreground mb-2">Autodesk InfoWorks ICM Features:</h5>
                <ul className="space-y-1">
                  {icmFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-xs font-semibold text-foreground mb-2">Key Parameters:</h5>
                <div className="grid grid-cols-1 gap-1.5">
                  {keyParameters.map((param, i) => (
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

// Permeable Pipe Visual
const PermeablePipeVisual = () => (
  <svg viewBox="0 0 280 80" className="w-full h-20 bg-secondary/30 rounded-lg">
    {/* Ground layers */}
    <rect x="20" y="15" width="240" height="20" fill="hsl(35, 30%, 60%)" fillOpacity="0.3" />
    <rect x="20" y="35" width="240" height="25" fill="hsl(35, 40%, 50%)" fillOpacity="0.3" />
    
    {/* Gravel bed */}
    <rect x="40" y="40" width="200" height="15" fill="hsl(35, 20%, 70%)" fillOpacity="0.5" stroke="hsl(35, 20%, 50%)" strokeWidth="1" strokeDasharray="3 2" />
    
    {/* Permeable pipe */}
    <ellipse cx="140" cy="47" rx="20" ry="12" fill="hsl(195, 90%, 55%)" fillOpacity="0.4" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    
    {/* Perforation indicators */}
    {[125, 135, 145, 155].map((x, i) => (
      <circle key={i} cx={x} cy="47" r="2" fill="hsl(195, 90%, 55%)" />
    ))}
    
    {/* Infiltration arrows */}
    <path d="M 100,30 L 100,38" stroke="hsl(195, 90%, 50%)" strokeWidth="1.5" markerEnd="url(#infiltArrow)" />
    <path d="M 140,30 L 140,35" stroke="hsl(195, 90%, 50%)" strokeWidth="1.5" markerEnd="url(#infiltArrow)" />
    <path d="M 180,30 L 180,38" stroke="hsl(195, 90%, 50%)" strokeWidth="1.5" markerEnd="url(#infiltArrow)" />
    
    {/* Exfiltration arrows */}
    <path d="M 130,55 L 130,65" stroke="hsl(140, 60%, 45%)" strokeWidth="1.5" markerEnd="url(#exfilArrow)" />
    <path d="M 150,55 L 150,65" stroke="hsl(140, 60%, 45%)" strokeWidth="1.5" markerEnd="url(#exfilArrow)" />
    
    <text x="70" y="12" className="text-[8px]" fill="hsl(195, 90%, 45%)">Infiltration</text>
    <text x="180" y="75" className="text-[8px]" fill="hsl(140, 60%, 40%)">Exfiltration</text>
    
    <defs>
      <marker id="infiltArrow" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
        <polygon points="0 0, 6 2, 0 4" fill="hsl(195, 90%, 50%)" />
      </marker>
      <marker id="exfilArrow" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
        <polygon points="0 0, 6 2, 0 4" fill="hsl(140, 60%, 45%)" />
      </marker>
    </defs>
  </svg>
);

// Swale Visual
const SwaleVisual = () => (
  <svg viewBox="0 0 280 80" className="w-full h-20 bg-secondary/30 rounded-lg">
    {/* Ground/Vegetation */}
    <path d="M 20,60 L 80,60 L 100,45 L 140,35 L 180,45 L 200,60 L 260,60" fill="none" stroke="hsl(140, 50%, 35%)" strokeWidth="3" />
    
    {/* Grass tufts */}
    {[30, 50, 70, 210, 230, 250].map((x, i) => (
      <g key={i}>
        <line x1={x} y1="60" x2={x-3} y2="52" stroke="hsl(140, 50%, 40%)" strokeWidth="1.5" />
        <line x1={x} y1="60" x2={x} y2="50" stroke="hsl(140, 50%, 40%)" strokeWidth="1.5" />
        <line x1={x} y1="60" x2={x+3} y2="52" stroke="hsl(140, 50%, 40%)" strokeWidth="1.5" />
      </g>
    ))}
    
    {/* Water in swale */}
    <path d="M 100,45 L 100,40 Q 140,32 180,40 L 180,45 L 140,35 Z" fill="hsl(195, 90%, 55%)" fillOpacity="0.4" />
    
    {/* Filter media layer */}
    <rect x="95" y="48" width="90" height="12" fill="hsl(35, 30%, 60%)" fillOpacity="0.4" stroke="hsl(35, 30%, 50%)" strokeWidth="1" strokeDasharray="2 2" />
    
    {/* Underdrain */}
    <ellipse cx="140" cy="55" rx="10" ry="5" fill="hsl(220, 10%, 50%)" fillOpacity="0.5" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    
    <text x="140" y="20" textAnchor="middle" className="text-[9px]" fill="hsl(140, 50%, 35%)">Vegetated Swale</text>
    <text x="140" y="75" textAnchor="middle" className="text-[8px]" fill="hsl(35, 30%, 45%)">Filter Media + Underdrain</text>
  </svg>
);

// Bioretention Visual
const BioretentionVisual = () => (
  <svg viewBox="0 0 280 80" className="w-full h-20 bg-secondary/30 rounded-lg">
    {/* Ponding area */}
    <rect x="60" y="15" width="160" height="15" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(195, 90%, 50%)" strokeWidth="1" strokeDasharray="3 2" />
    
    {/* Mulch layer */}
    <rect x="60" y="30" width="160" height="8" fill="hsl(25, 60%, 35%)" fillOpacity="0.5" />
    
    {/* Growing media */}
    <rect x="60" y="38" width="160" height="20" fill="hsl(35, 40%, 45%)" fillOpacity="0.4" />
    
    {/* Gravel storage */}
    <rect x="60" y="58" width="160" height="12" fill="hsl(35, 20%, 65%)" fillOpacity="0.4" stroke="hsl(35, 20%, 50%)" strokeWidth="1" />
    
    {/* Plants */}
    {[85, 140, 195].map((x, i) => (
      <g key={i}>
        <line x1={x} y1="30" x2={x} y2="15" stroke="hsl(140, 50%, 35%)" strokeWidth="2" />
        <circle cx={x} cy="12" r="6" fill="hsl(140, 50%, 40%)" fillOpacity="0.7" />
      </g>
    ))}
    
    {/* Underdrain */}
    <ellipse cx="140" cy="64" rx="12" ry="5" fill="hsl(220, 10%, 50%)" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    
    {/* Labels */}
    <text x="30" y="22" className="text-[7px]" fill="hsl(195, 90%, 45%)">Ponding</text>
    <text x="230" y="35" className="text-[7px]" fill="hsl(25, 60%, 30%)">Mulch</text>
    <text x="230" y="50" className="text-[7px]" fill="hsl(35, 40%, 35%)">Media</text>
    <text x="230" y="66" className="text-[7px]" fill="hsl(35, 20%, 45%)">Gravel</text>
  </svg>
);

export const SuDSSection = () => {
  const sudsTypes: SuDSCardProps[] = [
    {
      title: 'Permeable/Porous Pipe',
      category: 'infiltration',
      icon: <CircleDot className="w-5 h-5" />,
      description: 'Perforated or porous pipe systems that allow water to infiltrate into surrounding soils or exfiltrate from the pipe network. Used for source control and groundwater recharge.',
      icmFeatures: [
        'Conduit seepage/exfiltration modeling',
        'Permeability coefficient assignment',
        'Surrounding soil infiltration rate',
        'Head-dependent exfiltration calculation',
        'Integration with groundwater models',
      ],
      keyParameters: [
        { name: 'seepage_rate', description: 'Exfiltration rate (m³/s per m length)' },
        { name: 'soil_k', description: 'Surrounding soil permeability (m/s)' },
        { name: 'porosity', description: 'Bedding/surround void ratio' },
        { name: 'head_coefficient', description: 'Head-dependent loss factor' },
      ],
      visualComponent: <PermeablePipeVisual />,
    },
    {
      title: 'Swale / Vegetated Channel',
      category: 'conveyance',
      icon: <TreePine className="w-5 h-5" />,
      description: 'Shallow vegetated channels that convey, filter, and infiltrate stormwater runoff. Modeled as open channels with infiltration and evapotranspiration.',
      icmFeatures: [
        'Trapezoidal/irregular cross-section geometry',
        'Variable roughness for vegetation states',
        'Base infiltration rate modeling',
        'Underdrain connection to pipe network',
        'Seasonal vegetation growth factors',
      ],
      keyParameters: [
        { name: 'manning_n', description: 'Vegetation roughness (0.03-0.15)' },
        { name: 'infiltration', description: 'Base infiltration rate (mm/hr)' },
        { name: 'side_slope', description: 'Bank slope ratio (typically 3:1 to 5:1)' },
        { name: 'check_dam_spacing', description: 'Check dam intervals (m)' },
      ],
      visualComponent: <SwaleVisual />,
    },
    {
      title: 'Bioretention / Rain Garden',
      category: 'treatment',
      icon: <Filter className="w-5 h-5" />,
      description: 'Engineered depressions with layered filter media that provide storage, filtration, and biological treatment of stormwater.',
      icmFeatures: [
        'Multi-layer soil column modeling',
        'Ponding depth and surface area',
        'Filter media hydraulic conductivity',
        'Underdrain and overflow connections',
        'Pollutant removal efficiency factors',
      ],
      keyParameters: [
        { name: 'ponding_depth', description: 'Maximum ponding (150-300mm typical)' },
        { name: 'media_k', description: 'Filter conductivity (25-150 mm/hr)' },
        { name: 'media_depth', description: 'Growing media depth (450-900mm)' },
        { name: 'storage_void', description: 'Gravel layer void ratio (0.3-0.4)' },
      ],
      visualComponent: <BioretentionVisual />,
    },
    {
      title: 'Detention Basin',
      category: 'storage',
      icon: <Box className="w-5 h-5" />,
      description: 'Offline or online storage facilities that temporarily store runoff and release it at controlled rates to reduce peak flows downstream.',
      icmFeatures: [
        'Stage-area-volume curves',
        'Multiple outlet structures (orifice, weir, pipe)',
        'Real-time control (RTC) integration',
        'Sediment accumulation tracking',
        'Maintenance access level triggers',
      ],
      keyParameters: [
        { name: 'storage_curve', description: 'Depth-volume relationship' },
        { name: 'outlet_type', description: 'Orifice/weir/pipe outlet sizing' },
        { name: 'invert_level', description: 'Basin floor elevation (m)' },
        { name: 'design_storm', description: 'Target attenuation event' },
      ],
    },
    {
      title: 'Infiltration Trench',
      category: 'infiltration',
      icon: <ArrowDown className="w-5 h-5" />,
      description: 'Gravel-filled trenches that collect and infiltrate runoff into surrounding soils. Can include perforated pipes for distribution.',
      icmFeatures: [
        'Linear storage with infiltration',
        'Surrounding soil permeability',
        'Clogging factor time-decay',
        'Overflow connection to network',
        'Groundwater interaction modeling',
      ],
      keyParameters: [
        { name: 'trench_width', description: 'Excavation width (0.5-2.0m)' },
        { name: 'void_ratio', description: 'Aggregate porosity (0.3-0.4)' },
        { name: 'soil_infil', description: 'Native soil infiltration (mm/hr)' },
        { name: 'half_drain_time', description: 'Target emptying time (24-48hr)' },
      ],
    },
    {
      title: 'Permeable Pavement',
      category: 'infiltration',
      icon: <Layers className="w-5 h-5" />,
      description: 'Porous surface with underlying aggregate storage that allows rainfall to infiltrate through the surface and into the ground or underdrain system.',
      icmFeatures: [
        'Surface permeability modeling',
        'Sub-base storage volume',
        'Partial/full infiltration modes',
        'Underdrain throttle control',
        'Clogging and maintenance factors',
      ],
      keyParameters: [
        { name: 'surface_k', description: 'Surface permeability (mm/hr)' },
        { name: 'storage_depth', description: 'Sub-base depth (150-500mm)' },
        { name: 'pavement_slope', description: 'Surface gradient (%)' },
        { name: 'drain_delay', description: 'Underdrain activation time' },
      ],
    },
    {
      title: 'Green Roof',
      category: 'storage',
      icon: <Droplets className="w-5 h-5" />,
      description: 'Vegetated roof systems that provide rainfall retention, evapotranspiration, and delayed runoff through growing media storage.',
      icmFeatures: [
        'Substrate moisture balance',
        'Evapotranspiration calculation',
        'Seasonal plant growth factors',
        'Drainage layer modeling',
        'Overflow and drain connections',
      ],
      keyParameters: [
        { name: 'media_depth', description: 'Growing media depth (50-300mm)' },
        { name: 'field_capacity', description: 'Moisture retention capacity' },
        { name: 'wilting_point', description: 'Minimum moisture content' },
        { name: 'drain_coeff', description: 'Drainage layer conductivity' },
      ],
    },
    {
      title: 'Attenuation Tank',
      category: 'storage',
      icon: <Box className="w-5 h-5" />,
      description: 'Underground storage structures (geocellular, concrete, or pipe) providing controlled release of stored stormwater.',
      icmFeatures: [
        'Modular geocellular storage units',
        'Vortex/hydrobrake outlet modeling',
        'Real-time control integration',
        'Sump and pump-out capability',
        'Structural void ratio options',
      ],
      keyParameters: [
        { name: 'storage_vol', description: 'Total storage volume (m³)' },
        { name: 'outlet_flow', description: 'Controlled outlet rate (l/s)' },
        { name: 'invert', description: 'Tank floor level (m AOD)' },
        { name: 'void_ratio', description: 'Effective storage ratio (0.90-0.95)' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">SuDS & Permeable Solutions</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Sustainable Drainage Systems (SuDS) and permeable conduit features available in Autodesk InfoWorks ICM and ICM SWMM for green infrastructure modeling.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sudsTypes.map((type, i) => (
          <SuDSCard key={i} {...type} />
        ))}
      </div>

      {/* Permeable Conduit Technical Note */}
      <div className="bg-card border border-border rounded-xl p-4 mt-6">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <CircleDot className="w-5 h-5 text-primary" />
          Permeable Conduit Implementation in Autodesk InfoWorks ICM
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-foreground mb-2">Seepage/Exfiltration Model</h5>
            <p className="text-muted-foreground text-xs mb-2">
              ICM models conduit seepage using a head-dependent relationship where exfiltration rate depends on 
              the water level in the pipe relative to surrounding groundwater.
            </p>
            <div className="bg-secondary/30 rounded p-2 font-mono text-xs">
              Q_seep = K × L × (h_pipe - h_gw)
            </div>
            <p className="text-muted-foreground text-[10px] mt-1">
              where K = seepage coefficient, L = conduit length, h = head levels
            </p>
          </div>
          <div>
            <h5 className="font-medium text-foreground mb-2">Application Methods</h5>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                Set seepage rate on individual conduits
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                Apply via conduit flag/category for batch updates
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                Link to groundwater model for dynamic interaction
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                Use Ruby scripting for parametric sensitivity analysis
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
