import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Layers, Map, Play, Pause, RotateCcw, BookOpen, Calculator, Waves, Mountain } from 'lucide-react';
import { ViewMode, ChannelGeometry, HydraulicParams } from './types';
import { useHydraulicCalculations } from './useHydraulicCalculations';
import { CrossSectionView } from './CrossSectionView';
import { LongProfileView } from './LongProfileView';
import { PlanView } from './PlanView';
import { ControlPanel } from './ControlPanel';
import { ResultsPanel } from './ResultsPanel';
import { ICMConceptCard } from './ICMConceptCard';

const defaultGeometry: ChannelGeometry = {
  bottomWidth: 10,
  bankSlope: 2,
  channelDepth: 3,
  floodplainWidth: 20,
};

const defaultParams: HydraulicParams = {
  manningN: 0.035,
  manningNFloodplain: 0.08,
  bedSlope: 0.001,
  waterLevel: 2,
};

export const ChannelVisualizer = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('cross-section');
  const [geometry, setGeometry] = useState<ChannelGeometry>(defaultGeometry);
  const [params, setParams] = useState<HydraulicParams>(defaultParams);
  const [showFloodplain, setShowFloodplain] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  const results = useHydraulicCalculations(geometry, params, showFloodplain);

  const resetAll = () => {
    setGeometry(defaultGeometry);
    setParams(defaultParams);
    setShowFloodplain(false);
  };

  const viewModes = [
    { id: 'cross-section' as ViewMode, label: 'Cross-Section', icon: Layers },
    { id: 'long-profile' as ViewMode, label: 'Long Profile', icon: Eye },
    { id: 'plan-view' as ViewMode, label: 'Plan View', icon: Map },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* View Mode Tabs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-secondary rounded-lg p-1">
          {viewModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === mode.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              isAnimating ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm">{isAnimating ? 'Pause' : 'Animate'}</span>
          </button>
          <button
            onClick={resetAll}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors"
            title="Reset all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visualization Canvas */}
        <div className="lg:col-span-3 bg-card rounded-xl p-4 border border-border shadow-lg">
          <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {viewMode === 'cross-section' && (
              <CrossSectionView geometry={geometry} params={params} results={results} showFloodplain={showFloodplain} isAnimating={isAnimating} />
            )}
            {viewMode === 'long-profile' && (
              <LongProfileView geometry={geometry} params={params} results={results} isAnimating={isAnimating} />
            )}
            {viewMode === 'plan-view' && (
              <PlanView geometry={geometry} params={params} results={results} showFloodplain={showFloodplain} isAnimating={isAnimating} />
            )}
          </motion.div>
        </div>

        {/* Control Panel */}
        <ControlPanel
          geometry={geometry}
          params={params}
          showFloodplain={showFloodplain}
          onGeometryChange={setGeometry}
          onParamsChange={setParams}
          onFloodplainToggle={setShowFloodplain}
        />
      </div>

      {/* Results Panel */}
      <ResultsPanel results={results} />

      {/* ICM Concepts Section */}
      <div className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">ICM Hydraulic Concepts</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ICMConceptCard
            title="Conveyance (K)"
            icon={<Calculator className="w-5 h-5" />}
            formula="K = (1/n) × A × R^(2/3)"
            description="Conveyance represents the flow-carrying capacity of a channel section."
            details={[
              "Combines geometry and roughness into single value",
              "Q = K × √S (discharge from conveyance)",
              "Different K values for channel vs floodplain zones",
              "Used in compound channel calculations"
            ]}
            color="primary"
          />
          <ICMConceptCard
            title="Saint-Venant Equations"
            icon={<Waves className="w-5 h-5" />}
            formula="∂A/∂t + ∂Q/∂x = 0"
            description="The fundamental equations governing unsteady open-channel flow."
            details={[
              "Continuity: mass conservation (∂A/∂t + ∂Q/∂x = q)",
              "Momentum: force balance along flow direction",
              "Solved numerically using finite difference methods",
              "ICM uses Preissmann implicit scheme"
            ]}
            color="water"
          />
          <ICMConceptCard
            title="Roughness Zones"
            icon={<Mountain className="w-5 h-5" />}
            formula="n = 0.015 to 0.15"
            description="Different Manning's n values applied to distinct parts of the cross-section."
            details={[
              "Main channel: typically 0.025-0.045",
              "Floodplain: typically 0.05-0.15 (vegetation)",
              "Bank markers define zone boundaries",
              "Composite roughness calculated for total section"
            ]}
            color="terrain"
          />
        </div>
      </div>
    </div>
  );
};
