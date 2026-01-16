import { motion } from 'framer-motion';
import { Activity, Droplets, Ruler, Waves, Zap } from 'lucide-react';
import { HydraulicResults } from './types';

interface Props {
  results: HydraulicResults;
}

export const ResultsPanel = ({ results }: Props) => {
  const flowRegime = results.froudeNumber > 1 ? 'Supercritical' : 'Subcritical';
  const flowRegimeColor = results.froudeNumber > 1 ? 'text-orange-500' : 'text-green-600';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Geometry Results */}
      <motion.div 
        className="bg-card rounded-xl p-4 border border-border shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Ruler className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Geometry</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Area (A)</span>
            <span className="text-sm font-mono font-medium">{results.area.toFixed(2)} m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Wet. Perimeter</span>
            <span className="text-sm font-mono font-medium">{results.wettedPerimeter.toFixed(2)} m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Top Width</span>
            <span className="text-sm font-mono font-medium">{results.topWidth.toFixed(2)} m</span>
          </div>
        </div>
      </motion.div>

      {/* Hydraulic Radius */}
      <motion.div 
        className="bg-card rounded-xl p-4 border border-border shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-water" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hydraulic R</span>
        </div>
        <div className="text-center py-2">
          <p className="text-3xl font-bold text-water font-mono">{results.hydraulicRadius.toFixed(3)}</p>
          <p className="text-xs text-muted-foreground mt-1">R = A/P (meters)</p>
        </div>
      </motion.div>

      {/* Flow Results */}
      <motion.div 
        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Waves className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">Flow</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Velocity (V)</span>
            <span className="text-sm font-mono font-bold text-primary">{results.velocity.toFixed(3)} m/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Discharge (Q)</span>
            <span className="text-sm font-mono font-bold text-primary">{results.discharge.toFixed(3)} m³/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Conveyance</span>
            <span className="text-sm font-mono font-medium">{results.conveyance.toFixed(1)} m³/s</span>
          </div>
        </div>
      </motion.div>

      {/* Froude Number */}
      <motion.div 
        className="bg-card rounded-xl p-4 border border-border shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Flow Regime</span>
        </div>
        <div className="text-center py-2">
          <p className={`text-3xl font-bold font-mono ${flowRegimeColor}`}>
            {results.froudeNumber.toFixed(3)}
          </p>
          <p className={`text-xs font-medium mt-1 ${flowRegimeColor}`}>
            Fr {results.froudeNumber > 1 ? '> 1' : '< 1'} ({flowRegime})
          </p>
        </div>
      </motion.div>
    </div>
  );
};
