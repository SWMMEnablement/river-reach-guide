import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Circle, Hexagon, ArrowUpCircle, Minus } from 'lucide-react';

interface ConduitTypeCardProps {
  title: string;
  swmmCode: string;
  icon: React.ReactNode;
  formula: string;
  description: string;
  geometryParams: { name: string; symbol: string; description: string }[];
  typicalUse: string[];
  color: 'water' | 'primary' | 'terrain' | 'warning';
  visualComponent: React.ReactNode;
}

const ConduitTypeCard = ({ title, swmmCode, icon, formula, description, geometryParams, typicalUse, color, visualComponent }: ConduitTypeCardProps) => {
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
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{title}</h4>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                {swmmCode}
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{formula}</p>
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
                      <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded min-w-[50px] text-center">{param.symbol}</span>
                      <span className="font-medium text-foreground">{param.name}:</span>
                      <span className="text-muted-foreground">{param.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-3">
                <h5 className="text-xs font-semibold text-foreground mb-2">Typical Applications:</h5>
                <ul className="space-y-1">
                  {typicalUse.map((use, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// SVG Visualizations for each conduit type
const EggVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-20">
    <ellipse cx="100" cy="50" rx="25" ry="20" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <ellipse cx="100" cy="30" rx="18" ry="15" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="75" y1="50" x2="85" y2="50" stroke="hsl(220, 10%, 50%)" strokeWidth="1" />
    <line x1="115" y1="50" x2="125" y2="50" stroke="hsl(220, 10%, 50%)" strokeWidth="1" />
    <line x1="100" y1="70" x2="100" y2="15" stroke="hsl(30, 90%, 50%)" strokeWidth="1.5" strokeDasharray="3 2" />
    <text x="110" y="45" className="text-[8px]" fill="hsl(30, 90%, 45%)">H</text>
    <text x="145" y="50" className="text-[9px]" fill="hsl(210, 15%, 50%)">Egg Shape</text>
  </svg>
);

const HorseshoeVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-20">
    <path d="M 70,70 L 70,40 Q 70,20 100,20 Q 130,20 130,40 L 130,70 Z" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="70" y1="70" x2="130" y2="70" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="100" y1="70" x2="100" y2="20" stroke="hsl(30, 90%, 50%)" strokeWidth="1.5" strokeDasharray="3 2" />
    <text x="105" y="50" className="text-[8px]" fill="hsl(30, 90%, 45%)">H</text>
    <line x1="70" y1="75" x2="130" y2="75" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    <text x="100" y="78" textAnchor="middle" className="text-[7px]" fill="hsl(210, 15%, 50%)">W</text>
    <text x="155" y="50" className="text-[9px]" fill="hsl(210, 15%, 50%)">Horseshoe</text>
  </svg>
);

const GothicVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-20">
    <path d="M 70,70 L 70,45 Q 85,10 100,10 Q 115,10 130,45 L 130,70 Z" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="70" y1="70" x2="130" y2="70" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="100" y1="70" x2="100" y2="10" stroke="hsl(30, 90%, 50%)" strokeWidth="1.5" strokeDasharray="3 2" />
    <text x="105" y="45" className="text-[8px]" fill="hsl(30, 90%, 45%)">H</text>
    <text x="155" y="50" className="text-[9px]" fill="hsl(210, 15%, 50%)">Gothic</text>
  </svg>
);

const CatenaryVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-20">
    <path d="M 65,70 Q 65,35 100,20 Q 135,35 135,70 Z" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="65" y1="70" x2="135" y2="70" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <path d="M 70,65 Q 100,25 130,65" fill="none" stroke="hsl(30, 90%, 50%)" strokeWidth="1" strokeDasharray="2 2" />
    <text x="105" y="50" className="text-[8px]" fill="hsl(30, 90%, 45%)">catenary</text>
    <text x="155" y="50" className="text-[9px]" fill="hsl(210, 15%, 50%)">Catenary</text>
  </svg>
);

const SemiEllipticalVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-20">
    <ellipse cx="100" cy="55" rx="35" ry="25" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <rect x="65" y="55" width="70" height="20" fill="hsl(var(--background))" />
    <line x1="65" y1="55" x2="135" y2="55" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="100" y1="55" x2="100" y2="30" stroke="hsl(30, 90%, 50%)" strokeWidth="1.5" strokeDasharray="3 2" />
    <text x="105" y="45" className="text-[8px]" fill="hsl(30, 90%, 45%)">H</text>
    <line x1="65" y1="60" x2="135" y2="60" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    <text x="100" y="68" textAnchor="middle" className="text-[7px]" fill="hsl(210, 15%, 50%)">W</text>
    <text x="155" y="45" className="text-[9px]" fill="hsl(210, 15%, 50%)">Semi-</text>
    <text x="155" y="55" className="text-[9px]" fill="hsl(210, 15%, 50%)">Elliptical</text>
  </svg>
);

const BasketHandleVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-20">
    <path d="M 60,60 Q 60,30 80,25 Q 100,20 120,25 Q 140,30 140,60 Z" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="60" y1="60" x2="140" y2="60" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="100" y1="60" x2="100" y2="20" stroke="hsl(30, 90%, 50%)" strokeWidth="1.5" strokeDasharray="3 2" />
    <text x="105" y="42" className="text-[8px]" fill="hsl(30, 90%, 45%)">H</text>
    <text x="155" y="45" className="text-[9px]" fill="hsl(210, 15%, 50%)">Basket</text>
    <text x="155" y="55" className="text-[9px]" fill="hsl(210, 15%, 50%)">Handle</text>
  </svg>
);

const ModBasketHandleVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-20">
    <path d="M 55,60 L 55,45 Q 55,25 80,20 Q 100,15 120,20 Q 145,25 145,45 L 145,60 Z" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="55" y1="60" x2="145" y2="60" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="100" y1="60" x2="100" y2="15" stroke="hsl(30, 90%, 50%)" strokeWidth="1.5" strokeDasharray="3 2" />
    <text x="105" y="40" className="text-[8px]" fill="hsl(30, 90%, 45%)">H</text>
    <text x="155" y="40" className="text-[9px]" fill="hsl(210, 15%, 50%)">Modified</text>
    <text x="155" y="50" className="text-[9px]" fill="hsl(210, 15%, 50%)">Basket</text>
    <text x="155" y="60" className="text-[9px]" fill="hsl(210, 15%, 50%)">Handle</text>
  </svg>
);

const ArchVisual = () => (
  <svg viewBox="0 0 200 80" className="w-full h-20">
    <path d="M 65,60 Q 65,25 100,20 Q 135,25 135,60 Z" fill="hsl(195, 90%, 55%)" fillOpacity="0.3" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="65" y1="60" x2="135" y2="60" stroke="hsl(220, 10%, 50%)" strokeWidth="2" />
    <line x1="100" y1="60" x2="100" y2="20" stroke="hsl(30, 90%, 50%)" strokeWidth="1.5" strokeDasharray="3 2" />
    <text x="105" y="45" className="text-[8px]" fill="hsl(30, 90%, 45%)">Rise</text>
    <line x1="65" y1="65" x2="135" y2="65" stroke="hsl(220, 10%, 40%)" strokeWidth="1" />
    <text x="100" y="73" textAnchor="middle" className="text-[7px]" fill="hsl(210, 15%, 50%)">Span</text>
    <text x="155" y="50" className="text-[9px]" fill="hsl(210, 15%, 50%)">Arch</text>
  </svg>
);

