import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Leaf, Droplets, Home, TreePine, Layers, Container, Waves } from 'lucide-react';

interface LIDCardProps {
  title: string;
  swmmCode: string;
  icon: React.ReactNode;
  description: string;
  layers: { name: string; parameters: string[] }[];
  designCriteria: string[];
  color: 'green' | 'blue' | 'brown' | 'purple';
}

const LIDCard = ({ title, swmmCode, icon, description, layers, designCriteria, color }: LIDCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorClasses = {
    green: 'bg-green-50 border-green-300/50 hover:border-green-400/60 dark:bg-green-950/20',
    blue: 'bg-blue-50 border-blue-300/50 hover:border-blue-400/60 dark:bg-blue-950/20',
    brown: 'bg-amber-50 border-amber-300/50 hover:border-amber-400/60 dark:bg-amber-950/20',
    purple: 'bg-purple-50 border-purple-300/50 hover:border-purple-400/60 dark:bg-purple-950/20',
  };

  const iconColors = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    brown: 'text-amber-600',
    purple: 'text-purple-600',
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
          <div className={`p-2 rounded-lg bg-white shadow-sm ${iconColors[color]}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{title}</h4>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                {swmmCode}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
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
              <div>
                <h5 className="text-xs font-semibold text-foreground mb-2">Layer Parameters (EPA SWMM):</h5>
                <div className="space-y-3">
                  {layers.map((layer, i) => (
                    <div key={i} className="bg-secondary/30 rounded-lg p-2">
                      <h6 className="text-xs font-medium text-foreground mb-1">{layer.name}</h6>
                      <div className="flex flex-wrap gap-1">
                        {layer.parameters.map((param, j) => (
                          <span key={j} className="text-[10px] font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-muted-foreground">
                            {param}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-xs font-semibold text-foreground mb-2">Design Criteria:</h5>
                <ul className="space-y-1">
                  {designCriteria.map((criteria, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {criteria}
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

export const LIDControlsSection = () => {
  const lidTypes: LIDCardProps[] = [
    {
      title: 'Bio-Retention Cell',
      swmmCode: 'BC',
      icon: <Leaf className="w-5 h-5" />,
      description: 'Engineered depression with layered soil media that captures, filters, and infiltrates stormwater runoff through biological and physical processes.',
      layers: [
        { name: 'Surface Layer', parameters: ['Berm Height (mm)', 'Vegetation Volume Fraction', 'Surface Roughness (Manning n)', 'Surface Slope (%)'] },
        { name: 'Soil Layer', parameters: ['Thickness (mm)', 'Porosity', 'Field Capacity', 'Wilting Point', 'Conductivity (mm/hr)', 'Conductivity Slope', 'Suction Head (mm)'] },
        { name: 'Storage Layer', parameters: ['Thickness (mm)', 'Void Ratio', 'Seepage Rate (mm/hr)', 'Clogging Factor'] },
        { name: 'Underdrain', parameters: ['Drain Coefficient', 'Drain Exponent', 'Drain Offset (mm)', 'Drain Delay (hrs)'] },
      ],
      designCriteria: [
        'Ponding depth: 150-300mm typical',
        'Soil media depth: 450-900mm',
        'Infiltration rate: 25-150 mm/hr',
        'Drawdown time: 24-48 hours',
      ],
      color: 'green',
    },
    {
      title: 'Rain Garden',
      swmmCode: 'RG',
      icon: <TreePine className="w-5 h-5" />,
      description: 'Shallow landscaped depression planted with native vegetation that collects and absorbs runoff from impervious surfaces.',
      layers: [
        { name: 'Surface Layer', parameters: ['Berm Height (mm)', 'Vegetation Volume', 'Surface Roughness', 'Surface Slope'] },
        { name: 'Soil Layer', parameters: ['Thickness (mm)', 'Porosity', 'Field Capacity', 'Wilting Point', 'Conductivity (mm/hr)'] },
      ],
      designCriteria: [
        'Area: 5-10% of contributing drainage area',
        'Ponding depth: 100-200mm',
        'Side slopes: 3:1 or flatter',
        'Native plant species preferred',
      ],
      color: 'green',
    },
    {
      title: 'Green Roof',
      swmmCode: 'GR',
      icon: <Home className="w-5 h-5" />,
      description: 'Vegetated roof system that retains rainfall, reduces runoff, and provides evapotranspiration cooling benefits.',
      layers: [
        { name: 'Surface Layer', parameters: ['Berm Height (mm)', 'Vegetation Volume Fraction', 'Surface Roughness', 'Surface Slope (%)'] },
        { name: 'Soil Layer', parameters: ['Thickness (mm)', 'Porosity', 'Field Capacity', 'Wilting Point', 'Conductivity (mm/hr)', 'Conductivity Slope'] },
        { name: 'Drainage Mat', parameters: ['Thickness (mm)', 'Void Fraction', 'Roughness (Manning n)'] },
      ],
      designCriteria: [
        'Extensive: 50-150mm media depth',
        'Intensive: 150-300mm+ media depth',
        'Roof load capacity: 100-150 kg/m² saturated',
        'Drainage slope: minimum 2%',
      ],
      color: 'purple',
    },
    {
      title: 'Infiltration Trench',
      swmmCode: 'IT',
      icon: <Layers className="w-5 h-5" />,
      description: 'Gravel-filled excavation that collects runoff and allows it to infiltrate into surrounding native soils.',
      layers: [
        { name: 'Surface Layer', parameters: ['Berm Height (mm)', 'Vegetation Volume', 'Surface Roughness', 'Surface Slope (%)'] },
        { name: 'Storage Layer', parameters: ['Thickness (mm)', 'Void Ratio', 'Seepage Rate (mm/hr)', 'Clogging Factor'] },
      ],
      designCriteria: [
        'Width: 0.6-2.4m typical',
        'Depth: 0.9-1.8m typical',
        'Aggregate void ratio: 0.30-0.40',
        'Native soil infiltration: >13 mm/hr required',
      ],
      color: 'brown',
    },
    {
      title: 'Permeable Pavement',
      swmmCode: 'PP',
      icon: <Layers className="w-5 h-5" />,
      description: 'Porous surface with aggregate base that allows rainfall to infiltrate through the surface and into underlying storage.',
      layers: [
        { name: 'Surface Layer', parameters: ['Berm Height (mm)', 'Vegetation Volume', 'Surface Roughness', 'Surface Slope (%)'] },
        { name: 'Pavement Layer', parameters: ['Thickness (mm)', 'Void Ratio', 'Impervious Surface Fraction', 'Permeability (mm/hr)', 'Clogging Factor'] },
        { name: 'Storage Layer', parameters: ['Thickness (mm)', 'Void Ratio', 'Seepage Rate (mm/hr)', 'Clogging Factor'] },
        { name: 'Underdrain', parameters: ['Drain Coefficient', 'Drain Exponent', 'Drain Offset (mm)', 'Drain Delay (hrs)'] },
      ],
      designCriteria: [
        'Surface permeability: 250-7500 mm/hr (new)',
        'Base course depth: 150-450mm',
        'Subbase storage: 150-300mm',
        'Maintenance: vacuum sweeping 2-4x/year',
      ],
      color: 'brown',
    },
    {
      title: 'Rain Barrel / Cistern',
      swmmCode: 'RB',
      icon: <Container className="w-5 h-5" />,
      description: 'Storage container that captures and stores roof runoff for later reuse in irrigation or non-potable applications.',
      layers: [
        { name: 'Storage Layer', parameters: ['Barrel Height (mm)', 'Drain Coefficient', 'Drain Exponent', 'Drain Offset (mm)', 'Drain Delay (hrs)'] },
      ],
      designCriteria: [
        'Residential: 190-380 liters typical',
        'Commercial cisterns: 3,800-38,000 liters',
        'Overflow connection required',
        'First flush diverter recommended',
      ],
      color: 'blue',
    },
    {
      title: 'Vegetative Swale',
      swmmCode: 'VS',
      icon: <Waves className="w-5 h-5" />,
      description: 'Vegetated channel that conveys, filters, and infiltrates stormwater while providing pollutant removal through vegetation.',
      layers: [
        { name: 'Surface Layer', parameters: ['Berm Height (mm)', 'Vegetation Volume Fraction', 'Surface Roughness (Manning n)', 'Surface Slope (%)', 'Side Slope'] },
        { name: 'Soil Layer', parameters: ['Thickness (mm)', 'Porosity', 'Field Capacity', 'Wilting Point', 'Conductivity (mm/hr)'] },
      ],
      designCriteria: [
        'Bottom width: 0.6-2.4m',
        'Side slopes: 3:1 or flatter',
        'Longitudinal slope: 1-6%',
        'Check dams for slopes >4%',
      ],
      color: 'green',
    },
    {
      title: 'Rooftop Disconnection',
      swmmCode: 'RD',
      icon: <Droplets className="w-5 h-5" />,
      description: 'Redirects roof runoff onto pervious areas such as lawns or gardens instead of directly to the drainage system.',
      layers: [
        { name: 'Surface Layer', parameters: ['Berm Height (mm)', 'Vegetation Volume', 'Surface Roughness', 'Surface Slope (%)'] },
      ],
      designCriteria: [
        'Receiving area: 2x roof area minimum',
        'Maximum flow path: 23m',
        'Maximum slope: 5%',
        'Soil infiltration: >13 mm/hr',
      ],
      color: 'blue',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">ICM SWMM LID Controls</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Low Impact Development (LID) controls available in EPA SWMM5 and ICM SWMM for green infrastructure and sustainable drainage modeling.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {lidTypes.map((lid, i) => (
          <LIDCard key={i} {...lid} />
        ))}
      </div>

      {/* LID Usage Editor Reference */}
      <div className="bg-card border border-border rounded-xl p-4 mt-4">
        <h4 className="font-semibold text-foreground mb-3">LID Usage in ICM SWMM</h4>
        <p className="text-sm text-muted-foreground mb-3">
          LID controls are assigned to subcatchments via the LID Usage Editor. Each LID unit is defined by:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-secondary/30 rounded-lg p-3">
            <h5 className="font-medium text-foreground mb-1">Placement</h5>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>• Number of replicate units</li>
              <li>• Area of each unit (m² or ft²)</li>
              <li>• Width of each unit (m or ft)</li>
              <li>• % impervious area treated</li>
            </ul>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3">
            <h5 className="font-medium text-foreground mb-1">Initial Conditions</h5>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>• Initial saturation (%)</li>
              <li>• Impervious surface treated</li>
              <li>• Send outflow to pervious</li>
              <li>• Report detailed results</li>
            </ul>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3">
            <h5 className="font-medium text-foreground mb-1">Routing Options</h5>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>• Route to subcatchment outlet</li>
              <li>• Route to pervious area</li>
              <li>• Route to another LID</li>
              <li>• Drain to node/outfall</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