export const SWMM5ConduitsSection = () => {
  const conduitTypes: ConduitTypeCardProps[] = [
    {
      title: 'Egg / Ovoid',
      swmmCode: 'EGG',
      icon: <Circle className="w-5 h-5" />,
      formula: 'A ≈ 0.5105 × H²',
      description: 'Traditional sewer shape with larger radius at bottom for self-cleansing at low flows. The narrow top reduces excavation width.',
      geometryParams: [
        { name: 'Geom1', symbol: 'H', description: 'Full height (m)' },
        { name: 'Width', symbol: 'W', description: 'W = 2/3 × H (fixed ratio)' },
      ],
      typicalUse: [
        'Combined sewer systems (CSO)',
        'Victorian-era brick sewers',
        'Self-cleansing requirements at low flows',
      ],
      color: 'primary',
      visualComponent: <EggVisual />,
    },
    {
      title: 'Horseshoe',
      swmmCode: 'HORSESHOE',
      icon: <ArrowUpCircle className="w-5 h-5" />,
      formula: 'A ≈ 0.8293 × H²',
      description: 'Flat-bottomed arch shape used in large tunnels. Provides good hydraulic efficiency with easier invert construction.',
      geometryParams: [
        { name: 'Geom1', symbol: 'H', description: 'Full height (m)' },
        { name: 'Width', symbol: 'W', description: 'W ≈ H (typically)' },
      ],
      typicalUse: [
        'Large storm tunnels',
        'Combined sewer overflows',
        'Deep tunnel storage systems',
      ],
      color: 'water',
      visualComponent: <HorseshoeVisual />,
    },
    {
      title: 'Gothic',
      swmmCode: 'GOTHIC',
      icon: <Hexagon className="w-5 h-5" />,
      formula: 'A ≈ 0.6554 × H²',
      description: 'Pointed arch shape with vertical sides. Common in older European masonry sewers with high strength-to-material ratio.',
      geometryParams: [
        { name: 'Geom1', symbol: 'H', description: 'Full height (m)' },
        { name: 'Width', symbol: 'W', description: 'W ≈ 0.84 × H' },
      ],
      typicalUse: [
        'Historic masonry sewers',
        'Stone arch construction',
        'Heritage infrastructure rehabilitation',
      ],
      color: 'terrain',
      visualComponent: <GothicVisual />,
    },
    {
      title: 'Catenary',
      swmmCode: 'CATENARY',
      icon: <Minus className="w-5 h-5" />,
      formula: 'A ≈ 0.6435 × H²',
      description: 'Follows natural hanging chain curve. Structurally efficient for large spans under uniform loading.',
      geometryParams: [
        { name: 'Geom1', symbol: 'H', description: 'Full height (m)' },
        { name: 'Width', symbol: 'W', description: 'W ≈ 0.9 × H' },
      ],
      typicalUse: [
        'Large span tunnels',
        'Pressure tunnels',
        'Structurally optimized sections',
      ],
      color: 'primary',
      visualComponent: <CatenaryVisual />,
    },
    {
      title: 'Semi-Elliptical',
      swmmCode: 'SEMIELLIPTICAL',
      icon: <Circle className="w-5 h-5" />,
      formula: 'A = (π × W × H) / 4',
      description: 'Half-ellipse on flat base. Good hydraulic properties with easy bottom construction for sediment handling.',
      geometryParams: [
        { name: 'Geom1', symbol: 'H', description: 'Full height (rise) (m)' },
        { name: 'Geom2', symbol: 'W', description: 'Full width (span) (m)' },
      ],
      typicalUse: [
        'Wide shallow sewers',
        'Rectangular tunnel alternatives',
        'Industrial drainage systems',
      ],
      color: 'water',
      visualComponent: <SemiEllipticalVisual />,
    },
    {
      title: 'Basket Handle',
      swmmCode: 'BASKETHANDLE',
      icon: <ArrowUpCircle className="w-5 h-5" />,
      formula: 'A ≈ 0.7862 × H × W',
      description: 'Three-centered arch with flatter crown and steeper sides. Traditional brick sewer construction shape.',
      geometryParams: [
        { name: 'Geom1', symbol: 'H', description: 'Full height (m)' },
        { name: 'Geom2', symbol: 'W', description: 'Full width (m)' },
      ],
      typicalUse: [
        'Traditional brick sewers',
        'Railway and canal tunnels',
        'Rehabilitation of historic infrastructure',
      ],
      color: 'terrain',
      visualComponent: <BasketHandleVisual />,
    },
    {
      title: 'Modified Basket Handle',
      swmmCode: 'MODBASKETHANDLE',
      icon: <Hexagon className="w-5 h-5" />,
      formula: 'A ≈ 0.82 × H × W',
      description: 'Basket handle with vertical side walls for easier construction in cut-and-cover applications.',
      geometryParams: [
        { name: 'Geom1', symbol: 'H', description: 'Full height (m)' },
        { name: 'Geom2', symbol: 'W', description: 'Full width (m)' },
      ],
      typicalUse: [
        'Modern cut-and-cover tunnels',
        'Box culvert alternatives',
        'Large diameter storm sewers',
      ],
      color: 'warning',
      visualComponent: <ModBasketHandleVisual />,
    },
    {
      title: 'Arch',
      swmmCode: 'ARCH',
      icon: <ArrowUpCircle className="w-5 h-5" />,
      formula: 'A = f(span, rise)',
      description: 'General arch shape defined by span and rise. Used for culverts and natural bottom channels.',
      geometryParams: [
        { name: 'Geom1', symbol: 'H', description: 'Rise (height) (m)' },
        { name: 'Geom2', symbol: 'W', description: 'Span (width) (m)' },
      ],
      typicalUse: [
        'Stream crossings with natural bed',
        'Low-profile culverts',
        'Fish passage structures',
      ],
      color: 'primary',
      visualComponent: <ArchVisual />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">SWMM5 Closed Conduit Shapes</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Non-circular closed conduit cross-sections available in EPA SWMM5 and ICM SWMM for sewer and tunnel modeling.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {conduitTypes.map((type, i) => (
          <ConduitTypeCard key={i} {...type} />
        ))}
      </div>
    </div>
  );
};
